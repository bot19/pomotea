import React, { useState, useEffect } from "react";
import Timer from "./Timer";
import PomoTracker from "./PomoTracker";
import Settings from "./Settings";
import {
  loadCurrentDay,
  saveCurrentPomo,
  saveDonePomos,
} from "./utils/localStorage";
import "./App.css";
import { CONFIG } from "./config";

function App() {
  const [pomoDuration, setPomoDuration] = useState(CONFIG.defaults.duration);
  const [currentPomo, setCurrentPomo] = useState(null);
  const [pomosDone, setPomosDone] = useState([]);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(pomoDuration * 60);

  // on app init, update state with storage values
  useEffect(() => {
    const storageDayData = loadCurrentDay();
    console.log("App, currentDayPomos", storageDayData);

    if (storageDayData.current) {
      setCurrentPomo(storageDayData.current);
      setTimeRemaining(storageDayData.current.progress);
    }
    if (storageDayData.done.length > 0) setPomosDone(storageDayData.done);
  }, []);

  // pomoDuration setting changed, update timeRemaining if timer stopped
  const setNewPomoDuration = (newDuration) => {
    setPomoDuration(newDuration);

    console.log("App, useEffect, set pomoDuration", timerRunning, currentPomo);

    // don't reset timeRemaining if pomo in progress
    if (!timerRunning && !currentPomo) {
      setTimeRemaining(newDuration * 60);
    }
  };

  // start new pomo or RESUME
  const startTimer = () => {
    setTimerRunning(true);

    // if no pomos yet, or last pomo is completed
    if (!currentPomo) {
      console.log("App, startTimer");

      // Start a new pomo
      const newPomo = {
        startTime: new Date().toISOString(), // UTC
        completed: false,
        progress: pomoDuration * 60,
      };

      setCurrentPomo(newPomo);
      saveCurrentPomo(newPomo);
    }
  };

  const pauseTimer = () => {
    // can only pause if timer running = has current pomo

    // Pause the current pomo
    setTimerRunning(false);

    const newPomo = {
      ...currentPomo,
      progress: timeRemaining,
    };

    console.log("App, pauseTimer", newPomo);
    setCurrentPomo(newPomo);
    saveCurrentPomo(newPomo);
  };

  const completePomo = () => {
    const donePomo = {
      ...currentPomo, // really just the startTime
      completed: true,
      progress: pomoDuration * 60,
    };

    console.log("App, completePomo", donePomo);
    setCurrentPomo(null);
    setPomosDone((prevPomosDone) => {
      const pomosDone = [...prevPomosDone, donePomo];
      saveDonePomos(pomosDone);
      return pomosDone;
    });
  };

  return (
    <div className={`App ${timerRunning ? "pomo-active" : ""}`}>
      <h1>Pomotea</h1>
      <Settings setPomoDuration={setNewPomoDuration} />
      <Timer
        currentPomo={currentPomo}
        timeRemaining={timeRemaining}
        timerRunning={timerRunning}
        startTimer={startTimer}
        pauseTimer={pauseTimer}
        setTimeRemaining={setTimeRemaining}
        pomoDuration={pomoDuration}
        completePomo={completePomo}
      />
      <PomoTracker currentDayPomos={pomosDone.length} />
    </div>
  );
}

export default App;

/**
 * TODO:
 * improve UI
 * optimise timer functions passed in
 * debounce save to storage every 5s?
 * save pomo config to storage to persist
 *
 * TEST - PASS: can set new duration
 * TEST - PASS: start + pause timer
 * TEST - PASS: timer saving to storage timer progress
 * TEST - PASS: pomo on done, will rollover in 3s
 * TEST - PASS: pomo on done to move from current pomo to done
 *
 * TEST - FAIL: only bind 1x setInterval in strictMode double execute
 *
 * TEST - RESU: ...
 */
