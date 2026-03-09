import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('@/presentation/view/admin/crosschain-configs/useAdminCrosschainConfigs', () => ({
  useAdminCrosschainConfigs: jest.fn(),
}));

jest.mock('@/presentation/hooks', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@/presentation/components/organisms', () => ({
  ChainSelector: () => <div data-testid="chain-selector" />,
}));

jest.mock('@/presentation/components/atoms', () => ({
  Button: ({ children, onClick, disabled, className }: any) => (
    <button type="button" onClick={onClick} disabled={disabled} className={className}>
      {children}
    </button>
  ),
  Card: ({ children }: any) => <div>{children}</div>,
  Input: (props: any) => <input {...props} />,
}));

const { AdminCrosschainConfigsView } = require('@/presentation/view/admin/crosschain-configs/AdminCrosschainConfigsView');
const { useAdminCrosschainConfigs } = require('@/presentation/view/admin/crosschain-configs/useAdminCrosschainConfigs');

describe('AdminCrosschainConfigsView phase D diagnostics', () => {
  it('renders quote schema mismatch + path + reason from preflight payload', () => {
    const noop = jest.fn();
    const actions = {
      refresh: noop,
      setSourceChainId: noop,
      setDestChainId: noop,
      setStatusFilter: noop,
      setupSelectedSource: noop,
      recheckVisible: noop,
      autoFixVisible: noop,
      setPolicyDefaultBridgeType: noop,
      setPolicyFallbackMode: noop,
      setPolicyFallbackOrderInput: noop,
      setPolicyPerByteRate: noop,
      setPolicyOverheadBytes: noop,
      setPolicyMinFee: noop,
      setPolicyMaxFee: noop,
      saveRoutePolicy: noop,
      applyPreflightSuggestion: noop,
      runPreflightNextStep: noop,
      configureLayerZeroE2ESelected: noop,
      handleManualSourceChainChange: noop,
      handleManualDestChainChange: noop,
      handleManualBridgeTypeChange: noop,
      setManualAdapterAddress: noop,
      registerAdapterManual: noop,
      setDefaultBridgeManual: noop,
      setDefaultBridgeQuick: noop,
      setManualStateMachineIdHex: noop,
      setManualDestinationContractHex: noop,
      setHyperbridgeManual: noop,
      setManualCCIPChainSelector: noop,
      setManualCCIPDestinationAdapterHex: noop,
      setManualCCIPDestinationGasLimit: noop,
      setManualCCIPDestinationExtraArgsHex: noop,
      setManualCCIPDestinationFeeTokenAddress: noop,
      setManualCCIPSourceChainSelector: noop,
      setManualCCIPTrustedSenderHex: noop,
      setManualCCIPAllowSourceChain: noop,
      setCCIPManual: noop,
      setManualLayerZeroDstEid: noop,
      setManualLayerZeroSrcEid: noop,
      setManualLayerZeroSenderAddress: noop,
      setManualLayerZeroReceiverAddress: noop,
      setManualLayerZeroPeerHex: noop,
      setManualLayerZeroOptionsHex: noop,
      setLayerZeroManual: noop,
      verifySelectedSource: noop,
      autoFixSelectedSourceErrors: noop,
      exportWizardReport: noop,
      recheckRoute: noop,
      autoFixRoute: noop,
    };

    (useAdminCrosschainConfigs as jest.Mock).mockReturnValue({
      state: {
        sourceChains: [],
        destinationChains: [],
        sourceChainId: 'source-chain',
        destChainId: 'dest-chain',
        statusFilter: 'ALL',
        isPending: false,
        isLoading: false,
        isPreflightLoading: false,
        isRoutePolicyLoading: false,
        routes: [
          {
            routeKey: 'source-chain->dest-chain',
            sourceChainName: 'Base',
            destChainName: 'Polygon',
            sourceChainId: 'eip155:8453',
            destChainId: 'eip155:137',
            defaultBridgeType: 1,
            adapterRegistered: true,
            hyperbridgeConfigured: false,
            ccipConfigured: true,
            feeQuoteHealthy: false,
            quoteSchemaMismatch: true,
            quotePathUsed: 'quotePaymentFee(legacy)',
            quoteFailureReason: 'execution reverted',
            overallStatus: 'ERROR',
            issues: [],
          },
        ],
        preflight: {
          sourceChainId: 'eip155:8453',
          destChainId: 'eip155:137',
          defaultBridgeType: 1,
          bridges: [
            {
              bridgeType: 1,
              bridgeName: 'CCIP',
              ready: false,
              checks: {
                adapterRegistered: true,
                routeConfigured: true,
                feeQuoteHealthy: false,
              },
              quoteSchemaMismatch: true,
              quotePathUsed: 'quotePaymentFee(legacy)',
              quoteFailureReason: 'execution reverted',
              errorCode: 'FEE_QUOTE_FAILED',
              errorMessage: 'fee quote call failed for this bridge route',
            },
          ],
        },
        layerZeroE2EStatus: null,
        isLayerZeroE2EStatusLoading: false,
        activeRoutePolicy: null,
        policyDefaultBridgeType: '0',
        policyFallbackMode: 'strict',
        policyFallbackOrderInput: '',
        policyPerByteRate: '',
        policyOverheadBytes: '',
        policyMinFee: '',
        policyMaxFee: '',
        manualBridgeType: '1',
        manualBridgeOptions: [
          { bridgeType: '0', name: 'Hyperbridge' },
          { bridgeType: '1', name: 'CCIP' },
        ],
        manualExecution: {
          step1: { status: 'PENDING', txHashes: [] },
          step2: { status: 'PENDING', txHashes: [] },
          step3: { status: 'PENDING', txHashes: [] },
          step4: { status: 'PENDING', txHashes: [] },
        },
        manualStepCompleted: { step1: false, step2: false, step3: false, step4: false },
        manualCurrentStep: 1,
        manualSourceChainId: '',
        manualDestChainId: '',
        manualAdapterAddress: '',
        manualStateMachineIdHex: '',
        manualDestinationContractHex: '',
        manualCCIPChainSelector: '',
        manualCCIPDestinationAdapterHex: '',
        manualCCIPDestinationGasLimit: '',
        manualCCIPDestinationExtraArgsHex: '',
        manualCCIPDestinationFeeTokenAddress: '',
        manualCCIPSourceChainSelector: '',
        manualCCIPTrustedSenderHex: '',
        manualCCIPAllowSourceChain: true,
        manualLayerZeroDstEid: '',
        manualLayerZeroSrcEid: '',
        manualLayerZeroSenderAddress: '',
        manualLayerZeroReceiverAddress: '',
        manualLayerZeroPeerHex: '',
        manualLayerZeroOptionsHex: '',
        manualSourceAdapterContracts: [],
        manualDestHyperContracts: [],
        manualDestCCIPContracts: [],
        manualDestLayerZeroContracts: [],
        selectedSourceRoutes: [],
        selectedSourceErrorRoutes: [],
        wizardReport: null,
      },
      actions,
    });

    render(<AdminCrosschainConfigsView />);

    expect(screen.getAllByText(/quote path:/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/quotePaymentFee\(legacy\)/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/quote reason:/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/execution reverted/i).length).toBeGreaterThan(0);
  });
});
