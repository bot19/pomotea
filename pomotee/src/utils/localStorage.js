// utils/localStorage.js

import { CONFIG } from '../config.js';

const POMO_DATA_KEY = "pomo_data";
// const POMO_CONFIG = "pomo_config";

/**
 * Get date string in YYYY-MM-DD format
 * @param {Date} date - Date object, defaults to current date
 * @returns {string} Date string in YYYY-MM-DD format
 */
const getLocalDate = (date) => {
  date = date ? new Date(date) : new Date();
  // e.g., '2025-06-05'
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
};

/**
 * Validate if day data has the correct structure
 * @param {Object} dayData - Day data object to validate
 * @returns {boolean} True if data has correct structure
 */
const isValidDayData = (dayData) => {
  return dayData && 
         typeof dayData === 'object' &&
         typeof dayData.date === 'string' &&
         Array.isArray(dayData.timeData) &&
         typeof dayData.pomoLength === 'number' &&
         typeof dayData.dayPomos === 'number';
};

/**
 * Get pomodoro data for a specific date from the array
 * Validates data structure and creates new data if invalid
 * @param {string} date - Date string in YYYY-MM-DD format
 * @returns {Object} Pomodoro data for the date (always valid structure)
 */
export const getPomoData = (date) => {
  const today = date || getLocalDate();
  const allData = JSON.parse(localStorage.getItem(POMO_DATA_KEY) || '[]');
  const existingData = allData.find(day => day.date === today);
  
  // If no data exists or data structure is invalid, create new data
  if (!existingData || !isValidDayData(existingData)) {
    const newData = createDayData();
    savePomoData(today, newData);
    return newData;
  }
  
  return existingData;
};

/**
 * Save pomodoro data for a specific date to the array
 * @param {string} date - Date string in YYYY-MM-DD format
 * @param {Object} data - Pomodoro data to save
 */
export const savePomoData = (date, data) => {
  const today = date || getLocalDate();
  const allData = JSON.parse(localStorage.getItem(POMO_DATA_KEY) || '[]');
  
  // Find existing day data
  const existingIndex = allData.findIndex(day => day.date === today);
  
  if (existingIndex >= 0) {
    // Update existing day
    allData[existingIndex] = data;
  } else {
    // Add new day
    allData.push(data);
  }
  
  localStorage.setItem(POMO_DATA_KEY, JSON.stringify(allData));
};

/**
 * Create new day data structure
 * @param {number} pomoLength - Pomodoro length in seconds
 * @returns {Object} New day data structure
 */
export const createDayData = (pomoLength = CONFIG.DEFAULT_POMO_LENGTH * 60) => {
  return {
    date: getLocalDate(),
    timeData: [],
    pomoLength: pomoLength,
    dayPomos: 0
  };
};

/**
 * Add a new time entry to the current day's data
 * Latest entry is always at index 0 for easy access
 * @param {string} startTime - ISO timestamp of when timer started
 * @param {number|null} duration - Duration in seconds, null if ongoing
 * @returns {Object} Updated day data
 */
export const addTimeEntry = (startTime, duration = null) => {
  const today = getLocalDate();
  let dayData = getPomoData(today);
  
  // getPomoData now guarantees valid structure, but double-check
  if (!isValidDayData(dayData)) {
    dayData = createDayData();
  }
  
  // Add new entry at the beginning (index 0) - latest first
  dayData.timeData.unshift([startTime, duration]);
  savePomoData(today, dayData);
  
  return dayData;
};

/**
 * Update the latest time entry with duration (when pausing/stopping)
 * Latest entry is always at index 0
 * @param {number} duration - Duration in seconds
 * @returns {Object|null} Updated day data or null if no data exists
 */
export const updateLastTimeEntry = (duration) => {
  const today = getLocalDate();
  const dayData = getPomoData(today);
  
  console.log('updateLastTimeEntry - Input duration:', duration);
  console.log('updateLastTimeEntry - Current dayData:', dayData);
  
  // getPomoData now guarantees valid structure
  if (dayData && dayData.timeData.length > 0) {
    console.log('updateLastTimeEntry - Latest entry before update:', dayData.timeData[0]);
    
    // Latest entry is always at index 0
    dayData.timeData[0][1] = duration;
    
    console.log('updateLastTimeEntry - Latest entry after update:', dayData.timeData[0]);
    
    savePomoData(today, dayData);
    
    console.log('updateLastTimeEntry - Saved dayData:', dayData);
    
    return dayData;
  }
  
  console.log('updateLastTimeEntry - No valid dayData or timeData empty');
  return null;
};

/**
 * Clean up storage by removing invalid data structures
 * Useful for maintenance when data format changes
 */
export const cleanupStorage = () => {
  const allData = JSON.parse(localStorage.getItem(POMO_DATA_KEY) || '[]');
  const validData = allData.filter(day => isValidDayData(day));
  localStorage.setItem(POMO_DATA_KEY, JSON.stringify(validData));
  return validData;
};