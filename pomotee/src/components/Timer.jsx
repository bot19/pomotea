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
    }
  }, [timeRemaining, timerRunning, currentPomo, pauseTimer, completePomo]);

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
