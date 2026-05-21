import { render, screen } from '@testing-library/react';
import { BillHeader } from '@/presentation/view/payments/bill/components/BillHeader';
import type { CreatePartnerCreatePaymentResponse } from '@/data/model/response';

jest.mock('@/presentation/hooks', () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback || _key,
  }),
}));

function createBill(overrides: Partial<CreatePartnerCreatePaymentResponse> = {}): CreatePartnerCreatePaymentResponse {
  return {
    payment_id: 'pay_123',
    merchant_id: 'merchant_123',
    amount: '2950000',
    invoice_currency: 'IDRX',
    invoice_amount: '50000',
    quoted_token_symbol: 'USDC',
    quoted_token_amount: '2.95',
    quoted_token_amount_atomic: '2950000',
    quoted_token_decimals: 6,
    quote_rate: '1',
    quote_source: 'source',
    quote_expires_at: '2026-03-29T03:00:00Z',
    dest_chain: 'eip155:8453',
    dest_token: '0xbaseusdc',
    dest_wallet: '0xmerchantdestination',
    expire_time: '2026-03-29T03:00:00Z',
    payment_url: 'https://checkout.example/pay_123',
    payment_code: 'code_abc',
    payment_instruction: {
      chain_id: 'eip155:8453',
      to: '0xgateway',
      value: '0',
      data: '0xdeadbeef',
    },
    ...overrides,
  };
}

describe('BillHeader', () => {
  it('shows formatted datetime for non-unlimited bill', () => {
    render(<BillHeader bill={createBill({ is_unlimited_expiry: false })} />);

    expect(screen.getByText('Quote Expires')).toBeInTheDocument();
    expect(screen.getByText('Bill Expires')).toBeInTheDocument();
    expect(screen.queryByText('Unlimited')).not.toBeInTheDocument();
  });

  it('shows Unlimited label for quote and bill expiry when unlimited', () => {
    render(<BillHeader bill={createBill({ is_unlimited_expiry: true })} />);

    const unlimitedLabels = screen.getAllByText('Unlimited');
    expect(unlimitedLabels).toHaveLength(2);
  });
});

