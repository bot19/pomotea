import React, { useState, useEffect } from "react";
import Timer from "./Timer";
import PomoTracker from "./PomoTracker";
import Settings from "./Settings";
import { loadCurrentDayPomos, saveCurrentDayPomos } from "./utils/localStorage";
import "./App.css";
import { CONFIG } from "./config";

function App() {
  const dayPomos = loadCurrentDayPomos(); // get data from storage
  console.log("App, currentDayPomos", dayPomos);

  const [pomoDuration, setPomoDuration] = useState(CONFIG.defaults.duration);
  const [currentDayPomos, setCurrentDayPomos] = useState(dayPomos);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(
    dayPomos.length && dayPomos[dayPomos.length - 1].progress
      ? dayPomos[dayPomos.length - 1].progress
      : pomoDuration * 60
  );

  // pomoDuration setting changed, update timeRemaining if timer stopped
  const setNewPomoDuration = (newDuration) => {
    setPomoDuration(newDuration);

    // don't reset timeRemaining if pomo in progress
    const pomoInProgress =
      currentDayPomos.length > 0 &&
      !currentDayPomos[currentDayPomos.length - 1].completed;

    console.log(
      "App, useEffect, set pomoDuration",
      timerRunning,
      pomoInProgress
    );
    if (!timerRunning && !pomoInProgress) {
      setTimeRemaining(newDuration * 60);
    }
  };

  // start new pomo or RESUME
  const startTimer = () => {
    setTimerRunning(true);

    // if no pomos yet, or last pomo is completed
    if (
      currentDayPomos.length === 0 ||
      currentDayPomos[currentDayPomos.length - 1].completed
    ) {
      console.log("App, startTimer");

      // Start a new pomo
      const newPomo = {
        startTime: new Date().toISOString(), // UTC
        completed: false,
        progress: pomoDuration * 60,
      };
      const newCurrentDadPomos = [...currentDayPomos, newPomo];

      setCurrentDayPomos(newCurrentDadPomos);
      saveCurrentDayPomos(newCurrentDadPomos); // save to storage
    } else {
      // resume pomo
    }
  };

  // TODO: make these efficient, memoize
  const pauseTimer = () => {
    const lastPomoIndex = currentDayPomos.length - 1;

    if (
      currentDayPomos.length > 0 &&
      !currentDayPomos[lastPomoIndex].completed
    ) {
      // Pause the current pomo
      setTimerRunning(false);

      const updatedPomos = [...currentDayPomos];
      updatedPomos[lastPomoIndex].progress = timeRemaining;
      console.log("App, pauseTimer", updatedPomos);
      setCurrentDayPomos(updatedPomos);
      saveCurrentDayPomos(updatedPomos);
    }
  };

  // TODO: always occurs with pauseTimer, can make more efficient
  const completePomo = () => {
    const lastPomoIndex = currentDayPomos.length - 1;

    if (
      currentDayPomos.length > 0 &&
      !currentDayPomos[lastPomoIndex].completed
    ) {
      // Complete the current pomo
      const updatedPomos = [...currentDayPomos];
      updatedPomos[lastPomoIndex].completed = true;
      updatedPomos[lastPomoIndex].progress = pomoDuration * 60;
      saveCurrentDayPomos(updatedPomos);
      setCurrentDayPomos(updatedPomos);
    }
  };

  return (
    <div className={`App ${timerRunning ? "pomo-active" : ""}`}>
      <h1>Pomotea</h1>
      <Settings setPomoDuration={setNewPomoDuration} />
      <Timer
        currentDayPomos={currentDayPomos}
        timeRemaining={timeRemaining}
        timerRunning={timerRunning}
        startTimer={startTimer}
        pauseTimer={pauseTimer}
        setTimeRemaining={setTimeRemaining}
        setCurrentDayPomos={setCurrentDayPomos}
        pomoDuration={pomoDuration}
        completePomo={completePomo}
      />
      <PomoTracker currentDayPomos={currentDayPomos} />
    </div>
  );
}

export default App;
