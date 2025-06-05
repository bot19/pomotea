import React, { useState } from "react";

function Settings({ setPomoDuration }) {
  const [duration, setDuration] = useState(25);

  const handleChange = (event) => {
    const value = parseInt(event.target.value);
    setDuration(value);
  };

  const handleClick = () => {
    if (duration >= 15 && duration <= 30) {
      setPomoDuration(duration);
    } else {
      alert("Pomo duration must be between 15 and 30 minutes.");
    }
  };

  return (
    <div className="settings">
      <h2>Settings</h2>
      <label>
        Pomo Duration (15-30 minutes):
        <input type="number" value={duration} onChange={handleChange} />
      </label>
      <button onClick={handleClick}>Set Duration</button>
    </div>
  );
}

export default Settings;
