import { renderHook, act } from '@testing-library/react'
import { vi } from 'vitest'
import { usePomodoroTimer } from '../usePomodoroTimer'
import { CONFIG } from '../../config'

// Mock localStorage with proper implementation that maintains state
let localStorageData = {}
const localStorageMock = {
  getItem: vi.fn((key) => {
    return localStorageData[key] || null
  }),
  setItem: vi.fn((key, value) => {
    localStorageData[key] = value
  }),
  clear: vi.fn(() => {
    localStorageData = {}
  }),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock Date for consistent testing
const mockDate = new Date('2025-01-15T10:00:00.000Z')
const RealDate = global.Date
global.Date = class extends RealDate {
  constructor(...args) {
    if (args.length === 0) {
      return mockDate
    }
    return new RealDate(...args)
  }
  static now() {
    return mockDate.getTime()
  }
}

describe('usePomodoroTimer', () => {
  beforeEach(() => {
    // Clear all mocks and localStorage
    vi.clearAllMocks()
    localStorageMock.clear()
  })

  describe('1. Initialization - correct data creation', () => {
    it('should initialize with correct default values and create day object', () => {
      const { result } = renderHook(() => usePomodoroTimer())

      // Check initial timer state
      expect(result.current.timeRemaining).toBe(CONFIG.DEFAULT_POMO_LENGTH * 60) // 22 * 60 = 1320 seconds
      expect(result.current.timerRunning).toBe(false)
      expect(result.current.completedPomos).toBe(0)

      // Check that dayData was created with correct structure
      expect(result.current.dayData).toEqual({
        date: '2025-01-15',
        timeData: [],
        pomoLength: CONFIG.DEFAULT_POMO_LENGTH * 60,
        dayPomos: 0
      })

      // Verify localStorage was called to save the new day data with all properties
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'pomo_data',
        expect.stringContaining('"date":"2025-01-15"')
      )
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'pomo_data',
        expect.stringContaining('"timeData":[]')
      )
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'pomo_data',
        expect.stringContaining(`"pomoLength":${CONFIG.DEFAULT_POMO_LENGTH * 60}`)
      )
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'pomo_data',
        expect.stringContaining('"dayPomos":0')
      )

      // Verify the complete structure was saved as a valid JSON array
      // Get the last call to setItem (most recent state)
      const lastCallIndex = localStorageMock.setItem.mock.calls.length - 1
      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[lastCallIndex][1])
      
      expect(savedData).toEqual([
        {
          date: '2025-01-15',
          timeData: [],
          pomoLength: CONFIG.DEFAULT_POMO_LENGTH * 60,
          dayPomos: 0
        }
      ])
    })
  })

  // TODO: something feels off, need to check logic.
  describe('2. Timer countdown - start and countdown correctly', () => {
    it('should start timer and countdown correctly each second', async () => {
      // Spy on window.setInterval and window.clearInterval
      const setIntervalSpy = vi.spyOn(window, 'setInterval').mockImplementation((fn) => {
        setTimeout(fn, 0)
        return 123
      })
      const clearIntervalSpy = vi.spyOn(window, 'clearInterval').mockImplementation(() => {})

      const { result } = renderHook(() => usePomodoroTimer())

      // Initial state
      expect(result.current.timeRemaining).toBe(1320) // 22 minutes in seconds
      expect(result.current.timerRunning).toBe(false)

      // Start timer
      act(() => {
        result.current.startTimer()
      })

      // Check timer started
      expect(result.current.timerRunning).toBe(true)

      // Verify setInterval was called
      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 1000)

      // Simulate 5 seconds passing by calling the timer tick function
      const timerTickFunction = setIntervalSpy.mock.calls[0][0]
      
      // Advance time by 5 seconds
      const originalDate = global.Date
      global.Date = class extends originalDate {
        constructor(...args) {
          if (args.length === 0) {
            return new originalDate(mockDate.getTime() + 5000) // 5 seconds later
          }
          return new originalDate(...args)
        }
        static now() {
          return mockDate.getTime() + 5000
        }
      }

      act(() => {
        timerTickFunction()
      })

      // Check that timer has counted down by 5 seconds
      expect(result.current.timeRemaining).toBe(1315) // 1320 - 5 = 1315

      // Verify day object time segment was created with correct startTime
      expect(result.current.dayData.timeData).toHaveLength(1)
      expect(result.current.dayData.timeData[0][0]).toBe('2025-01-15T10:00:00.000Z') // startTime
      expect(result.current.dayData.timeData[0][1]).toBe(null) // duration (null for ongoing)

      setIntervalSpy.mockRestore()
      clearIntervalSpy.mockRestore()
    })
  })

  // TODO: same as above, or rethink how to test.
  describe('3. Pause functionality - timer pauses and saves correct elapsed time', () => {
    it('should pause timer and save correct elapsed time in day object', async () => {
      // Spy on window.setInterval and window.clearInterval
      const setIntervalSpy = vi.spyOn(window, 'setInterval').mockImplementation((fn) => {
        setTimeout(fn, 0)
        return 456
      })
      const clearIntervalSpy = vi.spyOn(window, 'clearInterval').mockImplementation(() => {})

      const { result } = renderHook(() => usePomodoroTimer())

      // Start timer
      act(() => {
        result.current.startTimer()
      })

      expect(result.current.timerRunning).toBe(true)

      // Verify that a time entry was created when starting
      expect(result.current.dayData.timeData).toHaveLength(1)
      expect(result.current.dayData.timeData[0][1]).toBe(null) // duration should be null (ongoing)

      // Simulate 10 seconds passing
      const timerTickFunction = setIntervalSpy.mock.calls[0][0]
      
      // Advance time by 10 seconds
      const originalDate = global.Date
      global.Date = class extends originalDate {
        constructor(...args) {
          if (args.length === 0) {
            return new originalDate(mockDate.getTime() + 10000) // 10 seconds later
          }
          return new originalDate(...args)
        }
        static now() {
          return mockDate.getTime() + 10000
        }
      }

      // Let timer tick to update display
      act(() => {
        timerTickFunction()
      })

      // Pause timer
      act(() => {
        result.current.pauseTimer()
      })

      // Check timer stopped
      expect(result.current.timerRunning).toBe(false)

      // Check that day object time segment has correct elapsed time
      expect(result.current.dayData.timeData).toHaveLength(1)
      expect(result.current.dayData.timeData[0][0]).toBe('2025-01-15T10:00:00.000Z') // startTime
      expect(result.current.dayData.timeData[0][1]).toBe(10) // duration should be 10 seconds

      // Verify localStorage was updated with the completed session
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'pomo_data',
        expect.stringContaining('"timeData":[["2025-01-15T10:00:00.000Z",10]]')
      )

      setIntervalSpy.mockRestore()
      clearIntervalSpy.mockRestore()
    })
  })
}) 