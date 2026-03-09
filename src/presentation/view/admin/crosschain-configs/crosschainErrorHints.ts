const MESSAGE_REPLACEMENTS: Array<[string, string]> = [
  ['quote_failed_schema_mismatch', 'quote schema mismatch (ABI router/adapter tidak sinkron)'],
  ['function selector was not recognized and there\'s no fallback function', 'quote schema mismatch (ABI router/adapter tidak sinkron)'],
  ['no method with id', 'quote schema mismatch (ABI router/adapter tidak sinkron): no method with id'],
  ['fee quote call failed for this bridge route', 'fee quote bridge gagal'],
  ['fee quote call failed for this route', 'fee quote route gagal'],
  ['route not configured', 'route belum dikonfigurasi'],
  ['ccip chain selector missing', 'CCIP chain selector belum diset'],
  ['destination adapter missing', 'adapter tujuan belum diset'],
  ['hyperbridge state machine id not set', 'state machine Hyperbridge belum diset'],
  ['hyperbridge destination not set', 'destination Hyperbridge belum diset'],
  ['native fee quote unavailable', 'native fee quote belum tersedia'],
  ['insufficient native fee', 'native fee tidak cukup'],
  ['execution_reverted', 'eksekusi revert'],
];

export const normalizeCrosschainErrorMessage = (message: string): string => {
  const text = String(message || '').trim();
  if (!text) return text;
  return MESSAGE_REPLACEMENTS.reduce((acc, [from, to]) => acc.replace(from, to), text);
};

export const isQuoteSchemaMismatchMessage = (message: string): boolean => {
  const value = String(message || '').toLowerCase();
  if (!value) return false;
  return (
    value.includes('quote_failed_schema_mismatch') ||
    value.includes('selector was not recognized') ||
    value.includes("there's no fallback function") ||
    value.includes('no method with id')
  );
};

export const recommendActionByErrorCode = (code: string): string => {
  const value = String(code || '').trim().toUpperCase();
  switch (value) {
    case 'ADAPTER_NOT_REGISTERED':
      return 'Register adapter untuk bridge type ini.';
    case 'HYPERBRIDGE_NOT_CONFIGURED':
      return 'Set state machine + destination contract Hyperbridge.';
    case 'CCIP_NOT_CONFIGURED':
      return 'Set CCIP chain selector + destination adapter.';
    case 'LAYERZERO_NOT_CONFIGURED':
      return 'Set LayerZero dstEid + peer.';
    case 'FEE_QUOTE_FAILED':
      return 'Periksa fee quote, saldo native fee, dan konfigurasi route on-chain.';
    default:
      return '';
  }
};
