import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('next/navigation', () => ({
  useParams: () => ({ id: '0195-session' }),
}));

jest.mock('@/presentation/view/payment/usePayment', () => ({
  usePayment: jest.fn(),
}));

jest.mock('@/presentation/components/organisms/checkout/QRDisplay', () => ({
  QRDisplay: ({ value }: { value: string }) => <div data-testid="qr-display">{value}</div>,
}));

jest.mock('@/presentation/components/organisms/checkout/MethodSelector', () => ({
  MethodSelector: () => <div data-testid="method-selector" />,
}));

jest.mock('@/presentation/components/organisms/loading', () => ({
  LoadingSpinner: ({ text }: { text?: string }) => <div>{text || 'loading'}</div>,
}));

jest.mock('@/presentation/components/molecules', () => ({
  WalletConnectButton: () => <button type="button">connect wallet</button>,
}));

jest.mock('@/presentation/components/atoms', () => ({
  Button: ({ children, onClick, disabled }: any) => (
    <button type="button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  Card: ({ children }: any) => <div>{children}</div>,
  Badge: ({ children }: any) => <div>{children}</div>,
}));

const { usePayment } = require('@/presentation/view/payment/usePayment');
const { PaymentView } = require('@/presentation/view/payment/PaymentView');

describe('PaymentView partner hosted checkout', () => {
  it('renders QR using payment_code from partner session read model', () => {
    (usePayment as jest.Mock).mockReturnValue({
      paymentRequest: {
        amount: '1000000',
        amount_decimals: 6,
        dest_chain: 'eip155:8453',
        dest_token: '0xToken',
        dest_wallet: '0xMerchant',
        expires_at: new Date(Date.now() + 60_000).toISOString(),
        payment_code: 'eyJ.partner.code',
        payment_instruction: { to: '0xGateway', data: '0xabc' },
        status: 'PENDING',
      },
      isLoading: false,
      error: '',
      isCompleted: false,
      isTerminal: false,
      timeLeft: 59,
      isCopied: false,
      isPaying: false,
      activeMethod: 'dompetku',
      setActiveMethod: jest.fn(),
      isWalletReady: false,
      needsEvm: true,
      needsSvm: false,
      handlePay: jest.fn(),
      copyTxData: jest.fn(),
      formatTimeLeft: () => '0:59',
      formatAmount: () => '1.00',
      getChainName: () => 'Base',
      t: (key: string) => key,
    });

    render(<PaymentView />);

    expect(screen.getByTestId('qr-display')).toHaveTextContent('eyJ.partner.code');
  });

  it('renders completed terminal state copy', () => {
    (usePayment as jest.Mock).mockReturnValue({
      paymentRequest: {
        amount: '1000000',
        amount_decimals: 6,
        dest_chain: 'eip155:8453',
        dest_token: '0xToken',
        dest_wallet: '0xMerchant',
        expires_at: new Date(Date.now() + 60_000).toISOString(),
        payment_code: 'eyJ.partner.code',
        payment_instruction: { to: '0xGateway', data: '0xabc' },
        status: 'COMPLETED',
      },
      isLoading: false,
      error: '',
      isCompleted: true,
      isTerminal: true,
      timeLeft: 0,
      isCopied: false,
      isPaying: false,
      activeMethod: 'wallet',
      setActiveMethod: jest.fn(),
      isWalletReady: true,
      needsEvm: true,
      needsSvm: false,
      handlePay: jest.fn(),
      copyTxData: jest.fn(),
      formatTimeLeft: () => '0:00',
      formatAmount: () => '1.00',
      getChainName: () => 'Base',
      t: (key: string) => key,
    });

    render(<PaymentView />);

    expect(screen.getByText(/Order Confirmed/i)).toBeInTheDocument();
    expect(screen.getByText(/Payment confirmed on-chain/i)).toBeInTheDocument();
  });
});
