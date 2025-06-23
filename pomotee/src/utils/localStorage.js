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

// Create initial day data structure
const createInitialDayData = (date) => ({
  date: date,
  current: null,
  done: [],
  dayPomos: 0
});

// Create initial current pomo object
const createInitialCurrentPomo = (pomoLengthMin) => {
  const now = new Date().toISOString();
  return {
    startTime: now,
    endTime: null,
    pomoLengthMin: pomoLengthMin,
    pomoLengthSec: pomoLengthMin * 60,
    pomoProgress: 0,
    totalPomos: 0
  };
};

// Calculate pomo progress and total pomos from elapsed time
export const calculatePomoProgress = (startTime, pomoLengthSec) => {
  if (!startTime) return { pomoProgress: 0, totalPomos: 0 };
  
  const now = new Date();
  const start = new Date(startTime);
  const elapsedSeconds = Math.floor((now - start) / 1000);
  
  return {
    pomoProgress: elapsedSeconds,
    totalPomos: Math.floor(elapsedSeconds / pomoLengthSec)
  };
};

// Check if we need to handle silent pause (multiple pomos completed)
const handleSilentPause = (currentPomo) => {
  if (!currentPomo || !currentPomo.startTime) return null;
  
  const { pomoProgress, totalPomos } = calculatePomoProgress(
    currentPomo.startTime, 
    currentPomo.pomoLengthSec
  );
  
  // If we have completed pomos (totalPomos > 0), handle silent pause
  if (totalPomos > 0) {
    const now = new Date().toISOString();
    
    // Move current pomo to done with completed pomos
    const donePomo = {
      ...currentPomo,
      endTime: now,
      pomoProgress: pomoProgress,
      totalPomos: totalPomos
    };
    
    // Calculate remaining time for new current pomo
    const remainingSeconds = pomoProgress % currentPomo.pomoLengthSec;
    const newStartTime = new Date(now);
    newStartTime.setSeconds(newStartTime.getSeconds() - remainingSeconds);
    
    // Create new current pomo with remaining time
    const newCurrentPomo = {
      startTime: newStartTime.toISOString(),
      endTime: null,
      pomoLengthMin: currentPomo.pomoLengthMin,
      pomoLengthSec: currentPomo.pomoLengthSec,
      pomoProgress: remainingSeconds,
      totalPomos: 0
    };
    
    return { donePomo, newCurrentPomo };
  }
  
  return null;
};

// Check and create today's data, handling day transitions
const createDayData = (pomoDataString) => {
  const today = getLocalDate();

  try {
    const pomoData = pomoDataString ? JSON.parse(pomoDataString) : [];
    
    // Find today's data
    let todayData = pomoData.find((dayObj) => dayObj.date === today);
    
    if (!todayData) {
      // Handle new day scenarios
      const prevDayData = pomoData[pomoData.length - 1];
      
      if (prevDayData && prevDayData.current) {
        // Scenario 2 & 3: Previous day has pomo in progress
        const { pomoProgress, totalPomos } = calculatePomoProgress(
          prevDayData.current.startTime,
          prevDayData.current.pomoLengthSec
        );
        
        if (totalPomos > 0) {
          // Scenario 3: Multi pomo progress - move to done
          const donePomo = {
            ...prevDayData.current,
            endTime: new Date().toISOString(),
            pomoProgress: pomoProgress,
            totalPomos: totalPomos
          };
          
          // Create new current pomo with remaining time
          const remainingSeconds = pomoProgress % prevDayData.current.pomoLengthSec;
          const newStartTime = new Date();
          newStartTime.setSeconds(newStartTime.getSeconds() - remainingSeconds);
          
          todayData = {
            date: today,
            current: {
              startTime: newStartTime.toISOString(),
              endTime: null,
              pomoLengthMin: prevDayData.current.pomoLengthMin,
              pomoLengthSec: prevDayData.current.pomoLengthSec,
              pomoProgress: remainingSeconds,
              totalPomos: 0
            },
            done: [donePomo],
            dayPomos: totalPomos
          };
        } else {
          // Scenario 2: Single pomo in progress - carry over
          todayData = {
            date: today,
            current: prevDayData.current,
            done: [],
            dayPomos: 0
          };
        }
      } else {
        // Scenario 1: No previous pomo - create new day
        todayData = createInitialDayData(today);
      }
      
      pomoData.push(todayData);
    }

    return pomoData;
  } catch (error) {
    console.error("Error parsing pomo data from localStorage:", error);
    return [createInitialDayData(today)];
  }
};

// Load pomo data from storage
function loadPomoData() {
  const pomoDataString = localStorage.getItem(POMO_DATA_KEY);
  const pomoData = createDayData(pomoDataString);
  localStorage.setItem(POMO_DATA_KEY, JSON.stringify(pomoData));
  return pomoData;
}

