/** @jest-environment node */

import { cookies } from 'next/headers';

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

jest.mock('@/core/config/env', () => ({
  ENV: {
    BACKEND_URL: 'https://backend.test',
    INTERNAL_PROXY_SECRET: 'internal-proxy-secret',
    ADMIN_API_KEY: 'admin-api-key',
    ADMIN_SECRET_KEY: 'admin-secret-key',
    IS_PRODUCTION: false,
  },
}));

const mockedCookies = cookies as jest.Mock;

function makeJSONResponse(status: number, payload: unknown) {
  const jsonText = JSON.stringify(payload);
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status >= 200 && status < 300 ? 'OK' : 'ERROR',
    headers: new Headers({ 'content-type': 'application/json' }),
    text: jest.fn().mockResolvedValue(jsonText),
    arrayBuffer: jest.fn().mockResolvedValue(Buffer.from(jsonText)),
  } as any;
}

function createRequest(url: string, method: string, body = '') {
  return {
    method,
    headers: new Headers(),
    nextUrl: new URL(url),
    text: jest.fn().mockResolvedValue(body),
  } as any;
}

describe('proxy route admin fallback hardening', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedCookies.mockResolvedValue({
      get: () => undefined,
    });
  });

  it('does not inject admin fallback signature for merchant session endpoint', async () => {
    (global.fetch as jest.Mock) = jest.fn().mockResolvedValue(
      makeJSONResponse(403, {
        code: 'ERR_FORBIDDEN',
        error: 'merchant context required',
      })
    );

    const { POST } = await import('@/app/api/v1/[...path]/route');
    const response = await POST(
      createRequest('http://localhost/api/v1/merchants/create-payment', 'POST', '{"amount":"2.95"}'),
      { params: Promise.resolve({ path: ['merchants', 'create-payment'] }) }
    );

    expect(response.status).toBe(403);
    expect(global.fetch).toHaveBeenCalledTimes(1);

    const [, requestInit] = (global.fetch as jest.Mock).mock.calls[0];
    const forwardedHeaders = new Headers((requestInit as RequestInit).headers);

    expect(forwardedHeaders.get('X-Api-Key')).toBeNull();
    expect(forwardedHeaders.get('X-Timestamp')).toBeNull();
    expect(forwardedHeaders.get('X-Signature')).toBeNull();
    expect(forwardedHeaders.get('X-Request-Id')).toBeTruthy();
  });

  it('injects admin fallback signature for public token endpoint when no session', async () => {
    (global.fetch as jest.Mock) = jest.fn().mockResolvedValue(
      makeJSONResponse(200, {
        items: [],
        meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
      })
    );

    const { GET } = await import('@/app/api/v1/[...path]/route');
    const response = await GET(
      createRequest('http://localhost/api/v1/tokens?page=1&limit=10', 'GET'),
      { params: Promise.resolve({ path: ['tokens'] }) }
    );

    expect(response.status).toBe(200);
    expect(global.fetch).toHaveBeenCalledTimes(1);

    const [, requestInit] = (global.fetch as jest.Mock).mock.calls[0];
    const forwardedHeaders = new Headers((requestInit as RequestInit).headers);

    expect(forwardedHeaders.get('X-Api-Key')).toBe('admin-api-key');
    expect(forwardedHeaders.get('X-Timestamp')).toBeTruthy();
    expect(forwardedHeaders.get('X-Signature')).toBeTruthy();

    const requestId = forwardedHeaders.get('X-Request-Id');
    expect(requestId).toBeTruthy();
    expect(response.headers.get('X-Request-Id')).toBe(requestId);
  });
});
