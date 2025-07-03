import React, { useState, useEffect } from "react";

/**
 * Timer component for displaying and controlling pomodoro timer
 * Uses simplified props from the new timer hook
 */
function Timer({ timeRemaining, timerRunning, startTimer, pauseTimer }) {
  const [minutes, setMinutes] = useState(Math.floor(timeRemaining / 60));
  const [seconds, setSeconds] = useState(timeRemaining % 60);

  // Update display when timeRemaining changes
  useEffect(() => {
    setMinutes(Math.floor(timeRemaining / 60));
    setSeconds(timeRemaining % 60);
  }, [timeRemaining]);

  // Handle button click - start or pause
  const handleButtonClick = () => {
    if (timerRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  };

  return (
    <main className="spacing-md-bottom">
      <h2 className="font-mono">
        <span>{minutes.toString().padStart(2, "0")}</span>
        <span className="timer-colon">:</span>
        <span>{seconds.toString().padStart(2, "0")}</span>
      </h2>
      <button onClick={handleButtonClick}>
        {timerRunning ? "Pause" : "Start"}
      </button>
    </main>
  );
}

export default Timer;
