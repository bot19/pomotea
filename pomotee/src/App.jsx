import React, { useState, useEffect, useCallback } from "react";
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
      setTimeRemaining(storageDayData.current.timeLeft);
    }
    if (storageDayData.done.length > 0) setPomosDone(storageDayData.done);
  }, []);

  const setNewPomoDuration = useCallback((newDuration) => {
    setPomoDuration(newDuration);

    console.log("App, useEffect, set pomoDuration", timerRunning, currentPomo);

    // don't reset timeRemaining if pomo in progress
    if (!timerRunning && !currentPomo) {
      setTimeRemaining(newDuration * 60);
    }
  }, [timerRunning, currentPomo]);

  const startTimer = useCallback(() => {
    setTimerRunning(true);

    // if no pomos yet, or last pomo is completed
    if (!currentPomo) {
      console.log("App, startTimer");

      // Start a new pomo
      const newPomo = {
        startTime: new Date().toISOString(), // UTC
        completed: false,
        timeLeft: pomoDuration * 60,
      };

      setCurrentPomo(newPomo);
      saveCurrentPomo(newPomo);
    }
  }, [currentPomo, pomoDuration]);

  const pauseTimer = useCallback(() => {
    // can only pause if timer running = has current pomo
    setTimerRunning(false);

    const newPomo = {
      ...currentPomo,
      timeLeft: timeRemaining,
    };

    console.log("App, pauseTimer", newPomo);
    setCurrentPomo(newPomo);
    saveCurrentPomo(newPomo);
  }, [currentPomo, timeRemaining]);

  const completePomo = useCallback(() => {
    const donePomo = {
      ...currentPomo, // really just the startTime
      completed: true,
      timeLeft: 0,
    };

    console.log("App, completePomo", donePomo);
    setCurrentPomo(null);
    setPomosDone((prevPomosDone) => {
      const pomosDone = [...prevPomosDone, donePomo];
      saveDonePomos(pomosDone);
      return pomosDone;
    });
  }, [currentPomo, pomoDuration]);

  return (
    <div className={`App ${timerRunning ? "pomo-active" : ""}`}>
      <div>
        <h1>👨🏻‍💻 Pomotea ☕️</h1>
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
        <Settings setPomoDuration={setNewPomoDuration} />
        <footer>version 0.7</footer>
      </div>
    </div>
  );
}

export default App;

/**
 * TODO:
 * improve UI
 * debounce save to storage every 5s?
 * save pomo config to storage to persist
 * play a sound on pomo finish
 * make app super efficient
 * mobile app blur, check pomo, add potential pomos 
 *
 * TEST - PASS: can set new duration
 * TEST - PASS: start + pause timer
 * TEST - PASS: timer saving to storage timer timeLeft
 * TEST - PASS: pomo on done, will rollover in 3s
 * TEST - PASS: pomo on done to move from current pomo to done
 * TEST - PASS: on page reload, current pomo timeLeft is restored
 * 
 * TEST - TEST: on page reload, yesterday progress pomo become today's
 *
 * TEST - FAIL: only bind 1x setInterval in strictMode double execute
 *
 * TEST - RESU: ...
 * 
 * DONE optimise timer functions passed in
 */

/**
 * new day current pomo carry over
 * if current pomo in progress, but paused from yesterday
 * clicking start will somehow create today and grant current pomo in progress
 * no idea how it works, need to test tomorrow.
 * 
 * safer approach:
 * on new day, reload page to reset today pomos to 0
 * it should carry over yesterday's current pomo in progress object to today
 */