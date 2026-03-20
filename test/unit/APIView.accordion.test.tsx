import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

jest.mock('@/presentation/hooks/useTranslation', () => ({
  useTranslation: () => ({ t: (_key: string, fallback?: string) => fallback || _key }),
}));

jest.mock('@/presentation/components/atoms', () => ({
  Button: ({ children, onClick, disabled, loading, ...props }: any) => (
    <button type="button" onClick={onClick} disabled={disabled} {...props}>{children}</button>
  ),
  Card: ({ children }: any) => <div>{children}</div>,
  Badge: ({ children }: any) => <div>{children}</div>,
  Input: ({ label, value, onChange, placeholder }: any) => (
    <label>
      <span>{label}</span>
      <input aria-label={label} value={value} onChange={onChange} placeholder={placeholder} />
    </label>
  ),
}));

const { APIView } = require('@/presentation/view/docs/api/APIView');

describe('APIView accordion', () => {
  it('renders the recommended create payment flow section', () => {
    render(<APIView />);

    expect(screen.getByText('Recommended Create Payment Flow')).toBeInTheDocument();
    expect(screen.getByText('Current partner flow')).toBeInTheDocument();
    expect(screen.getByText('invoice currency -> pool quote -> selected stablecoin amount')).toBeInTheDocument();
    expect(screen.getAllByText(/POST \/api\/v1\/create-payment/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/50.000 IDRX/).length).toBeGreaterThan(0);
    expect(screen.getByText(/2,95 USDC/i)).toBeInTheDocument();
    expect(screen.getByText(/quoted_token_symbol\": \"USDT\"/i)).toBeInTheDocument();
  });

  it('renders the partner quote endpoint accordion with an explicit aria state', () => {
    render(<APIView />);

    const quoteButton = screen.getByRole('button', { name: /POST \/api\/v1\/create-payment/i });
    const copyPathButton = screen.getByRole('button', { name: /Copy endpoint path \/api\/v1\/create-payment/i });

    expect(quoteButton).toBeInTheDocument();
    expect(copyPathButton).toBeInTheDocument();
    expect(quoteButton).toHaveAttribute('aria-expanded');
  });

  it('toggles an endpoint open and updates aria state', () => {
    render(<APIView />);

    const sessionReadButton = screen.getByRole('button', { name: /GET \/api\/v1\/partner\/payment-sessions\/:id/i });

    expect(sessionReadButton).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(sessionReadButton);

    expect(sessionReadButton).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getAllByText('Response Example').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Try This API').length).toBeGreaterThan(0);
  });
});
