import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createHash, createHmac } from 'crypto';
import { ENV } from '@/core/config/env';

const BACKEND_URL = ENV.BACKEND_URL;
const INTERNAL_PROXY_SECRET = ENV.INTERNAL_PROXY_SECRET;
const ADMIN_API_KEY = ENV.ADMIN_API_KEY.trim();
const ADMIN_SECRET_KEY = ENV.ADMIN_SECRET_KEY.trim();

/**
 * Proxy API Route Handler
 * Forwards all /api/v1/* requests to the backend server
 * Handles encryption/decryption of auth tokens/sessions in cookies
 */
async function proxyRequest(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  const { path } = await params;
  const targetPath = `/api/v1/${path.join('/')}`;
  const targetUrl = `${BACKEND_URL}${targetPath}`;

  // Get search params
  const searchParams = request.nextUrl.searchParams.toString();
  const fullUrl = searchParams ? `${targetUrl}?${searchParams}` : targetUrl;

  // 1. Decrypt Cookies & Inject Headers
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session_id')?.value;
  
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    // Do not forward transport/compression headers that can break proxy decoding.
    const lower = key.toLowerCase();
    const forbiddenHeaders = ['host', 'cookie', 'accept-encoding', 'connection', 'keep-alive'];
    if (!forbiddenHeaders.includes(lower)) {
      headers.set(key, value);
    }
  });
  if (INTERNAL_PROXY_SECRET) {
    headers.set('X-Internal-Proxy-Secret', INTERNAL_PROXY_SECRET);
  }

  // Inject Session ID if available (Priority)
  if (sessionId) {
    headers.set('X-Session-Id', sessionId);
     console.log(`[Proxy] Injected Session Header for ${targetPath}`);
  }

  try {
    let usedAdminFallback = false;
    // Get request body for non-GET requests
    let body = '';
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      body = await request.text();
    }

    // Forward API Key Headers (explicitly ensure they are passed if present)
    const incomingApiKey = request.headers.get('X-Api-Key');
    if (incomingApiKey) {
      headers.set('X-Api-Key', incomingApiKey);
      const timestamp = request.headers.get('X-Timestamp');
      const signature = request.headers.get('X-Signature');
      if (timestamp) headers.set('X-Timestamp', timestamp);
      if (signature) headers.set('X-Signature', signature);
      console.log(`[Proxy] Forwarding API Key headers for ${targetPath}`);
    }

    // Fallback for public app payment flow:
    // if user is not logged in and no API key headers are provided,
    // sign /v1/payment-app using admin API credentials from env.
    const hasForwardedApiHeaders = headers.has('X-Api-Key') && headers.has('X-Timestamp') && headers.has('X-Signature');
    const isPaymentAppEndpoint = targetPath === '/api/v1/payment-app';
    if (!sessionId && !hasForwardedApiHeaders && isPaymentAppEndpoint && ADMIN_API_KEY && ADMIN_SECRET_KEY) {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const pathForSigning = searchParams ? `${targetPath}?${searchParams}` : targetPath;
      const bodyHash = createHash('sha256').update(body).digest('hex');
      const payload = `${timestamp}${request.method.toUpperCase()}${pathForSigning}${bodyHash}`;
      const signature = createHmac('sha256', ADMIN_SECRET_KEY).update(payload).digest('hex');

      headers.set('X-Api-Key', ADMIN_API_KEY);
      headers.set('X-Timestamp', timestamp);
      headers.set('X-Signature', signature);
      usedAdminFallback = true;
      console.log(`[Proxy] Injected ADMIN_API_KEY signature for ${targetPath}`);
    }

    // Forward the request to backend
    const response = await fetch(fullUrl, {
      method: request.method,
      headers,
      body: body || undefined,
    });

    console.log(`[Proxy] ${request.method} ${targetPath} -> ${response.status} ${response.statusText}`);

    // Get response data
    const contentType = response.headers.get('content-type');
    let data: any;
    let rawData: string | ArrayBuffer;

    if (contentType?.includes('application/json')) {
      const text = await response.text();
      rawData = text;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        data = {};
      }
    } else {
      rawData = await response.arrayBuffer();
    }

    // Intercept Auth/Refresh endpoints to manage cookies
    const isLoginRegister = (path.includes('login') || path.includes('register')) && path.includes('auth');
    const isRefresh = path.includes('refresh') && path.includes('auth');
    
    if ((isLoginRegister || isRefresh) && response.ok && data) {
      const resultData = data.data || data;
      const responseSessionId = resultData.sessionId;

      if (responseSessionId) {
        // Prepare response without sensitive tokens/session in body
        const { accessToken: _, refreshToken: __, sessionId: ___, ...rest } = resultData;
        const responseBody = data.data ? { ...data, data: rest } : rest;

        const nextResp = NextResponse.json(responseBody, { status: 200 });

        // Set Session ID Cookie (HttpOnly)
        if (responseSessionId) {
             nextResp.cookies.set('session_id', responseSessionId, {
                httpOnly: true,
                secure: ENV.IS_PRODUCTION,
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 60 * 24 // 24h
             });
        }

        // Strict session-first mode: do not expose access/refresh tokens to client cookies.
        nextResp.cookies.delete('token');
        nextResp.cookies.delete('refresh_token');

        return nextResp;
      }
    }

    // Standard Response Handling
    if (
      isPaymentAppEndpoint &&
      usedAdminFallback &&
      response.status === 401 &&
      typeof data?.error === 'string' &&
      data.error.toLowerCase().includes('invalid api key')
    ) {
      return NextResponse.json(
        {
          error:
            'ADMIN_API_KEY / ADMIN_SECRET_KEY tidak valid atau tidak terdaftar di tabel api_keys backend.',
        },
        { status: 401 }
      );
    }

    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      // Skip hop-by-hop and compression/length headers. The runtime fetch may already
      // return a decompressed body, so forwarding these headers as-is can produce
      // ERR_CONTENT_DECODING_FAILED on Netlify/browser clients.
      if (!['transfer-encoding', 'connection', 'keep-alive', 'content-encoding', 'content-length', 'content-type'].includes(key.toLowerCase())) {
        responseHeaders.set(key, value);
      }
    });
    // Prevent edge/CDN layers from transforming proxy API bodies. This is important on
    // Netlify where additional compression can reintroduce decoding mismatches.
    responseHeaders.set('Cache-Control', 'no-store, no-transform');

    if (contentType?.includes('application/json')) {
      return NextResponse.json(data ?? {}, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    }

    const passthroughContentType = contentType || 'application/octet-stream';
    responseHeaders.set('Content-Type', passthroughContentType);

    return new NextResponse(rawData, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error(`[Proxy] Error forwarding ${request.method} to ${fullUrl}:`, error);
    return NextResponse.json(
      { error: 'Failed to connect to backend server', target: fullUrl },
      { status: 502 }
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const DELETE = proxyRequest;
export const PATCH = proxyRequest;
