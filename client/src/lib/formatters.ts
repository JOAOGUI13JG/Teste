/**
 * Format a number to have commas as thousands separators
 */
export function formatNumber(value: number, options: { 
  decimals?: number,
  prefix?: string,
  suffix?: string
} = {}): string {
  const { decimals = 0, prefix = '', suffix = '' } = options;
  
  const formatted = value.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${prefix}${formatted}${suffix}`;
}

/**
 * Format a calorie value
 */
export function formatCalories(calories: number): string {
  return formatNumber(calories, { decimals: 0 }) + ' cal';
}

/**
 * Format a macronutrient value
 */
export function formatMacro(value: number, unit: string = 'g'): string {
  return formatNumber(value, { decimals: 1, suffix: unit });
}

/**
 * Format a percentage
 */
export function formatPercentage(value: number, total: number): string {
  if (total === 0) return '0%';
  
  const percentage = Math.min(100, (value / total) * 100);
  return `${Math.round(percentage)}%`;
}

/**
 * Format a time value from 24h to 12h format
 */
export function formatTime(time: string): string {
  // If already in 12h format, return as is
  if (time.includes('AM') || time.includes('PM')) {
    return time;
  }
  
  // Convert from 24h format to 12h
  let [hours, minutes] = time.split(':');
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  hours = String(h % 12 || 12);
  
  return `${hours}:${minutes} ${ampm}`;
}
