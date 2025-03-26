/**
 * Get today's date in YYYY-MM-DD format
 */
export function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Format a date string or Date object 
 */
export function formatDate(
  date: string | Date, 
  options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  }
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', options);
}

/**
 * Get an array of dates for the past N days
 * @param endDate The end date (most recent)
 * @param numDays Number of days to go back
 * @returns Array of date strings in YYYY-MM-DD format
 */
export function getPreviousDays(endDate: string, numDays: number): string[] {
  const dates: string[] = [];
  const end = new Date(endDate);
  
  for (let i = numDays - 1; i >= 0; i--) {
    const date = new Date(end);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  return dates;
}

/**
 * Get the start and end dates of the current week
 */
export function getCurrentWeekDates(): { start: string, end: string } {
  const today = new Date();
  const day = today.getDay(); // 0 = Sunday, 6 = Saturday
  
  // Calculate start date (Sunday)
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - day);
  
  // Calculate end date (Saturday)
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + (6 - day));
  
  return {
    start: startDate.toISOString().split('T')[0],
    end: endDate.toISOString().split('T')[0]
  };
}

/**
 * Get the start and end dates of the current month
 */
export function getCurrentMonthDates(): { start: string, end: string } {
  const today = new Date();
  
  // First day of the month
  const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
  
  // Last day of the month
  const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  return {
    start: startDate.toISOString().split('T')[0],
    end: endDate.toISOString().split('T')[0]
  };
}
