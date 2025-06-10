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
      <section>
        Pomos Completed Today: <strong>{currentDayPomos}</strong>
      </section>
      {/* <h3>Pomos This Month</h3>
      (Coming soon...) */}
      {/* <ul>
        {Object.entries(monthlyPomos).map(([date, count]) => (
          <li key={date}>
            {date}: {count}
          </li>
        ))}
      </ul> */}
      <section>ver. 0.4</section>
    </footer>
  );
}

export default PomoTracker;
