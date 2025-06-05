import React, { useState, useEffect } from "react";
import Timer from "./Timer";
import PomoTracker from "./PomoTracker";
import Settings from "./Settings";
import {
  loadCurrentDayPomos,
  saveCurrentDayPomos,
  loadDailyPomoSummary,
  saveDailyPomoSummary,
  cleanupOldPomos,
} from "./utils/localStorage";
import "./App.css";

function App() {
  const [pomoDuration, setPomoDuration] = useState(25); // Default to 25 minutes
  const [currentDayPomos, setCurrentDayPomos] = useState(() => {
    const today = new Date().toISOString().slice(0, 10);
    return loadCurrentDayPomos(today);
  });
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(pomoDuration * 60);

  useEffect(() => {
    cleanupOldPomos();
  }, []);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    saveCurrentDayPomos(today, currentDayPomos);
  }, [currentDayPomos]);

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
