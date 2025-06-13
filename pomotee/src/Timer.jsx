import React, { useState, useEffect } from "react";
import { saveCurrentPomo } from "./utils/localStorage";

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

  // as timer running, descrease pomo duration
  useEffect(() => {
    let intervalId;

    if (timerRunning) {
      intervalId = setInterval(() => {
        setTimeRemaining((prevTime) => {
          if (prevTime > 0) {
            const newTimeRemaining = prevTime - 1;

            // save to storage to persist state
            const newCurrentPomo = {
              ...currentPomo,
              timeLeft: newTimeRemaining,
            };
            console.log(
              "Timer, useEffect timer countdown - stage storage",
              newCurrentPomo
            );
            saveCurrentPomo(newCurrentPomo);

            return newTimeRemaining;
          } else {
            // Timer has reached 0
            clearInterval(intervalId);
            pauseTimer();
            completePomo();

            setAutoNextPomo(true);
            // reset timeRemaining
            return pomoDuration * 60;
          }
        });
      }, 1000);
    }

    return () => clearInterval(intervalId);
  }, [
    timerRunning,
    setTimeRemaining,
    pomoDuration,
    pauseTimer,
    completePomo,
    currentPomo,
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
