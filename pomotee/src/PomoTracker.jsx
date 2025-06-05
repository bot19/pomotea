import React from "react";

function PomoTracker({ currentDayPomos }) {
  const completedPomos = currentDayPomos.filter(
    (pomo) => pomo.completed
  ).length;

  return (
    <div>
      <h2>Pomo Tracker</h2>
      <p>Pomos Completed Today: {completedPomos}</p>
    </div>
  );
}

export default PomoTracker;
