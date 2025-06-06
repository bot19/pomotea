import React, { useEffect, useState } from "react";
import { loadMonthlyPomos } from "./utils/localStorage";

function PomoTracker({ currentDayPomos }) {
  const completedPomos = currentDayPomos.filter(
    (pomo) => pomo.completed
  ).length;
  const [monthlyPomos, setMonthlyPomos] = useState({});

  useEffect(() => {
    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    const fetchMonthlyPomos = async () => {
      const monthlyData = await loadMonthlyPomos(month, year);
      setMonthlyPomos(monthlyData);
    };

    fetchMonthlyPomos();
  }, []);

  console.log("PomoTracker, monthlyPomos", monthlyPomos);

  return (
    <div>
      <h2>Pomo Tracker</h2>
      <p>Pomos Completed Today: {completedPomos}</p>
      <h3>Pomos This Month</h3>
      <ul>
        {Object.entries(monthlyPomos).map(([date, count]) => (
          <li key={date}>
            {date}: {count}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PomoTracker;
