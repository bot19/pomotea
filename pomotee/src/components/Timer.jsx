import React, { useState, useEffect } from "react";
import {
  saveCurrentPomo,
  updateCurrentPomoTime,
  getRemainingTime,
} from "../utils/localStorage";

function Timer({
  currentPomo,
  timeRemaining,
  timerRunning,
  startTimer,
  pauseTimer, // memo
  setTimeRemaining, // stable
  pomoDuration,
  completePomo, // memo
}) {
  const [minutes, setMinutes] = useState(Math.floor(timeRemaining / 60));
  const [seconds, setSeconds] = useState(timeRemaining % 60);
  const [autoNextPomo, setAutoNextPomo] = useState(false);

  // reflect timeRemaining as min/sec
  useEffect(() => {
    console.log(
      "Timer, timeRemaining changed, update M:S Timer",
      timeRemaining
    );
    setMinutes(Math.floor(timeRemaining / 60));
    setSeconds(timeRemaining % 60);
  }, [timeRemaining]);

  // Real-time timer update - runs every second when timer is running
  useEffect(() => {
    let intervalId;

    if (timerRunning && currentPomo) {
      intervalId = setInterval(() => {
        // Update current time in storage
        const updatedCurrent = updateCurrentPomoTime();
        if (updatedCurrent) {
          // Calculate remaining time based on real elapsed time
          const actualRemainingTime = getRemainingTime(
            updatedCurrent.startTime,
            updatedCurrent.currentTime,
            pomoDuration
          );

          setTimeRemaining(actualRemainingTime);

          // Check if current pomo is complete
          if (actualRemainingTime <= 0) {
            clearInterval(intervalId);
            pauseTimer();
            completePomo();
            setAutoNextPomo(true);
          }
        }
      }, 1000);
    }

    return () => clearInterval(intervalId);
  }, [
    timerRunning,
    currentPomo,
    pomoDuration,
    setTimeRemaining,
    pauseTimer,
    completePomo,
  ]);

  // need to pomo roll over, X sec warning
  useEffect(() => {
    if (autoNextPomo) {
      setTimeout(() => {
        console.log("Timer, autoNextPomo in 3s", autoNextPomo);
        startTimer();
        setAutoNextPomo(false);
      }, 3000);
    }
  }, [autoNextPomo, startTimer]);

  return (
    <main className="spacing-md-bottom">
      <h2 className="font-mono">
        <span>{minutes.toString().padStart(2, "0")}</span>
        <span className="timer-colon">:</span>
        <span>{seconds.toString().padStart(2, "0")}</span>
      </h2>
      <button onClick={timerRunning ? pauseTimer : startTimer}>
        {timerRunning ? "Pause" : "Start"}
      </button>
    </main>
  );
}

export default Timer;
