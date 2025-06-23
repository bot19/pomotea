import React from "react";
import Timer from "./Timer";
import PomoTracker from "./PomoTracker";
import MultiTab from "./MultiTab";
import { usePomodoroTimer } from "../hooks/usePomodoroTimer";
import "../styles/App.css";
import { CONFIG } from "../config";

function App() {
  const {
    // State
    pomoDuration,
    currentPomo,
    pomosDone,
    timerRunning,
    timeRemaining,
    dayPomos,
    autoNextPomo,

    // Actions
    setNewPomoDuration,
    startTimer,
    pauseTimer,
    completePomo,
    setTimeRemaining,
  } = usePomodoroTimer(CONFIG.defaults.duration);

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
        <PomoTracker currentDayPomos={dayPomos} />
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
 * DONE refactor with custom hooks for better architecture
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
