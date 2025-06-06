// utils/localStorage.js

const POMO_MONTH_KEY = "pomo_month";
const POMO_CONFIG = "pomo_config"; // TODO: persist pomo duration

const getLocalDate = () => {
  const date = new Date();
  // e.g., '2025-06-05'
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
};

export function saveCurrentDayPomos(pomoArray) {
  const today = getLocalDate();
  let pomoMonth = loadPomoMonth();

  // Update or add the current day's data
  const existingDayIndex = pomoMonth.findIndex((day) => day.date === today);
  if (existingDayIndex > -1) {
    pomoMonth[existingDayIndex] = { date: today, pomos: pomoArray };
  } else {
    pomoMonth = [...pomoMonth, { date: today, pomos: pomoArray }];
  }

  localStorage.setItem(POMO_MONTH_KEY, JSON.stringify(pomoMonth));
}

export function loadCurrentDayPomos() {
  const today = getLocalDate();
  const pomoMonth = loadPomoMonth();
  const todayData = pomoMonth.find((day) => day.date === today);
  return todayData ? todayData.pomos : [];
}

function loadPomoMonth() {
  const pomoMonthString = localStorage.getItem(POMO_MONTH_KEY);
  try {
    return pomoMonthString ? JSON.parse(pomoMonthString) : [];
  } catch (error) {
    console.error("Error parsing pomo month data from localStorage:", error);
    return [];
  }
}

export function loadMonthlyPomos(month, year) {
  const pomoMonth = loadPomoMonth();
  const monthlyPomos = {};

  pomoMonth.forEach((day) => {
    const [yearStr, monthStr, dayStr] = day.date.split("-");
    const dayMonth = parseInt(monthStr, 10);
    const dayYear = parseInt(yearStr, 10);

    console.log(
      "test",
      dayMonth,
      dayYear,
      yearStr,
      day.date,
      day.date.split("-")
    );

    if (dayMonth === month && dayYear === year) {
      monthlyPomos[day.date] = day.pomos.filter(
        (pomo) => pomo.completed
      ).length;
    }
  });

  return monthlyPomos;
}
