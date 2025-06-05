import React, { useState, useEffect } from "react";

function Timer({
  timeRemaining,
  timerRunning,
  startTimer,
  pauseTimer,
  setTimeRemaining,
  pomoDuration,
  completePomo,
}) {
  const [minutes, setMinutes] = useState(Math.floor(timeRemaining / 60));
  const [seconds, setSeconds] = useState(timeRemaining % 60);

  useEffect(() => {
    setMinutes(Math.floor(timeRemaining / 60));
    setSeconds(timeRemaining % 60);
  }, [timeRemaining]);

  useEffect(() => {
    let intervalId;

    if (timerRunning) {
      intervalId = setInterval(() => {
        setTimeRemaining((prevTime) => {
          if (prevTime > 0) {
            return prevTime - 1;
          } else {
            // Timer has reached 0
            clearInterval(intervalId);
            pauseTimer();
            completePomo();
            // Restart the timer and increment pomo count
            setTimeRemaining(pomoDuration * 60);
            return pomoDuration * 60;
          }
        });
      }, 1000);
    }

    return () => clearInterval(intervalId);
  }, [timerRunning, setTimeRemaining, pomoDuration, pauseTimer, completePomo]);

  return (
    <div>
      <h2>Timer</h2>
      <div>
        <span>{minutes.toString().padStart(2, "0")}</span>:
        <span>{seconds.toString().padStart(2, "0")}</span>
      </div>
      <button onClick={timerRunning ? pauseTimer : startTimer}>
        {timerRunning ? "Pause" : "Start"}
      </button>
    </div>
  );
}

export default Timer;
