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
  
  // Auto-start next pomodoro flag
  const [shouldStartNext, setShouldStartNext] = useState(false);
  
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
   * Start or resume timer
   */
  const startTimer = useCallback(() => {
    if (timerRunning) return;

    // Check if there's an ongoing session (latest entry has null duration)
    const hasOngoingSession = dayData && 
                             dayData.timeData.length > 0 && 
                             dayData.timeData[0][1] === null;

    if (hasOngoingSession) {
      // Resume existing session - don't create new entry
      const latestEntry = dayData.timeData[0];
      setCurrentStartTime(latestEntry[0]); // Use the existing start time
      setTimerRunning(true);
    } else {
      // Start new session
      const now = new Date().toISOString();
      setCurrentStartTime(now);
      setTimerRunning(true);
      
      // Add new time entry with null duration (ongoing)
      const updatedData = addTimeEntry(now, null);
      setDayData(updatedData);
    }
  }, [timerRunning, dayData]);

  /**
   * Helper function to complete current timer session
   */
  const completeCurrentSession = useCallback(() => {
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
  }, [timerRunning, currentStartTime, calculateTimerDisplay, dayData]);

  /**
   * Pause timer
   */
  const pauseTimer = useCallback(() => {
    completeCurrentSession();
  }, [completeCurrentSession]);

  /**
   * Stop timer (when pomodoro completes)
   */
  const stopTimer = useCallback(() => {
    completeCurrentSession();
    setShouldStartNext(true); // Trigger auto-start of next pomodoro
  }, [completeCurrentSession]);

  /**
   * Handle timer tick (for display purposes only)
   */
  const handleTimerTick = useCallback(() => {
    if (!timerRunning || !currentStartTime || !dayData) return;

    const now = new Date();
    const startTime = new Date(currentStartTime);
    const elapsed = Math.floor((now - startTime) / 1000);
    
    // Calculate total elapsed including previous completed sessions
    const previousElapsed = dayData.timeData.reduce((total, [_, duration]) => {
      return total + (duration || 0);
    }, 0);
    
    const totalElapsed = previousElapsed + elapsed;
    const pomoLength = dayData.pomoLength;
    
    // Update display values
    const completedPomos = Math.floor(totalElapsed / pomoLength);
    const timeRemaining = Math.max(0, pomoLength - (totalElapsed % pomoLength));
    
    console.log('Timer tick:', { totalElapsed, pomoLength, timeRemaining, completedPomos });
    
    setCompletedPomos(completedPomos);
    setTimeRemaining(timeRemaining);
    
    // Auto-stop if pomodoro is complete
    // Check if we've completed a full pomodoro
    const currentPomoProgress = totalElapsed % pomoLength;
    if (currentPomoProgress === 0 && totalElapsed >= pomoLength) {
      console.log('Pomodoro completed, triggering auto-start');
      // Complete current session and trigger auto-start
      completeCurrentSession();
      setShouldStartNext(true);
    }
  }, [timerRunning, currentStartTime, dayData, completeCurrentSession]);

  // Initialize day data on mount
  useEffect(() => {
    const data = getPomoData();
    setDayData(data);
    const { completedPomos, timeRemaining } = calculateTimerDisplay(data.timeData, data.pomoLength);
    setCompletedPomos(completedPomos);
    setTimeRemaining(timeRemaining);
  }, [calculateTimerDisplay]);

  // Handle auto-start next pomodoro
  useEffect(() => {
    if (shouldStartNext) {
      const now = new Date().toISOString();
      setCurrentStartTime(now);
      setTimerRunning(true);
      
      // Add new time entry with null duration (ongoing)
      const newData = addTimeEntry(now, null);
      setDayData(newData);
      
      setShouldStartNext(false); // Reset the flag
    }
  }, [shouldStartNext]);

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