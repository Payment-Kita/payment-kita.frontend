import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { NewPaymentView } from '@/presentation/view/payments/new/NewPaymentView';
import { useNewPayment } from '@/presentation/view/payments/new/useNewPayment';
import { useTokensQuery } from '@/data/usecase';

jest.mock('@/presentation/hooks', () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback || _key,
  }),
}));

jest.mock('@/data/usecase', () => ({
  useTokensQuery: jest.fn(),
  useChainsQuery: jest.fn(),
}));

jest.mock('@/presentation/view/payments/new/useNewPayment', () => ({
  useNewPayment: jest.fn(),
}));

jest.mock('@/presentation/view/payments/new/components/CreatePaymentHeader', () => ({
  CreatePaymentHeader: () => <div data-testid="create-payment-header" />,
}));

jest.mock('@/presentation/view/payments/new/components/CreatePaymentFormCard', () => ({
  CreatePaymentFormCard: () => <div data-testid="create-payment-form-card" />,
}));

jest.mock('@/presentation/view/payments/bill', () => ({
  BillInvoiceResultCard: () => <div data-testid="bill-result-card" />,
  BillInvoiceSkeleton: () => <div data-testid="bill-skeleton" />,
  BillInvoiceEmptyState: () => <div data-testid="bill-empty" />,
}));

const mockedUseNewPayment = useNewPayment as jest.Mock;
const mockedUseTokensQuery = useTokensQuery as jest.Mock;

describe('NewPaymentView SSR init-data states', () => {
  const buildUseNewPaymentState = () => ({
    form: {
      clearErrors: jest.fn(),
    },
    loading: false,
    error: null,
    createdBill: null,
    settlementProfile: null,
    settlementConfigured: false,
    chainsData: {
      items: [],
    },
    chainsError: null,
    refetchChains: jest.fn(),
    handleSubmit: jest.fn(),
    handleSourceChainSelect: jest.fn(),
    handleTokenSelect: jest.fn(),
    sourceChainId: '',
    sourceTokenAddress: '',
    pricingType: 'invoice_currency',
    setValue: jest.fn(),
  });

  const defaultRefetchChains = jest.fn();
  const defaultRefetchTokens = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockedUseNewPayment.mockReturnValue({
      ...buildUseNewPaymentState(),
      refetchChains: defaultRefetchChains,
    });

    mockedUseTokensQuery.mockReturnValue({
      data: {
        items: [],
      },
      error: null,
      refetch: defaultRefetchTokens,
      isFetching: false,
    });
  });

  it('shows retry banner when initial data load fails', () => {
    mockedUseNewPayment.mockReturnValue({
      ...buildUseNewPaymentState(),
      chainsError: 'Failed to fetch chains',
      refetchChains: defaultRefetchChains,
    });

    render(<NewPaymentView />);

    expect(screen.getByText('Some initial data failed to load. Please retry.')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch chains')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });

  it('calls both chain and token refetch on retry click', () => {
    const refetchChains = jest.fn();
    const refetchTokens = jest.fn();

    mockedUseNewPayment.mockReturnValue({
      ...buildUseNewPaymentState(),
      chainsError: 'Failed to fetch chains',
      refetchChains,
    });

    mockedUseTokensQuery.mockReturnValue({
      data: { items: [] },
      error: null,
      refetch: refetchTokens,
      isFetching: false,
    });

    render(<NewPaymentView />);

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));

    expect(refetchChains).toHaveBeenCalledTimes(1);
    expect(refetchTokens).toHaveBeenCalledTimes(1);
  });

  it('does not render retry banner when chain and token init data are healthy', () => {
    render(<NewPaymentView />);

    expect(screen.queryByText('Some initial data failed to load. Please retry.')).not.toBeInTheDocument();
  });
});
