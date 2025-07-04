import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock localStorage for tests
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.localStorage = localStorageMock

// Mock timers for consistent testing
beforeEach(() => {
  vi.useFakeTimers()
  localStorageMock.getItem.mockClear()
  localStorageMock.setItem.mockClear()
})

afterEach(() => {
  vi.runOnlyPendingTimers()
  vi.useRealTimers()
}) 