import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('@/presentation/hooks/useTranslation', () => ({
  useTranslation: () => ({ t: (_key: string, fallback?: string) => fallback || _key }),
}));

jest.mock('@/presentation/components/atoms', () => ({
  Button: ({ children, onClick, disabled }: any) => (
    <button type="button" onClick={onClick} disabled={disabled}>{children}</button>
  ),
  Card: ({ children }: any) => <div>{children}</div>,
  Badge: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('@/presentation/components/organisms/table', () => ({
  Table: ({ children }: any) => <table>{children}</table>,
  TableHeader: ({ children }: any) => <thead>{children}</thead>,
  TableBody: ({ children }: any) => <tbody>{children}</tbody>,
  TableRow: ({ children }: any) => <tr>{children}</tr>,
  TableHead: ({ children }: any) => <th>{children}</th>,
  TableCell: ({ children }: any) => <td>{children}</td>,
}));

jest.mock('@/presentation/view/docs/partner/ResolveCodeDemo', () => ({
  ResolveCodeDemo: () => <div>ResolveCodeDemo</div>,
}));

jest.mock('@/presentation/view/docs/partner/usePartnerAPI', () => ({
  usePartnerAPI: () => ({
    copiedCode: null,
    handleCopy: jest.fn(),
    headers: [
      { name: 'X-PK-Key', value: 'pk_live_x', desc: 'Partner API key' },
      { name: 'X-PK-Signature', value: 'abc123', desc: 'Canonical request signature' },
    ],
    requestSchema: [
      { field: 'invoice_currency', type: 'string', required: true, desc: 'Merchant invoice currency' },
    ],
    webhookSchema: [
      { field: 'payment_id', type: 'string', desc: 'Runtime payment identifier' },
    ],
  }),
}));

const { PartnerAPIView } = require('@/presentation/view/docs/partner/PartnerAPIView');

describe('PartnerAPIView', () => {
  it('renders backend example and sequence guidance', () => {
    render(<PartnerAPIView />);

    expect(screen.getByText('Merchant Backend End-to-End Example')).toBeInTheDocument();
    expect(screen.getByText('Merchant Backend to Hosted Checkout Sequence')).toBeInTheDocument();
    expect(screen.getByText(/createCustomerPayment/)).toBeInTheDocument();
  });

  it('renders same-chain and cross-chain guidance', () => {
    render(<PartnerAPIView />);

    expect(screen.getByText('Same-Chain vs Cross-Chain')).toBeInTheDocument();
    expect(screen.getByText('Same-chain settlement')).toBeInTheDocument();
    expect(screen.getByText('Cross-chain settlement')).toBeInTheDocument();
  });
});
