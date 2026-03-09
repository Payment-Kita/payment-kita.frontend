import { renderHook, waitFor } from '@testing-library/react';
import { useDashboard } from '@/presentation/view/dashboard/useDashboard';
import { useAuthStore, useWalletStore, usePaymentStore } from '@/presentation/hooks';
import { useWalletsQuery, useAdminStats } from '@/data/usecase';

// Mock dependencies
jest.mock('@/presentation/hooks');
jest.mock('@/data/usecase');

describe('useDashboard', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Default mock implementations
    (useAuthStore as jest.Mock).mockReturnValue({ user: { name: 'Test User' } });
    (useWalletStore as jest.Mock).mockReturnValue({ primaryWallet: { address: '0x123' }, syncWithServer: jest.fn() });
    (usePaymentStore as jest.Mock).mockReturnValue({ payments: [], loading: false });

    (useWalletsQuery as jest.Mock).mockReturnValue({ data: null });
    (useAdminStats as jest.Mock).mockReturnValue({ data: { totalVolume: '0' } });
  });

  it('should return initial state', () => {
    const { result } = renderHook(() => useDashboard());
    
    expect(result.current.user).toEqual({ name: 'Test User' });
    expect(result.current.wallet).toEqual({ address: '0x123' });
    expect(result.current.isLoading).toBe(false);
  });

  it('should sync payments when data loads', async () => {
    const syncWithServer = jest.fn();
    const mockWallets = [{ id: 'w1' }, { id: 'w2' }];
    (useWalletStore as jest.Mock).mockReturnValue({ primaryWallet: { address: '0x123' }, syncWithServer });
    (useWalletsQuery as jest.Mock).mockReturnValue({
      data: { wallets: mockWallets },
    });

    renderHook(() => useDashboard());

    await waitFor(() => {
      expect(syncWithServer).toHaveBeenCalledWith(mockWallets);
    });
  });
});
