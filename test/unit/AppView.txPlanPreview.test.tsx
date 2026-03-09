import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('@/presentation/view/app/useApp', () => ({
  useApp: jest.fn(),
}));

jest.mock('@/presentation/hooks', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@/presentation/components/organisms/ChainTokenSelector', () => ({
  ChainTokenSelector: () => <div data-testid="chain-token-selector" />,
}));

jest.mock('@/presentation/components/molecules', () => ({
  AmountTokenInput: () => <div data-testid="amount-token-input" />,
  WalletConnectButton: () => <button type="button">connect</button>,
}));

jest.mock('@/presentation/components/atoms', () => ({
  Button: ({ children, onClick, disabled, className }: any) => (
    <button type="button" onClick={onClick} disabled={disabled} className={className}>
      {children}
    </button>
  ),
  Input: (props: any) => <input {...props} />,
  Label: ({ children }: any) => <label>{children}</label>,
}));

const AppView = require('@/presentation/view/app/AppView').default;
const { useApp } = require('@/presentation/view/app/useApp');

describe('AppView tx plan preview', () => {
  it('shows tx plan preview from backend payload mapping', () => {
    (useApp as jest.Mock).mockReturnValue({
      isConnected: true,
      chains: [{ id: 'source-chain', name: 'Base', explorerUrl: 'https://basescan.org' }],
      sourceChainId: 'source-chain',
      destChainId: 'dest-chain',
      sourceTokenAddress: '0x0000000000000000000000000000000000000001',
      receiver: '0x0000000000000000000000000000000000000002',
      setReceiver: jest.fn(),
      paymentMode: 'regular',
      setPaymentMode: jest.fn(),
      bridgeOptionSelection: 'default',
      setBridgeOptionSelection: jest.fn(),
      bridgeTokenSource: '',
      setBridgeTokenSource: jest.fn(),
      minBridgeAmountOut: '',
      setMinBridgeAmountOut: jest.fn(),
      minDestAmountOut: '',
      setMinDestAmountOut: jest.fn(),
      privacyIntentId: '',
      setPrivacyIntentId: jest.fn(),
      privacyStealthReceiver: '',
      setPrivacyStealthReceiver: jest.fn(),
      selectedSourceChainTokenId: undefined,
      selectedDestChainTokenId: undefined,
      chainTokenItems: [],
      handleSourceChainTokenSelect: jest.fn(),
      handleDestChainTokenSelect: jest.fn(),
      amountDisplay: '1',
      handleAmountChange: jest.fn(),
      handleMaxClick: jest.fn(),
      selectedTokenSymbol: 'USDC',
      formattedBalance: '100',
      canUseMax: true,
      addressError: null,
      privacyStealthAddressError: null,
      receiverPlaceholder: '0x...',
      isOwnAddress: false,
      setIsOwnAddress: jest.fn(),
      isLoading: false,
      isSuccess: false,
      error: null,
      routeErrorDiagnostics: null,
      txHash: null,
      paymentCostPreview: null,
      txPlanPreview: {
        chainType: 'EVM',
        approval: {
          to: '0x0000000000000000000000000000000000000003',
          spender: '0x0000000000000000000000000000000000000004',
          amount: '1000000',
        },
        transactions: [
          {
            kind: 'approve',
            to: '0x0000000000000000000000000000000000000003',
            amount: '1000000',
          },
        ],
        finalCall: {
          to: '0x0000000000000000000000000000000000000005',
          value: '123',
        },
      },
      handlePay: jest.fn(),
      handleReversePair: jest.fn(),
    });

    render(<AppView />);

    expect(screen.getByText(/Transaction Plan Preview/i)).toBeInTheDocument();
    expect(screen.getByText(/Chain Type:/i)).toBeInTheDocument();
    expect(screen.getByText(/Approval/i)).toBeInTheDocument();
    expect(screen.getByText(/Backend Steps/i)).toBeInTheDocument();
    expect(screen.getByText(/Final Call/i)).toBeInTheDocument();
  });
});
