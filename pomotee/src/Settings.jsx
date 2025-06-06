import React, { useState } from "react";
import { CONFIG } from "./config";

function Settings({ setPomoDuration }) {
  const [duration, setDuration] = useState(CONFIG.defaults.duration);

  const handleChange = (event) => {
    const value = parseInt(event.target.value);
    setDuration(value);
  };

  const handleClick = () => {
    if (duration >= 1 && duration <= 30) {
      setPomoDuration(duration);
    } else {
      alert("Pomo duration must be between 15 and 30 minutes.");
    }
  };

  return (
    <div className="settings">
      <label>
        Pomo Duration (15-30 minutes):
        <input type="number" value={duration} onChange={handleChange} />
      </label>
      <button onClick={handleClick}>Set Duration</button>
    </div>
  );
}

export default Settings;
