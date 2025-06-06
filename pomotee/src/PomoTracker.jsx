import React, { useEffect, useState } from "react";
import { loadMonthlyPomos } from "./utils/localStorage";

function PomoTracker({ currentDayPomos }) {
  // const [monthlyPomos, setMonthlyPomos] = useState({});

  // useEffect(() => {
  //   const today = new Date();
  //   const month = today.getMonth() + 1;
  //   const year = today.getFullYear();

  //   const fetchMonthlyPomos = async () => {
  //     const monthlyData = await loadMonthlyPomos(month, year);
  //     setMonthlyPomos(monthlyData);
  //   };

  //   fetchMonthlyPomos();
  // }, []);

  // console.log("PomoTracker, monthlyPomos", monthlyPomos);

  return (
    <footer>
      <p>
        Pomos Completed Today: <strong>{currentDayPomos}</strong>
      </p>
      {/* <h3>Pomos This Month</h3>
      (Coming soon...) */}
      {/* <ul>
        {Object.entries(monthlyPomos).map(([date, count]) => (
          <li key={date}>
            {date}: {count}
          </li>
        ))}
      </ul> */}
      <div style={{ paddingBottom: "20px" }}>ver. 0.3</div>
    </footer>
  );
}

export default PomoTracker;