// Save current pomo to storage
export function saveCurrentPomo(currentPomoObj) {
  const today = getLocalDate();
  let pomoData = loadPomoData();
  
  const todayIndex = pomoData.findIndex((dayObj) => dayObj.date === today);
  if (todayIndex === -1) return;
  
  pomoData[todayIndex] = { 
    ...pomoData[todayIndex], 
    current: currentPomoObj 
  };
  
  localStorage.setItem(POMO_DATA_KEY, JSON.stringify(pomoData));
}

// Save done pomos to storage
export function saveDonePomos(donePomosArray, dayPomos = 0) {
  const today = getLocalDate();
  let pomoData = loadPomoData();
  
  const todayIndex = pomoData.findIndex((dayObj) => dayObj.date === today);
  if (todayIndex === -1) return;
  
  pomoData[todayIndex] = { 
    ...pomoData[todayIndex], 
    done: donePomosArray,
    dayPomos: dayPomos
  };
  
  localStorage.setItem(POMO_DATA_KEY, JSON.stringify(pomoData));
}

// Load current day data
export function loadCurrentDay() {
  const today = getLocalDate();
  const pomoData = loadPomoData();
  const todayData = pomoData.find((day) => day.date === today);
  return todayData || createInitialDayData(today);
}

// Update current pomo with real time tracking and handle silent pauses
export function updateCurrentPomoTime() {
  const today = getLocalDate();
  let pomoData = loadPomoData();
  const todayIndex = pomoData.findIndex((dayObj) => dayObj.date === today);
  
  if (todayIndex === -1) return null;
  
  const todayPomo = pomoData[todayIndex];
  if (!todayPomo.current) return null;
  
  // Check for silent pause
  const silentPauseResult = handleSilentPause(todayPomo.current);
  
  if (silentPauseResult) {
    // Handle silent pause - move completed pomos to done
    const { donePomo, newCurrentPomo } = silentPauseResult;
    
    const updatedDone = [...todayPomo.done, donePomo];
    const updatedDayPomos = todayPomo.dayPomos + donePomo.totalPomos;
    
    pomoData[todayIndex] = {
      ...todayPomo,
      current: newCurrentPomo,
      done: updatedDone,
      dayPomos: updatedDayPomos
    };
    
    localStorage.setItem(POMO_DATA_KEY, JSON.stringify(pomoData));
    return newCurrentPomo;
  } else {
    // Update current pomo progress
    const { pomoProgress } = calculatePomoProgress(
      todayPomo.current.startTime,
      todayPomo.current.pomoLengthSec
    );
    
    const updatedCurrent = {
      ...todayPomo.current,
      pomoProgress: pomoProgress
    };
    
    pomoData[todayIndex] = { ...todayPomo, current: updatedCurrent };
    localStorage.setItem(POMO_DATA_KEY, JSON.stringify(pomoData));
    
    return updatedCurrent;
  }
}

// Calculate remaining time for current pomo
export function getRemainingTime(currentPomo, pomoDuration = 22) {
  if (!currentPomo || !currentPomo.startTime) {
    // No current pomo, return full duration
    return pomoDuration * 60;
  }
  
  // If pomo is paused (has endTime), return full duration
  if (currentPomo.endTime) {
    return currentPomo.pomoLengthSec;
  }
  
  // Pomo is running, calculate remaining time
  const { pomoProgress } = calculatePomoProgress(
    currentPomo.startTime,
    currentPomo.pomoLengthSec
  );
  
  const timeIntoCurrentPomo = pomoProgress % currentPomo.pomoLengthSec;
  return currentPomo.pomoLengthSec - timeIntoCurrentPomo;
}

// Calculate total day pomos from done array
export function calculateDayPomos(donePomos) {
  return donePomos.reduce((total, pomo) => total + (pomo.totalPomos || 0), 0);
}

// Load monthly pomos
export function loadMonthlyPomos(month, year) {
  const pomoData = loadPomoData();
  const monthlyPomos = {};

  pomoData.forEach((day) => {
    const [yearStr, monthStr, dayStr] = day.date.split("-");
    const dayMonth = parseInt(monthStr, 10);
    const dayYear = parseInt(yearStr, 10);

    if (dayMonth === month && dayYear === year) {
      monthlyPomos[day.date] = day.dayPomos || 0;
    }
  });

  return monthlyPomos;
}

// Helper function to create a new pomo
export function createNewPomo(pomoLengthMin) {
  return createInitialCurrentPomo(pomoLengthMin);
}

// Helper function to complete current pomo
export function completeCurrentPomo(currentPomo) {
  if (!currentPomo) return null;
  
  const now = new Date().toISOString();
  return {
    ...currentPomo,
    endTime: now,
    pomoProgress: currentPomo.pomoLengthSec,
    totalPomos: 1
  };
}
