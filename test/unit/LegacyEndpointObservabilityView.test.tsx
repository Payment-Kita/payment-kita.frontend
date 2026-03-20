import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

const mockedUseAdminLegacyEndpointObservability = jest.fn();

Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockResolvedValue(undefined),
  },
});

jest.mock('@/data/usecase/useAdmin', () => ({
  useAdminLegacyEndpointObservability: () => mockedUseAdminLegacyEndpointObservability(),
}));

jest.mock('@/presentation/components/atoms', () => ({
  Button: ({ children, onClick, disabled }: any) => (
    <button type="button" onClick={onClick} disabled={disabled}>{children}</button>
  ),
  Card: ({ children }: any) => <div>{children}</div>,
  Badge: ({ children }: any) => <div>{children}</div>,
}));

const { LegacyEndpointObservabilityView } = require('@/presentation/view/admin/LegacyEndpointObservabilityView');

describe('LegacyEndpointObservabilityView', () => {
  beforeEach(() => {
    mockedUseAdminLegacyEndpointObservability.mockReturnValue({
      isLoading: false,
      data: {
        summary: {
          tracked_endpoints: 3,
          total_hits: 12,
          last_seen_at: '2026-03-20T12:00:00Z',
        },
        endpoints: [
          {
            endpoint_family: 'resolve_payment_code',
            replacement: '/api/v1/partner/payment-sessions/resolve-code',
            sunset_at: '2026-03-31T00:00:00Z',
            mode: 'warn',
            total_hits: 2,
            last_seen_at: '2026-03-20T12:00:00Z',
            merchant_hits: { merchant_a: 2 },
          },
        ],
      },
    });
  });

  it('renders observability data and generated env snippet', () => {
    render(<LegacyEndpointObservabilityView />);

    expect(screen.getByText('Legacy Endpoint Observability')).toBeInTheDocument();
    expect(screen.getAllByText('resolve_payment_code').length).toBeGreaterThan(0);
    expect(screen.getByText('LEGACY_RESOLVE_PAYMENT_CODE_MODE=warn')).toBeInTheDocument();
  });

  it('updates generated snippet when mode changes', () => {
    render(<LegacyEndpointObservabilityView />);

    fireEvent.click(screen.getAllByRole('button', { name: 'disabled' })[0]);

    expect(screen.getByText('LEGACY_RESOLVE_PAYMENT_CODE_MODE=disabled')).toBeInTheDocument();
  });

  it('copies generated env snippet to clipboard', async () => {
    render(<LegacyEndpointObservabilityView />);

    fireEvent.click(screen.getByRole('button', { name: 'Copy Env Snippet' }));

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('LEGACY_RESOLVE_PAYMENT_CODE_MODE=warn');
  });
});
