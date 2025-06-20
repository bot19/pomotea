import React, { useState, useCallback } from "react";
import { CONFIG } from "../config";

export const Settings = ({ setPomoDuration }) => {
  const [duration, setDuration] = useState(CONFIG.defaults.duration);

  const handleChange = (event) => {
    const value = parseInt(event.target.value);
    setDuration(value);
  };

  const handleClick = useCallback(() => {
    if (duration >= 15 && duration <= 30) {
      setPomoDuration(duration);
    } else {
      alert("Pomo duration must be between 15 and 30 minutes.");
    }
  }, [duration, setPomoDuration]);

  return (
    <section className="settings">
      <label>
        Pomo Duration (15-30 minutes){" "}
        <input type="number" value={duration} onChange={handleChange} />
      </label>
      <button onClick={handleClick}>Set Duration</button>
    </section>
  );
};
