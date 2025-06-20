import React, { useState, useEffect } from "react";

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

  // Check if pomo is complete when timeRemaining reaches 0
  useEffect(() => {
    if (timeRemaining <= 0 && timerRunning && currentPomo) {
      console.log("Timer, pomo completed via timeRemaining");
      pauseTimer();
      completePomo();
      setAutoNextPomo(true);
    }
  }, [timeRemaining, timerRunning, currentPomo, pauseTimer, completePomo]);

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
