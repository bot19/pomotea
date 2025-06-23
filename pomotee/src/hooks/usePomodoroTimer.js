import { useState, useEffect, useCallback, useRef } from "react";
import {
  loadCurrentDay,
  saveCurrentPomo,
  saveDonePomos,
  updateCurrentPomoTime,
  getRemainingTime,
  calculateDayPomos,
  createNewPomo,
  completeCurrentPomo,
} from "../utils/localStorage";

export function usePomodoroTimer(initialDuration = 22) {
  const [pomoDuration, setPomoDuration] = useState(initialDuration);
  const [currentPomo, setCurrentPomo] = useState(null);
  const [pomosDone, setPomosDone] = useState([]);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(initialDuration * 60);
  const [dayPomos, setDayPomos] = useState(0);
  const [autoNextPomo, setAutoNextPomo] = useState(false);
  
  // Use ref to track current pomosDone value without causing effect re-runs
  const pomosDoneRef = useRef(pomosDone);
  pomosDoneRef.current = pomosDone;

  // Background interval to handle silent pauses - runs every 1 second for smooth UI, heavy work every 10 seconds
  useEffect(() => {
    let updateCounter = 0;
    const backgroundInterval = setInterval(() => {
      if (timerRunning && currentPomo) {
        updateCounter++;
        
        // Calculate remaining time every second for smooth UI
        const actualRemainingTime = getRemainingTime(currentPomo, pomoDuration);
        setTimeRemaining(actualRemainingTime);
        
        // Do heavy work (storage updates, silent pause handling) every 10 seconds
        if (updateCounter % 10 === 0) {
          // Update current time in storage and handle silent pauses
          const updatedCurrent = updateCurrentPomoTime();
          if (updatedCurrent) {
            // Check if we got a new current pomo (silent pause occurred)
            if (updatedCurrent !== currentPomo) {
              setCurrentPomo(updatedCurrent);
              
              // Reload current day data to get updated done array and dayPomos
              const storageDayData = loadCurrentDay();
              setPomosDone(storageDayData.done || []);
              setDayPomos(storageDayData.dayPomos || 0);
            }
          }
        }
      } else if (!currentPomo) {
        // No current pomo, set time to full duration
        setTimeRemaining(pomoDuration * 60);
      }
    }, 1000); // Check every 1 second for smooth UI

    return () => clearInterval(backgroundInterval);
  }, [timerRunning, currentPomo, pomoDuration]);

  // Handle auto next pomo rollover
  useEffect(() => {
    if (autoNextPomo) {
      setTimeout(() => {
        startTimer();
        setAutoNextPomo(false);
      }, 3000);
    }
  }, [autoNextPomo]);

  // on app init, update state with storage values
  useEffect(() => {
    const storageDayData = loadCurrentDay();

    if (storageDayData.current) {
      setCurrentPomo(storageDayData.current);

      // Calculate remaining time based on real elapsed time
      const remainingTime = getRemainingTime(storageDayData.current, pomoDuration);
      setTimeRemaining(remainingTime);

      // If timer was running (endTime is null), check if it should still be running
      if (storageDayData.current.endTime === null) {
        // Only start if there's actually time remaining
        if (remainingTime > 0) {
          setTimerRunning(true);
        } else {
          // Timer has completed, mark it as done
          const donePomo = completeCurrentPomo(storageDayData.current);
          if (donePomo) {
            const updatedDone = [...(storageDayData.done || []), donePomo];
            const updatedDayPomos = calculateDayPomos(updatedDone);
            
            setPomosDone(updatedDone);
            setDayPomos(updatedDayPomos);
            saveDonePomos(updatedDone, updatedDayPomos);
            setCurrentPomo(null);
          }
        }
      }
    } else {
      // No current pomo, set initial time
      setTimeRemaining(pomoDuration * 60);
    }
    
    if (storageDayData.done && storageDayData.done.length > 0) {
      setPomosDone(storageDayData.done);
      setDayPomos(storageDayData.dayPomos || calculateDayPomos(storageDayData.done));
    }
  }, [pomoDuration]);

  const setNewPomoDuration = useCallback(
    (newDuration) => {
      setPomoDuration(newDuration);

      // don't reset timeRemaining if pomo in progress
      if (!timerRunning && !currentPomo) {
        setTimeRemaining(newDuration * 60);
      }
    },
    [timerRunning, currentPomo]
  );

  const startTimer = useCallback(() => {
    setTimerRunning(true);

    // if no pomos yet, or last pomo is completed
    if (!currentPomo) {
      // Start a new pomo with the new data structure
      const newPomo = createNewPomo(pomoDuration);
      setCurrentPomo(newPomo);
      saveCurrentPomo(newPomo);
    } else {
      // Resume existing pomo - update endTime to null to indicate running
      const updatedPomo = {
        ...currentPomo,
        endTime: null,
      };
      setCurrentPomo(updatedPomo);
      saveCurrentPomo(updatedPomo);
    }
  }, [currentPomo, pomoDuration]);

  const pauseTimer = useCallback(() => {
    // can only pause if timer running = has current pomo
    setTimerRunning(false);

    const now = new Date().toISOString();
    const updatedPomo = {
      ...currentPomo,
      endTime: now,
    };

    setCurrentPomo(updatedPomo);
    saveCurrentPomo(updatedPomo);
  }, [currentPomo]);

  const completePomo = useCallback(() => {
    const donePomo = completeCurrentPomo(currentPomo);
    if (!donePomo) return;

    setCurrentPomo(null);
    setPomosDone((prevPomosDone) => {
      const pomosDone = [...prevPomosDone, donePomo];
      const newDayPomos = calculateDayPomos(pomosDone);
      setDayPomos(newDayPomos);
      saveDonePomos(pomosDone, newDayPomos);
      return pomosDone;
    });
    
    // Trigger auto next pomo
    setAutoNextPomo(true);
  }, [currentPomo]);

  return {
    // State
    pomoDuration,
    currentPomo,
    pomosDone,
    timerRunning,
    timeRemaining,
    dayPomos,
    autoNextPomo,
    
    // Actions
    setNewPomoDuration,
    startTimer,
    pauseTimer,
    completePomo,
    setTimeRemaining,
  };
} 