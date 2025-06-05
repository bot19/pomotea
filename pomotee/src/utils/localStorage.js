// utils/localStorage.js

const POMO_MONTH_KEY = "pomo_month";

export function saveCurrentDayPomos(pomoArray) {
  const today = new Date().toISOString().slice(0, 10);
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
  const today = new Date().toISOString().slice(0, 10);
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

export function saveDailyPomoSummary(date, count) {
  // This function is no longer needed with the new data structure
  console.warn("saveDailyPomoSummary is deprecated");
}

export function loadDailyPomoSummary(date) {
  // This function is no longer needed with the new data structure
  console.warn("loadDailyPomoSummary is deprecated");
  return 0;
}

export function loadMonthlyPomos(month, year) {
  const pomoMonth = loadPomoMonth();
  const monthlyPomos = {};

  pomoMonth.forEach((day) => {
    const [yearStr, monthStr, dayStr] = day.date.split("-");
    const dayMonth = parseInt(monthStr, 10);
    const dayYear = parseInt(yearStr, 10);

    if (dayMonth === month && dayYear === year) {
      monthlyPomos[day.date] = day.pomos.filter(
        (pomo) => pomo.completed
      ).length;
    }
  });

  return monthlyPomos;
}

export function cleanupOldPomos() {
  // This function is no longer needed with the new data structure
  console.warn("cleanupOldPomos is deprecated");
}
