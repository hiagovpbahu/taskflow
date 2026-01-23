import '@testing-library/jest-dom'
import { vi } from 'vitest'

if (globalThis.window !== undefined) {
  Object.defineProperty(globalThis.window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })

  if (globalThis.window.Element !== undefined) {
    const originalHasPointerCapture = globalThis.window.Element.prototype.hasPointerCapture
    const originalSetPointerCapture = globalThis.window.Element.prototype.setPointerCapture
    const originalReleasePointerCapture =
      globalThis.window.Element.prototype.releasePointerCapture
    const originalScrollIntoView = globalThis.window.Element.prototype.scrollIntoView

    if (originalHasPointerCapture === undefined) {
      globalThis.window.Element.prototype.hasPointerCapture = vi.fn().mockReturnValue(false)
    }
    if (originalSetPointerCapture === undefined) {
      globalThis.window.Element.prototype.setPointerCapture = vi.fn()
    }
    if (originalReleasePointerCapture === undefined) {
      globalThis.window.Element.prototype.releasePointerCapture = vi.fn()
    }
    if (originalScrollIntoView === undefined) {
      globalThis.window.Element.prototype.scrollIntoView = vi.fn()
    }
  }
}
