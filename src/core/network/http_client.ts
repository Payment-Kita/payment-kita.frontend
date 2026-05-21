import { ENV } from '../config/env';
import { hmacSha256, sha256 } from '@/core/utils/crypto';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status?: number;
  code?: string;
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

interface HttpClientOptions {
  includeCredentials?: boolean;
  enableAutoRefresh?: boolean;
  enableRequestSigning?: boolean;
}

export class HttpClient {
  private baseUrl: string;
  private includeCredentials: boolean;
  private enableAutoRefresh: boolean;
  private enableRequestSigning: boolean;
  private apiKey: string | null = null;
  private secretKey: string | null = null;

  constructor(baseUrl: string, options: HttpClientOptions = {}) {
    this.baseUrl = baseUrl;
    this.includeCredentials = options.includeCredentials ?? true;
    this.enableAutoRefresh = options.enableAutoRefresh ?? true;
    this.enableRequestSigning = options.enableRequestSigning ?? false;
  }

  setCredentials(apiKey: string, secretKey: string) {
    this.apiKey = apiKey;
    this.secretKey = secretKey;
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');

    // Note: Authorization header is now injected by the Next.js Proxy (route.ts)
    // using the HTTP-only cookie. Client does not handle tokens.

    try {
      const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
      const method = (options.method || 'GET').toUpperCase();
      let bodyString = '';
      if (options.body !== undefined && options.body !== null) {
        bodyString = JSON.stringify(options.body);
      }

      if (this.enableRequestSigning && this.apiKey && this.secretKey) {
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const bodyHash = await sha256(bodyString);
        const pathForSigning = this.resolveSigningPath(endpoint);
        const payload = `${timestamp}${method}${pathForSigning}${bodyHash}`;
        const signature = await hmacSha256(this.secretKey, payload);

        headers.set('X-Api-Key', this.apiKey);
        headers.set('X-Timestamp', timestamp);
        headers.set('X-Signature', signature);
      }

      const makeRequest = async () => {
        return fetch(url, {
          ...options,
          headers,
          credentials: this.includeCredentials ? 'include' : 'omit',
          body: bodyString || undefined,
        });
      };

      let response = await makeRequest();

      // Auto-Refresh Logic for 401
      if (response.status === 401 && this.enableAutoRefresh) {
        // Prevent infinite loops:
        // 1. Don't refresh if the failed request was already an Auth request (login, refresh, me, logout)
        const isAuthRequest = url.includes('/auth/');
        
        // 2. Don't refresh if we are already on the login page (client-side check)
        const isLoginPage = typeof window !== 'undefined' && 
          (window.location.pathname === '/login' || window.location.pathname === '/register');

        if (isAuthRequest || isLoginPage) {
             // Just return the error, let the UI/Auth Provider handle it (or do nothing)
             return { error: 'Unauthorized', status: 401 };
        }

        try {
          // Attempt to refresh token
          const refreshResponse = await fetch('/api/v1/auth/refresh', {
            method: 'POST',
          });

          if (refreshResponse.ok) {
            // Retry original request
            response = await makeRequest();
          } else {
            // Refresh failed, session is truly expired
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new Event('auth:session-expired'));
            }
          }
        } catch (error) {
           console.error('Failed to refresh token:', error);
           if (typeof window !== 'undefined') {
              window.dispatchEvent(new Event('auth:session-expired'));
            }
        }
      }

      const responseText = await response.text();
      const contentType = response.headers.get('content-type');
      const isJson = contentType?.toLowerCase().includes('application/json');
      
      let data: any;

      try {
        if (isJson && responseText) {
          data = JSON.parse(responseText);
        } else {
          data = responseText ? { message: responseText } : {};
        }
      } catch (parseError) {
        if (!response.ok) {
          return { error: responseText || `Request failed with status ${response.status}` };
        }
        console.error('Failed to parse successful response as JSON:', parseError);
        return { error: 'Malformed response from server' };
      }

      if (!response.ok) {
        const code = typeof data?.code === 'string' ? data.code : undefined;
        return {
          error: (data.error || data.message || `Request failed with status ${response.status}`) as string,
          status: response.status,
          code,
        };
      }

      return { data: isJson ? data : (data.message || data) };
    } catch (error) {
      console.error('HTTP Client Error:', error);
      return { error: 'Network error', status: 0 };
    }
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  async put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  async patch<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  private resolveSigningPath(endpoint: string): string {
    if (endpoint.startsWith('http')) {
      const parsed = new URL(endpoint);
      return `${parsed.pathname}${parsed.search}`;
    }

    // If base URL is relative (/api), include it in signing path.
    if (this.baseUrl.startsWith('/')) {
      return `${this.baseUrl}${endpoint}`.replace(/\/{2,}/g, '/');
    }

    // If base URL is absolute, include only its path prefix.
    const baseParsed = new URL(this.baseUrl);
    return `${baseParsed.pathname}${endpoint}`.replace(/\/{2,}/g, '/');
  }
}

// Session-based API client (proxy + cookies)
export const httpClient = new HttpClient(ENV.API_BASE_URL, {
  includeCredentials: true,
  enableAutoRefresh: true,
  enableRequestSigning: false,
});

// Signed API-key client (direct backend/public endpoints)
export const signedHttpClient = new HttpClient(ENV.NEXT_PUBLIC_API_URL, {
  includeCredentials: false,
  enableAutoRefresh: false,
  enableRequestSigning: true,
});

// Signed API-key client through proxy API route (used by app/public flow)
export const signedProxyHttpClient = new HttpClient(ENV.API_BASE_URL, {
  includeCredentials: false,
  enableAutoRefresh: false,
  enableRequestSigning: true,
});
