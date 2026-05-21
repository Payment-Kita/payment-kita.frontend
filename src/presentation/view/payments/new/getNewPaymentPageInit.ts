import 'server-only';

import { cookies } from 'next/headers';
import { ENV } from '@/core/config/env';
import { API_ENDPOINTS } from '@/core/constants';
import type { ChainsResponse, MerchantSettlementProfileResponse, TokensResponse } from '@/data/model/response';
import type { NewPaymentPageInit } from './types';

const BACKEND_URL = ENV.BACKEND_URL;
const INTERNAL_PROXY_SECRET = ENV.INTERNAL_PROXY_SECRET;

async function fetchDashboardJSON<T>(endpoint: string, sessionId?: string): Promise<T | null> {
  const headers: HeadersInit = {};
  if (sessionId) {
    headers['X-Session-Id'] = sessionId;
  }
  if (INTERNAL_PROXY_SECRET) {
    headers['X-Internal-Proxy-Secret'] = INTERNAL_PROXY_SECRET;
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api${endpoint}`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function getNewPaymentPageInit(): Promise<NewPaymentPageInit> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session_id')?.value;

  const [chains, tokens, settlementProfile] = await Promise.all([
    fetchDashboardJSON<ChainsResponse>(API_ENDPOINTS.CHAINS, sessionId),
    fetchDashboardJSON<TokensResponse>(API_ENDPOINTS.TOKENS, sessionId),
    fetchDashboardJSON<MerchantSettlementProfileResponse>(API_ENDPOINTS.MERCHANT_SETTLEMENT_PROFILE, sessionId),
  ]);

  return {
    chains: chains ?? undefined,
    tokens: tokens ?? undefined,
    settlementProfile: settlementProfile ?? null,
  };
}
