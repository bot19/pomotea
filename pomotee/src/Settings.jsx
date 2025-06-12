import React, { useState } from "react";
import { CONFIG } from "./config";

function Settings({ setPomoDuration }) {
  const [open, setOpen] = useState(false)
  const [duration, setDuration] = useState(CONFIG.defaults.duration);

  const handleChange = (event) => {
    const value = parseInt(event.target.value);
    setDuration(value);
  };

  const handleClick = () => {
    if (duration >= 15 && duration <= 30) {
      setPomoDuration(duration);
      setOpen(false);
    } else {
      alert("Pomo duration must be between 15 and 30 minutes.");
    }
  };

  return (
    <section className={`settings ${open ? "is-open" : ""}`}>
      {open ? (
        <>
        <label>
        Pomo Duration (15-30 minutes){" "}
        <input type="number" value={duration} onChange={handleChange} />
      </label>
      <button onClick={handleClick}>Set Duration</button>
        </>
      ) : (
        <button onClick={() => setOpen(true)}>Settings</button>
      )}
    </section>
  );
}

export default Settings;
