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

// check to create today data object whether no pomoData or exists
const createDayData = (pomoMonthString) => {
  const today = getLocalDate();

  try {
    // ensure we have pomoData one way or another
    const pomoData = pomoMonthString
      ? JSON.parse(pomoMonthString)
      : [
          {
            date: today,
            current: null,
            done: [],
          },
        ];

    // check and ensure today's data exists
    const todayData = pomoData.find((dayObj) => dayObj.date === today);
    if (!todayData) {
      pomoData.push({ date: today, current: null, done: [] });
    }

    return pomoData;
  } catch (error) {
    console.error("Error parsing pomo month data from localStorage:", error);
    return [];
  }
}

// get state in storage or make it.
function loadPomoData() {
  const pomoMonthString = localStorage.getItem(POMO_DATA_KEY);

  const pomoData = createDayData(pomoMonthString);

  // set updated pomoData with today to storage
  localStorage.setItem(POMO_DATA_KEY, JSON.stringify(pomoData));

  return pomoData;
}

// today pomo data will exist
export function saveCurrentPomo(currentPomoObj) {
  const today = getLocalDate(); // '2025-06-05'
  let pomoData = loadPomoData(); // [{...}, ...]

  const todayPomo = pomoData.find((dayObj) => dayObj.date === today);
  const todayIndex = pomoData.findIndex((dayObj) => dayObj.date === today);
  pomoData[todayIndex] = { ...todayPomo, current: currentPomoObj };

  localStorage.setItem(POMO_DATA_KEY, JSON.stringify(pomoData));
}

// today pomo data will exist
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
