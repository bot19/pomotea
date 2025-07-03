import '@testing-library/jest-dom'

// Mock localStorage for tests
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Mock timers for consistent testing
beforeEach(() => {
  jest.useFakeTimers()
  localStorageMock.getItem.mockClear()
  localStorageMock.setItem.mockClear()
})

afterEach(() => {
  jest.runOnlyPendingTimers()
  jest.useRealTimers()
}) 