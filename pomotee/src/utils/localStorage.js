// utils/localStorage.js

const POMO_DATA_KEY = "pomo_data";
// const POMO_CONFIG = "pomo_config";

const getLocalDate = (date) => {
  date = date ? new Date(date) : new Date();
  // e.g., '2025-06-05'
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
};

// check to create today data object whether no pomoData or exists
const createDayData = (pomoDataString) => {
  const today = getLocalDate();

  try {
    // ensure we have pomoData one way or another
    const pomoData = pomoDataString
      ? JSON.parse(pomoDataString)
      : [
          {
            date: today,
            current: null,
            done: [],
            totalPomos: 0,
          },
        ];

    // check and ensure today's data exists
    const todayData = pomoData.find((dayObj) => dayObj.date === today);
    if (!todayData) {
      // if prev day has current pomo in progress, carry it over
      const prevDayData = pomoData[pomoData.length - 1];
      
      if (prevDayData && prevDayData.current) {
        pomoData.push({
          date: today,
          current: prevDayData.current,
          done: [],
          totalPomos: 0,
        });
      } else {
        pomoData.push({ date: today, current: null, done: [], totalPomos: 0 });
      }
    }

    return pomoData;
  } catch (error) {
    // might occur if pomoData is not valid JSON
    console.error("Error parsing pomo month data from localStorage:", error);
    return [];
  }
}

// get state in storage or make it.
function loadPomoData() {
  const pomoDataString = localStorage.getItem(POMO_DATA_KEY);

  const pomoData = createDayData(pomoDataString);

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
export function saveDonePomos(pomosDoneArray, totalPomos = 0) {
  const today = getLocalDate(); // '2025-06-05'
  let pomoData = loadPomoData(); // [{...}, ...]

  const todayPomo = pomoData.find((dayObj) => dayObj.date === today);
  const todayIndex = pomoData.findIndex((dayObj) => dayObj.date === today);
  pomoData[todayIndex] = { 
    ...todayPomo, 
    done: pomosDoneArray,
    totalPomos: totalPomos || todayPomo.totalPomos || 0
  };

  localStorage.setItem(POMO_DATA_KEY, JSON.stringify(pomoData));
}

export function loadCurrentDay() {
  const today = getLocalDate();
  const pomoData = loadPomoData();
  const todayData = pomoData.find((day) => day.date === today);
  return todayData ? todayData : null;
}

// New function to update current pomo with real time tracking
export function updateCurrentPomoTime() {
  const today = getLocalDate();
  let pomoData = loadPomoData();
  const todayIndex = pomoData.findIndex((dayObj) => dayObj.date === today);
  
  if (todayIndex === -1) return null;
  
  const todayPomo = pomoData[todayIndex];
  if (!todayPomo.current) return null;
  
  const now = new Date().toISOString();
  const updatedCurrent = {
    ...todayPomo.current,
    currentTime: now,
  };
  
  pomoData[todayIndex] = { ...todayPomo, current: updatedCurrent };
  localStorage.setItem(POMO_DATA_KEY, JSON.stringify(pomoData));
  
  return updatedCurrent;
}

// New function to calculate completed pomos based on real elapsed time
export function calculateCompletedPomos(startTime, currentTime, pomoDurationMinutes) {
  if (!startTime || !currentTime) return 0;
  
  const start = new Date(startTime);
  const current = new Date(currentTime);
  const elapsedSeconds = Math.floor((current - start) / 1000);
  const pomoDurationSeconds = pomoDurationMinutes * 60;
  
  return Math.floor(elapsedSeconds / pomoDurationSeconds);
}

// New function to get remaining time based on real elapsed time
export function getRemainingTime(startTime, currentTime, pomoDurationMinutes) {
  if (!startTime || !currentTime) return pomoDurationMinutes * 60;
  
  const start = new Date(startTime);
  const current = new Date(currentTime);
  const elapsedSeconds = Math.floor((current - start) / 1000);
  const pomoDurationSeconds = pomoDurationMinutes * 60;
  
  const completedPomos = Math.floor(elapsedSeconds / pomoDurationSeconds);
  const timeIntoCurrentPomo = elapsedSeconds % pomoDurationSeconds;
  
  return pomoDurationSeconds - timeIntoCurrentPomo;
}

export function loadMonthlyPomos(month, year) {
  const pomoMonth = loadPomoData();
  const monthlyPomos = {};

  pomoMonth.forEach((day) => {
    const [yearStr, monthStr, dayStr] = day.date.split("-");
    const dayMonth = parseInt(monthStr, 10);
    const dayYear = parseInt(yearStr, 10);

    if (dayMonth === month && dayYear === year) {
      monthlyPomos[day.date] = day.totalPomos || 0;
    }
  });

  return monthlyPomos;
}
