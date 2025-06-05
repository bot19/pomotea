import React, { useState, useEffect } from "react";
import Timer from "./Timer";
import PomoTracker from "./PomoTracker";
import Settings from "./Settings";
import { loadCurrentDayPomos, saveCurrentDayPomos } from "./utils/localStorage";
import "./App.css";

function App() {
  const [pomoDuration, setPomoDuration] = useState(25); // Default to 25 minutes
  const [currentDayPomos, setCurrentDayPomos] = useState(() => {
    return loadCurrentDayPomos();
  });
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(pomoDuration * 60);

  useEffect(() => {
    // Update timeRemaining when pomoDuration changes and timer is not running
    if (!timerRunning) {
      setTimeRemaining(pomoDuration * 60);
    }
  }, [pomoDuration, timerRunning]);

  useEffect(() => {
    // Save to localStorage every 30 seconds
    const intervalId = setInterval(() => {
      saveCurrentDayPomos(currentDayPomos);
    }, 30000);

    return () => clearInterval(intervalId);
  }, [currentDayPomos]);

  useEffect(() => {
    // Load from localStorage on page load
    const savedPomos = loadCurrentDayPomos();
    if (savedPomos) {
      setCurrentDayPomos(savedPomos);
      // Check for an incomplete pomo and resume the timer
      const incompletePomo = savedPomos.find((pomo) => !pomo.completed);
      if (incompletePomo) {
        // Calculate the remaining time based on the start time and current time
        const startTime = new Date(incompletePomo.startTime).getTime();
        const now = Date.now();
        const elapsedTime = now - startTime;
        const remaining = pomoDuration * 60 * 1000 - elapsedTime;

        if (remaining > 0 && !timerRunning) {
          setTimeRemaining(Math.floor(remaining / 1000));
          setTimerRunning(true);
        } else {
          // The pomo has already expired, complete it
          completePomo();
        }
      }
    }
  }, [pomoDuration, timerRunning]);

  const startTimer = () => {
    setTimerRunning(true);
    if (
      currentDayPomos.length === 0 ||
      currentDayPomos[currentDayPomos.length - 1].completed
    ) {
      // Start a new pomo
      const newPomo = {
        startTime: new Date().toISOString(),
        completed: false,
        endTime: null,
      };
      setCurrentDayPomos([...currentDayPomos, newPomo]);
    }
  };

  const pauseTimer = () => {
    setTimerRunning(false);
    if (
      currentDayPomos.length > 0 &&
      !currentDayPomos[currentDayPomos.length - 1].completed
    ) {
      // Pause the current pomo
      const updatedPomos = [...currentDayPomos];
      updatedPomos[currentDayPomos.length - 1].endTime =
        new Date().toISOString();
      setCurrentDayPomos(updatedPomos);
    }
  };

  const completePomo = () => {
    if (
      currentDayPomos.length > 0 &&
      !currentDayPomos[currentDayPomos.length - 1].completed
    ) {
      // Complete the current pomo
      const updatedPomos = [...currentDayPomos];
      updatedPomos[currentDayPomos.length - 1].completed = true;
      updatedPomos[currentDayPomos.length - 1].endTime =
        new Date().toISOString();
      saveCurrentDayPomos(updatedPomos);
      setCurrentDayPomos(updatedPomos);
    }
  };

  return (
    <div className={`App ${timerRunning ? "pomo-active" : ""}`}>
      <h1>Pomotea</h1>
      <Settings setPomoDuration={setPomoDuration} />
      <Timer
        timeRemaining={timeRemaining}
        timerRunning={timerRunning}
        startTimer={startTimer}
        pauseTimer={pauseTimer}
        setTimeRemaining={setTimeRemaining}
        pomoDuration={pomoDuration}
        completePomo={completePomo}
      />
      <PomoTracker currentDayPomos={currentDayPomos} />
    </div>
  );
}

export default App;
