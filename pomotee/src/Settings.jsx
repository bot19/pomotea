import React, { useState } from "react";

function Settings({ setPomoDuration }) {
  const [duration, setDuration] = useState(25);

  const handleChange = (event) => {
    const value = parseInt(event.target.value);
    if (value >= 15 && value <= 30) {
      setDuration(value);
      setPomoDuration(value);
    }
  };

  return (
    <div>
      <h2>Settings</h2>
      <label>
        Pomo Duration (15-30 minutes):
        <input type="number" value={duration} onChange={handleChange} />
      </label>
    </div>
  );
}

export default Settings;
