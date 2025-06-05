// utils/localStorage.js

export function saveCurrentDayPomos(date, pomoArray) {
  localStorage.setItem(`current_day_pomos_${date}`, JSON.stringify(pomoArray));
}

export function loadCurrentDayPomos(date) {
  const pomoArrayString = localStorage.getItem(`current_day_pomos_${date}`);
  return pomoArrayString ? JSON.parse(pomoArrayString) : [];
}

export function saveDailyPomoSummary(date, count) {
  localStorage.setItem(`daily_pomos_summary_${date}`, count.toString());
}

export function loadDailyPomoSummary(date) {
  const countString = localStorage.getItem(`daily_pomos_summary_${date}`);
  return countString ? parseInt(countString, 10) : 0;
}

export function loadMonthlyPomos(month, year) {
  const monthlyPomos = {};
  for (let i = 1; i <= 31; i++) {
    const date = `${year}-${month.toString().padStart(2, "0")}-${i
      .toString()
      .padStart(2, "0")}`;
    const count = loadDailyPomoSummary(date);
    if (count > 0) {
      monthlyPomos[date] = count;
    }
  }
  return monthlyPomos;
}

export function cleanupOldPomos() {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (
      key.startsWith("current_day_pomos_") ||
      key.startsWith("daily_pomos_summary_")
    ) {
      const dateString = key.substring(key.lastIndexOf("_") + 1);
      const [year, month] = dateString.split("-").map(Number);

      if (
        year < previousYear ||
        (year === previousYear && month < previousMonth)
      ) {
        localStorage.removeItem(key);
        i--; // Adjust index after removing
      } else if (
        year < currentYear ||
        (year === currentYear && month < currentMonth - 1)
      ) {
        localStorage.removeItem(key);
        i--; // Adjust index after removing
      }
    }
  }
}
