import '@testing-library/jest-dom'
import { TextDecoder, TextEncoder } from 'util'

if (typeof global.TextEncoder === 'undefined') {
  // viem/crypto helpers require TextEncoder in Jest runtime.
  ;(global as any).TextEncoder = TextEncoder
}

if (typeof global.TextDecoder === 'undefined') {
  ;(global as any).TextDecoder = TextDecoder
}

if (typeof window !== 'undefined' && typeof window.matchMedia === 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  })
}
