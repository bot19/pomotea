import { useState, useEffect, useCallback, useRef } from "react";
import {
  loadCurrentDay,
  saveCurrentPomo,
  saveDonePomos,
  updateCurrentPomoTime,
  calculateCompletedPomos,
  getRemainingTime,
} from "../utils/localStorage";

export function usePomodoroTimer(initialDuration = 22) {
  const [pomoDuration, setPomoDuration] = useState(initialDuration);
  const [currentPomo, setCurrentPomo] = useState(null);
  const [pomosDone, setPomosDone] = useState([]);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(initialDuration * 60);
  const [totalPomos, setTotalPomos] = useState(0);
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
        const now = new Date().toISOString();
        const actualRemainingTime = getRemainingTime(
          currentPomo.startTime,
          now,
          pomoDuration
        );
        
        // Update UI every second
        setTimeRemaining(actualRemainingTime);
        
        // Do heavy work (storage updates, completed pomo calculations) every 10 seconds
        if (updateCounter % 10 === 0) {
          // Update current time in storage
          const updatedCurrent = updateCurrentPomoTime();
          if (updatedCurrent) {
            // Calculate actual completed pomos based on real elapsed time
            const actualCompletedPomos = calculateCompletedPomos(
              updatedCurrent.startTime,
              updatedCurrent.currentTime,
              pomoDuration
            );

            // If we have completed pomos that aren't in our done array, add them
            if (actualCompletedPomos > pomosDoneRef.current.length) {
              const newCompletedPomos = [];
              for (
                let i = pomosDoneRef.current.length;
                i < actualCompletedPomos;
                i++
              ) {
                const pomoStartTime = new Date(updatedCurrent.startTime);
                pomoStartTime.setSeconds(
                  pomoStartTime.getSeconds() + i * pomoDuration * 60
                );

                newCompletedPomos.push({
                  startTime: pomoStartTime.toISOString(),
                  currentTime: new Date().toISOString(),
                  stopTime: new Date().toISOString(),
                  totalPomo: i + 1,
                });
              }

              const updatedPomosDone = [
                ...pomosDoneRef.current,
                ...newCompletedPomos,
              ];
              setPomosDone(updatedPomosDone);
              setTotalPomos(actualCompletedPomos);
              saveDonePomos(updatedPomosDone, actualCompletedPomos);
            }
          }
        }
      }
    }, 1000); // Check every 1 second for smooth UI

    return () => clearInterval(backgroundInterval);
  }, [timerRunning, currentPomo, pomoDuration]);

  // Handle auto next pomo rollover
  useEffect(() => {
    if (autoNextPomo) {
      setTimeout(() => {
        console.log("usePomodoroTimer, autoNextPomo in 3s", autoNextPomo);
        startTimer();
        setAutoNextPomo(false);
      }, 3000);
    }
  }, [autoNextPomo]);

  // on app init, update state with storage values
  useEffect(() => {
    const storageDayData = loadCurrentDay();
    console.log("usePomodoroTimer, currentDayPomos", storageDayData);

    if (storageDayData.current) {
      setCurrentPomo(storageDayData.current);

      // Calculate remaining time based on real elapsed time
      const remainingTime = getRemainingTime(
        storageDayData.current.startTime,
        storageDayData.current.currentTime || storageDayData.current.startTime,
        pomoDuration
      );
      setTimeRemaining(remainingTime);

      // If timer was running (stopTime is null), check if it should still be running
      if (storageDayData.current.stopTime === null) {
        // Only start if there's actually time remaining
        if (remainingTime > 0) {
          setTimerRunning(true);
        } else {
          // Timer has completed, mark it as done
          const now = new Date().toISOString();
          const donePomo = {
            ...storageDayData.current,
            currentTime: now,
            stopTime: now,
            totalPomo: (storageDayData.totalPomos || 0) + 1,
          };
          setPomosDone((prev) => [...prev, donePomo]);
          setTotalPomos((storageDayData.totalPomos || 0) + 1);
          saveDonePomos(
            [...(storageDayData.done || []), donePomo],
            (storageDayData.totalPomos || 0) + 1
          );
          setCurrentPomo(null);
        }
      }
    }
    if (storageDayData.done.length > 0) {
      setPomosDone(storageDayData.done);
      setTotalPomos(storageDayData.totalPomos || storageDayData.done.length);
    }
  }, [pomoDuration]);

  const setNewPomoDuration = useCallback(
    (newDuration) => {
      setPomoDuration(newDuration);

      console.log(
        "usePomodoroTimer, set pomoDuration",
        timerRunning,
        currentPomo
      );

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
      console.log("usePomodoroTimer, startTimer");

      // Start a new pomo with real-time tracking
      const now = new Date().toISOString();
      const newPomo = {
        startTime: now,
        currentTime: now,
        stopTime: null,
        totalPomo: 0,
      };

      setCurrentPomo(newPomo);
      saveCurrentPomo(newPomo);
    } else {
      // Resume existing pomo - update current time
      const now = new Date().toISOString();
      const updatedPomo = {
        ...currentPomo,
        currentTime: now,
        stopTime: null,
      };
      setCurrentPomo(updatedPomo);
      saveCurrentPomo(updatedPomo);
    }
  }, [currentPomo, pomoDuration]);

  const pauseTimer = useCallback(() => {
    // can only pause if timer running = has current pomo
    setTimerRunning(false);

    const now = new Date().toISOString();
    const newPomo = {
      ...currentPomo,
      currentTime: now,
      stopTime: now,
    };

    console.log("usePomodoroTimer, pauseTimer", newPomo);
    setCurrentPomo(newPomo);
    saveCurrentPomo(newPomo);
  }, [currentPomo, timeRemaining]);

  const completePomo = useCallback(() => {
    const now = new Date().toISOString();
    const donePomo = {
      ...currentPomo,
      currentTime: now,
      stopTime: now,
      totalPomo: totalPomos + 1,
    };

    console.log("usePomodoroTimer, completePomo", donePomo);
    setCurrentPomo(null);
    setPomosDone((prevPomosDone) => {
      const pomosDone = [...prevPomosDone, donePomo];
      const newTotalPomos = totalPomos + 1;
      setTotalPomos(newTotalPomos);
      saveDonePomos(pomosDone, newTotalPomos);
      return pomosDone;
    });
    
    // Trigger auto next pomo
    setAutoNextPomo(true);
  }, [currentPomo, pomoDuration, totalPomos]);

  return {
    // State
    pomoDuration,
    currentPomo,
    pomosDone,
    timerRunning,
    timeRemaining,
    totalPomos,
    autoNextPomo,
    
    // Actions
    setNewPomoDuration,
    startTimer,
    pauseTimer,
    completePomo,
    setTimeRemaining,
  };
} 