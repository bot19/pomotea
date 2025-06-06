// utils/localStorage.js

const POMO_DATA_KEY = "pomo_data";
// const POMO_CONFIG = "pomo_config";

const getLocalDate = () => {
  const date = new Date();
  // e.g., '2025-06-05'
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
};

// get state in storage or make it.
function loadPomoData() {
  const pomoMonthString = localStorage.getItem(POMO_DATA_KEY);

  try {
    const pomoData = pomoMonthString
      ? JSON.parse(pomoMonthString)
      : [
          {
            date: getLocalDate(),
            current: null,
            done: [],
          },
        ];

    localStorage.setItem(POMO_DATA_KEY, JSON.stringify(pomoData));

    return pomoData;
  } catch (error) {
    console.error("Error parsing pomo month data from localStorage:", error);
    return [];
  }
}

export function saveCurrentPomo(currentPomoObj) {
  const today = getLocalDate(); // '2025-06-05'
  let pomoData = loadPomoData(); // [{...}, ...]

  const todayPomo = pomoData.find((dayObj) => dayObj.date === today);
  const todayIndex = pomoData.findIndex((dayObj) => dayObj.date === today);
  pomoData[todayIndex] = { ...todayPomo, current: currentPomoObj };

  localStorage.setItem(POMO_DATA_KEY, JSON.stringify(pomoData));
}

export function saveDonePomos(pomosDoneArray) {
  const today = getLocalDate(); // '2025-06-05'
  let pomoData = loadPomoData(); // [{...}, ...]

  const todayPomo = pomoData.find((dayObj) => dayObj.date === today);
  const todayIndex = pomoData.findIndex((dayObj) => dayObj.date === today);
  pomoData[todayIndex] = { ...todayPomo, done: pomosDoneArray };

  localStorage.setItem(POMO_DATA_KEY, JSON.stringify(pomoData));
}

export function loadCurrentDay() {
  const today = getLocalDate();
  const pomoMonth = loadPomoData();
  const todayData = pomoMonth.find((day) => day.date === today);
  return todayData ? todayData : null;
}

export function loadMonthlyPomos(month, year) {
  const pomoMonth = loadPomoData();
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
