import { act, renderHook, waitFor } from '@testing-library/react';
import { useNewPayment } from '@/presentation/view/payments/new/useNewPayment';
import {
  useChainsQuery,
  useCreateMerchantPaymentBillMutation,
  useMerchantSettlementProfileQuery,
  useWalletsQuery,
} from '@/data/usecase';
import type { CreatePartnerCreatePaymentResponse } from '@/data/model/response';

jest.mock('@/data/usecase');

const mockedUseChainsQuery = useChainsQuery as jest.Mock;
const mockedUseCreateMerchantPaymentBillMutation = useCreateMerchantPaymentBillMutation as jest.Mock;
const mockedUseMerchantSettlementProfileQuery = useMerchantSettlementProfileQuery as jest.Mock;
const mockedUseWalletsQuery = useWalletsQuery as jest.Mock;

const createBaseBillResponse = (): CreatePartnerCreatePaymentResponse => ({
  payment_id: 'pay_123',
  merchant_id: 'merchant_123',
  amount: '2950000',
  invoice_currency: 'IDRX',
  invoice_amount: '50000',
  payer_selected_chain: 'eip155:8453',
  payer_selected_token: '0xbaseusdc',
  payer_selected_token_symbol: 'USDC',
  quoted_token_symbol: 'USDC',
  quoted_token_amount: '2.95',
  quoted_token_amount_atomic: '2950000',
  quoted_token_decimals: 6,
  quote_rate: '1',
  quote_source: 'merchant-fixed-selected-token',
  quote_expires_at: new Date().toISOString(),
  dest_chain: 'eip155:8453',
  dest_token: '0xbaseidrx',
  dest_wallet: '0xmerchantdestination',
  settlement_dest_chain: 'eip155:8453',
  settlement_dest_token: '0xbaseidrx',
  settlement_dest_wallet: '0xmerchantdestination',
  expire_time: new Date().toISOString(),
  payment_url: 'https://checkout.example/pay_123',
  payment_code: 'code_abc',
  payment_instruction: {
    chain_id: 'eip155:8453',
    to: '0xgateway',
    value: '0',
    data: '0xdeadbeef',
  },
});

