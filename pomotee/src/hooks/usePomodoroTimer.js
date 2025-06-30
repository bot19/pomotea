import { useState, useEffect, useCallback, useRef } from "react";
import { 
  getPomoData, 
  addTimeEntry, 
  updateLastTimeEntry, 
  createDayData 
} from "../utils/localStorage";
import { CONFIG } from "../config";

/**
 * Custom hook for Pomodoro timer functionality
 * Manages timer state and timeData recording separately
 */
export function usePomodoroTimer() {
  // Timer display state
  const [timeRemaining, setTimeRemaining] = useState(CONFIG.DEFAULT_POMO_LENGTH * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [completedPomos, setCompletedPomos] = useState(0);
  
  // Current session state
  const [currentStartTime, setCurrentStartTime] = useState(null);
  const [dayData, setDayData] = useState(null);
  
  // Timer interval reference
  const intervalRef = useRef(null);

  /**
   * Calculate timer display values from timeData
   * @param {Array} timeData - Array of [startTime, duration] pairs
   * @param {number} pomoLength - Length of one pomodoro in seconds
   * @returns {Object} { completedPomos, timeRemaining, totalElapsed }
   */
  const calculateTimerDisplay = useCallback((timeData, pomoLength) => {
    if (!timeData || timeData.length === 0) {
      return { completedPomos: 0, timeRemaining: pomoLength, totalElapsed: 0 };
    }

    // Calculate total elapsed time from all completed entries
    const totalElapsed = timeData.reduce((total, [startTime, duration]) => {
      if (duration !== null && duration !== undefined) {
        return total + duration;
      }
      return total;
    }, 0);

    // Calculate completed pomodoros
    const completedPomos = Math.floor(totalElapsed / pomoLength);
    
    // Calculate time remaining in current pomodoro
    const timeRemaining = pomoLength - (totalElapsed % pomoLength);

    return { completedPomos, timeRemaining, totalElapsed };
  }, []);

  /**
   * Load and initialize day data
   */
  const loadDayData = useCallback(() => {
    const data = getPomoData(); // Now guaranteed to return valid data
    setDayData(data);
    const { completedPomos, timeRemaining } = calculateTimerDisplay(data.timeData, data.pomoLength);
    setCompletedPomos(completedPomos);
    setTimeRemaining(timeRemaining);
  }, [calculateTimerDisplay]);

  /**
   * Start or resume timer
   */
  const startTimer = useCallback(() => {
    if (timerRunning) return;

    const now = new Date().toISOString();
    setCurrentStartTime(now);
    setTimerRunning(true);
    
    // Add new time entry with null duration (ongoing)
    const updatedData = addTimeEntry(now, null);
    setDayData(updatedData);
  }, [timerRunning]);

  /**
   * Pause timer
   */
  const pauseTimer = useCallback(() => {
    if (!timerRunning || !currentStartTime) return;

    const now = new Date();
    const startTime = new Date(currentStartTime);
    const duration = Math.floor((now - startTime) / 1000); // Duration in seconds

    // Update the last time entry with calculated duration
    const updatedData = updateLastTimeEntry(duration);
    
    if (updatedData) {
      setDayData(updatedData);
      
      // Recalculate timer display
      const { completedPomos, timeRemaining } = calculateTimerDisplay(updatedData.timeData, updatedData.pomoLength);
      setCompletedPomos(completedPomos);
      setTimeRemaining(timeRemaining);
    }
    
    setTimerRunning(false);
    setCurrentStartTime(null);
  }, [timerRunning, currentStartTime, calculateTimerDisplay]);

  /**
   * Stop timer (when pomodoro completes)
   */
  const stopTimer = useCallback(() => {
    if (!timerRunning || !currentStartTime) return;

    const now = new Date();
    const startTime = new Date(currentStartTime);
    const duration = Math.floor((now - startTime) / 1000);

    // Update the last time entry with final duration
    const updatedData = updateLastTimeEntry(duration);
    
    if (updatedData) {
      setDayData(updatedData);
      
      // Recalculate timer display
      const { completedPomos, timeRemaining } = calculateTimerDisplay(updatedData.timeData, updatedData.pomoLength);
      setCompletedPomos(completedPomos);
      setTimeRemaining(timeRemaining);
    }
    
    setTimerRunning(false);
    setCurrentStartTime(null);
  }, [timerRunning, currentStartTime, calculateTimerDisplay]);

  /**
   * Handle timer tick (for display purposes only)
   */
  const handleTimerTick = useCallback(() => {
    if (!timerRunning || !currentStartTime || !dayData) return;

    const now = new Date();
    const startTime = new Date(currentStartTime);
    const elapsed = Math.floor((now - startTime) / 1000);
    
    // Calculate total elapsed including previous sessions
    const previousElapsed = dayData.timeData.reduce((total, [_, duration]) => {
      return total + (duration || 0);
    }, 0);
    
    const totalElapsed = previousElapsed + elapsed;
    const pomoLength = dayData.pomoLength;
    
    // Update display values
    const completedPomos = Math.floor(totalElapsed / pomoLength);
    const timeRemaining = pomoLength - (totalElapsed % pomoLength);
    
    setCompletedPomos(completedPomos);
    setTimeRemaining(timeRemaining);
    
    // Auto-stop if pomodoro is complete
    if (timeRemaining <= 0) {
      stopTimer();
    }
  }, [timerRunning, currentStartTime, dayData, stopTimer]);

  // Initialize day data on mount
  useEffect(() => {
    loadDayData();
  }, [loadDayData]);

  // Timer interval for display updates
  useEffect(() => {
    if (timerRunning) {
      intervalRef.current = setInterval(handleTimerTick, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerRunning, handleTimerTick]);

  return {
    timeRemaining,
    timerRunning,
    completedPomos,
    startTimer,
    pauseTimer,
    stopTimer,
    dayData
  };
} 