import React, { useState, useEffect, useCallback, useRef } from "react";
import Timer from "./Timer";
import PomoTracker from "./PomoTracker";
import MultiTab from "./MultiTab";
import {
  loadCurrentDay,
  saveCurrentPomo,
  saveDonePomos,
  updateCurrentPomoTime,
  calculateCompletedPomos,
  getRemainingTime,
} from "../utils/localStorage";
import "../styles/App.css";
import { CONFIG } from "../config";

function App() {
  const [pomoDuration, setPomoDuration] = useState(CONFIG.defaults.duration);
  const [currentPomo, setCurrentPomo] = useState(null);
  const [pomosDone, setPomosDone] = useState([]);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(pomoDuration * 60);
  const [totalPomos, setTotalPomos] = useState(0);
  const [autoNextPomo, setAutoNextPomo] = useState(false);

  // Use ref to track current pomosDone value without causing effect re-runs
  const pomosDoneRef = useRef(pomosDone);
  pomosDoneRef.current = pomosDone;

  // Background interval to handle silent pauses - runs every 1 second for smooth UI, heavy work every 10 seconds
  useEffect(() => {
    let updateCounter = 0;
    const backgroundInterval = setInterval(() => {
      if (timerRunning && currentPomo) {
        updateCounter++;

        // Calculate remaining time every second for smooth UI
        const now = new Date().toISOString();
        const actualRemainingTime = getRemainingTime(
          currentPomo.startTime,
          now,
          pomoDuration
        );

        // Update UI every second
        setTimeRemaining(actualRemainingTime);

        // Do heavy work (storage updates, completed pomo calculations) every 10 seconds
        if (updateCounter % 10 === 0) {
          // Update current time in storage
          const updatedCurrent = updateCurrentPomoTime();
          if (updatedCurrent) {
            // Calculate actual completed pomos based on real elapsed time
            const actualCompletedPomos = calculateCompletedPomos(
              updatedCurrent.startTime,
              updatedCurrent.currentTime,
              pomoDuration
            );

            // If we have completed pomos that aren't in our done array, add them
            if (actualCompletedPomos > pomosDoneRef.current.length) {
              const newCompletedPomos = [];
              for (
                let i = pomosDoneRef.current.length;
                i < actualCompletedPomos;
                i++
              ) {
                const pomoStartTime = new Date(updatedCurrent.startTime);
                pomoStartTime.setSeconds(
                  pomoStartTime.getSeconds() + i * pomoDuration * 60
                );

                newCompletedPomos.push({
                  startTime: pomoStartTime.toISOString(),
                  currentTime: new Date().toISOString(),
                  stopTime: new Date().toISOString(),
                  totalPomo: i + 1,
                });
              }

              const updatedPomosDone = [
                ...pomosDoneRef.current,
                ...newCompletedPomos,
              ];
              setPomosDone(updatedPomosDone);
              setTotalPomos(actualCompletedPomos);
              saveDonePomos(updatedPomosDone, actualCompletedPomos);
            }
          }
        }
      }
    }, 1000); // Check every 1 second for smooth UI

    return () => clearInterval(backgroundInterval);
  }, [timerRunning, currentPomo, pomoDuration]);

  // Handle auto next pomo rollover
  useEffect(() => {
    if (autoNextPomo) {
      setTimeout(() => {
        console.log("App, autoNextPomo in 3s", autoNextPomo);
        startTimer();
        setAutoNextPomo(false);
      }, 3000);
    }
  }, [autoNextPomo, startTimer]);

  // on app init, update state with storage values
  useEffect(() => {
    const storageDayData = loadCurrentDay();
    console.log("App, currentDayPomos", storageDayData);

    if (storageDayData.current) {
      setCurrentPomo(storageDayData.current);

      // Calculate remaining time based on real elapsed time
      const remainingTime = getRemainingTime(
        storageDayData.current.startTime,
        storageDayData.current.currentTime || storageDayData.current.startTime,
        pomoDuration
      );
      setTimeRemaining(remainingTime);

      // If timer was running (stopTime is null), check if it should still be running
      if (storageDayData.current.stopTime === null) {
        // Only start if there's actually time remaining
        if (remainingTime > 0) {
          setTimerRunning(true);
        } else {
          // Timer has completed, mark it as done
          const now = new Date().toISOString();
          const donePomo = {
            ...storageDayData.current,
            currentTime: now,
            stopTime: now,
            totalPomo: (storageDayData.totalPomos || 0) + 1,
          };
          setPomosDone((prev) => [...prev, donePomo]);
          setTotalPomos((storageDayData.totalPomos || 0) + 1);
          saveDonePomos(
            [...(storageDayData.done || []), donePomo],
            (storageDayData.totalPomos || 0) + 1
          );
          setCurrentPomo(null);
        }
      }
    }
    if (storageDayData.done.length > 0) {
      setPomosDone(storageDayData.done);
      setTotalPomos(storageDayData.totalPomos || storageDayData.done.length);
    }
  }, [pomoDuration]);

  const setNewPomoDuration = useCallback(
    (newDuration) => {
      setPomoDuration(newDuration);

      console.log(
        "App, useEffect, set pomoDuration",
        timerRunning,
        currentPomo
      );

      // don't reset timeRemaining if pomo in progress
      if (!timerRunning && !currentPomo) {
        setTimeRemaining(newDuration * 60);
      }
    },
    [timerRunning, currentPomo]
  );

  const startTimer = useCallback(() => {
    setTimerRunning(true);

    // if no pomos yet, or last pomo is completed
    if (!currentPomo) {
      console.log("App, startTimer");

      // Start a new pomo with real-time tracking
      const now = new Date().toISOString();
      const newPomo = {
        startTime: now,
        currentTime: now,
        stopTime: null,
        totalPomo: 0,
      };

      setCurrentPomo(newPomo);
      saveCurrentPomo(newPomo);
    } else {
      // Resume existing pomo - update current time
      const now = new Date().toISOString();
      const updatedPomo = {
        ...currentPomo,
        currentTime: now,
        stopTime: null,
      };
      setCurrentPomo(updatedPomo);
      saveCurrentPomo(updatedPomo);
    }
  }, [currentPomo, pomoDuration]);

  const pauseTimer = useCallback(() => {
    // can only pause if timer running = has current pomo
    setTimerRunning(false);

    const now = new Date().toISOString();
    const newPomo = {
      ...currentPomo,
      currentTime: now,
      stopTime: now,
    };

    console.log("App, pauseTimer", newPomo);
    setCurrentPomo(newPomo);
    saveCurrentPomo(newPomo);
  }, [currentPomo, timeRemaining]);

  const completePomo = useCallback(() => {
    const now = new Date().toISOString();
    const donePomo = {
      ...currentPomo,
      currentTime: now,
      stopTime: now,
      totalPomo: totalPomos + 1,
    };

    console.log("App, completePomo", donePomo);
    setCurrentPomo(null);
    setPomosDone((prevPomosDone) => {
      const pomosDone = [...prevPomosDone, donePomo];
      const newTotalPomos = totalPomos + 1;
      setTotalPomos(newTotalPomos);
      saveDonePomos(pomosDone, newTotalPomos);
      return pomosDone;
    });

    // Trigger auto next pomo
    setAutoNextPomo(true);
  }, [currentPomo, pomoDuration, totalPomos]);

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
        <PomoTracker currentDayPomos={totalPomos} />
        <MultiTab setPomoDuration={setNewPomoDuration} />
        <footer>version 0.9</footer>
      </div>
    </div>
  );
}

export default App;

/**
 * TODO:
 * custom variable font implement
 * FAQ section
 * see meaningful stats
 * nicer button
 * timer animation
 * nice bg animation
 *
 * debounce save to storage every 5s?
 * save pomo config to storage to persist
 * play a sound on pomo finish
 * make app super efficient - check re-renders
 * mobile app blur, check pomo, add potential pomos
 * unit tests
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
 * DONE handle silent pauses with real-time tracking
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