describe('useNewPayment', () => {
  let mutateAsyncMock: jest.Mock;

  beforeEach(() => {
    mutateAsyncMock = jest.fn();

    mockedUseChainsQuery.mockReturnValue({
      data: {
        items: [
          {
            id: 8453,
            caip2: 'eip155:8453',
            name: 'Base',
            chainType: 'EVM',
          },
        ],
      },
      error: null,
      refetch: jest.fn(),
    });

    mockedUseMerchantSettlementProfileQuery.mockReturnValue({
      data: {
        configured: true,
      },
    });

    mockedUseWalletsQuery.mockReturnValue({
      data: {
        wallets: [],
      },
    });

    mockedUseCreateMerchantPaymentBillMutation.mockReturnValue({
      mutateAsync: mutateAsyncMock,
      isPending: false,
    });
  });

  function populateValidForm(result: { current: ReturnType<typeof useNewPayment> }) {
    act(() => {
      result.current.handleSourceChainSelect({
        id: '8453',
        networkId: '8453',
        name: 'Base',
        chainType: 'EVM',
      } as any);
      result.current.handleTokenSelect({
        id: 'token_usdc',
        symbol: 'USDC',
        name: 'USDC',
        address: '0xbaseusdc',
        isNative: false,
        chainId: 8453,
        decimals: 6,
      } as any);
      result.current.setValue('pricing_type', 'invoice_currency');
      result.current.setValue('amount', '2.95');
      result.current.setValue('requested_amount', '2.95');
    });
  }

  it('submits merchant create payment payload and stores bill response', async () => {
    const bill = createBaseBillResponse();
    mutateAsyncMock.mockResolvedValue({ data: bill });

    const { result } = renderHook(() => useNewPayment());
    populateValidForm(result);

    await act(async () => {
      await result.current.handleSubmit();
    });

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledTimes(1);
      expect(mutateAsyncMock).toHaveBeenCalledWith({
        chain_id: 'eip155:8453',
        selected_token: '0xbaseusdc',
        pricing_type: 'invoice_currency',
        requested_amount: '2.95',
      });
      expect(result.current.createdBill).toEqual(bill);
      expect(result.current.error).toBeNull();
    });
  });

  it('sends expires_in seconds when expiry mode is custom', async () => {
    const bill = createBaseBillResponse();
    mutateAsyncMock.mockResolvedValue({ data: bill });

    const { result } = renderHook(() => useNewPayment());
    populateValidForm(result);
    act(() => {
      result.current.handleExpiryModeSelect('custom');
      result.current.handleExpiresInCustomChange('90');
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledWith({
        chain_id: 'eip155:8453',
        selected_token: '0xbaseusdc',
        pricing_type: 'invoice_currency',
        requested_amount: '2.95',
        expires_in: '90',
      });
    });
  });

  it('sends expires_in unlimited when expiry mode is unlimited', async () => {
    const bill = createBaseBillResponse();
    mutateAsyncMock.mockResolvedValue({ data: bill });

    const { result } = renderHook(() => useNewPayment());
    populateValidForm(result);
    act(() => {
      result.current.handleExpiryModeSelect('unlimited');
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledWith({
        chain_id: 'eip155:8453',
        selected_token: '0xbaseusdc',
        pricing_type: 'invoice_currency',
        requested_amount: '2.95',
        expires_in: 'unlimited',
      });
    });
  });

  it('maps 401 response to session-expired error message', async () => {
    mutateAsyncMock.mockResolvedValue({ error: 'Unauthorized', status: 401 });

    const { result } = renderHook(() => useNewPayment());
    populateValidForm(result);

    await act(async () => {
      await result.current.handleSubmit();
    });

    await waitFor(() => {
      expect(result.current.error).toBe('Your session has expired. Please login again.');
      expect(result.current.createdBill).toBeNull();
    });
  });

  it('maps 403 response to merchant-context error message', async () => {
    mutateAsyncMock.mockResolvedValue({ error: 'Forbidden', status: 403 });

    const { result } = renderHook(() => useNewPayment());
    populateValidForm(result);

    await act(async () => {
      await result.current.handleSubmit();
    });

    await waitFor(() => {
      expect(result.current.error).toBe(
        'Merchant context required. Please ensure your account is linked to an active merchant profile.'
      );
      expect(result.current.createdBill).toBeNull();
    });
  });

  it('maps 400 without explicit backend message to generic validation error', async () => {
    mutateAsyncMock.mockResolvedValue({ error: '', status: 400 });

    const { result } = renderHook(() => useNewPayment());
    populateValidForm(result);

    await act(async () => {
      await result.current.handleSubmit();
    });

    await waitFor(() => {
      expect(result.current.error).toBe('Invalid create payment request. Please check input and settlement profile.');
      expect(result.current.createdBill).toBeNull();
    });
  });

  it('preserves backend message for 400 responses when available', async () => {
    mutateAsyncMock.mockResolvedValue({
      error: 'merchant dest_chain / dest_token is not configured',
      status: 400,
    });

    const { result } = renderHook(() => useNewPayment());
    populateValidForm(result);

    await act(async () => {
      await result.current.handleSubmit();
    });

    await waitFor(() => {
      expect(result.current.error).toBe('merchant dest_chain / dest_token is not configured');
      expect(result.current.createdBill).toBeNull();
    });
  });

  it('forwards SSR initial data options into query hooks', () => {
    const initialChains = {
      items: [{ id: 8453, caip2: 'eip155:8453', name: 'Base', chainType: 'EVM' }],
    } as any;
    const initialSettlementProfile = { configured: true, invoice_currency: 'IDRX' } as any;

    renderHook(() => useNewPayment({ initialChains, initialSettlementProfile }));

    expect(mockedUseChainsQuery).toHaveBeenLastCalledWith(initialChains);
    expect(mockedUseMerchantSettlementProfileQuery).toHaveBeenLastCalledWith(initialSettlementProfile);
  });

  it('marks settlement as not configured when profile is explicitly false', () => {
    mockedUseMerchantSettlementProfileQuery.mockReturnValue({
      data: { configured: false },
    });

    const { result } = renderHook(() => useNewPayment());

    expect(result.current.settlementConfigured).toBe(false);
  });
});
