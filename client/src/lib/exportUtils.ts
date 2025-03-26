import { DailyData, MealWithItems } from '@shared/schema';
import { formatCalories, formatMacro, formatPercentage, formatTime } from './formatters';
import { formatDate } from './dateUtils';

/**
 * Generate an HTML document for export containing the daily nutrition data
 * @param data The daily nutrition data
 * @returns A complete HTML document as a string
 */
export function generateHtmlExport(data: DailyData): string {
  // Create meals HTML
  let mealsHtml = '';
  
  if (data.meals.length === 0) {
    mealsHtml = `
      <div class="empty-meals">
        <p>No meals recorded for this day.</p>
      </div>
    `;
  } else {
    data.meals.forEach((meal: MealWithItems) => {
      let foodItemsHtml = '';
      
      if (meal.items.length === 0) {
        foodItemsHtml = '<p class="empty-items">No food items added to this meal.</p>';
      } else {
        foodItemsHtml = `
          <table class="food-items-table">
            <thead>
              <tr>
                <th>Food Item</th>
                <th>Quantity</th>
                <th>Calories</th>
                <th>Protein</th>
                <th>Carbs</th>
                <th>Fat</th>
              </tr>
            </thead>
            <tbody>
              ${meal.items.map(item => `
                <tr>
                  <td>${item.foodItem.name}</td>
                  <td>${item.quantity} ${item.foodItem.servingUnit}</td>
                  <td>${Math.round(item.foodItem.calories * item.quantity)} cal</td>
                  <td>${Math.round(item.foodItem.protein * item.quantity)} g</td>
                  <td>${Math.round(item.foodItem.carbs * item.quantity)} g</td>
                  <td>${Math.round(item.foodItem.fat * item.quantity)} g</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2"><strong>Total</strong></td>
                <td><strong>${Math.round(meal.totalCalories)} cal</strong></td>
                <td><strong>${Math.round(meal.totalProtein)} g</strong></td>
                <td><strong>${Math.round(meal.totalCarbs)} g</strong></td>
                <td><strong>${Math.round(meal.totalFat)} g</strong></td>
              </tr>
            </tfoot>
          </table>
        `;
      }
      
      mealsHtml += `
        <div class="meal-card">
          <div class="meal-header">
            <h3>${meal.name} <span class="meal-time">${formatTime(meal.time)}</span></h3>
            <div class="meal-macros">
              <span class="calories">${formatCalories(meal.totalCalories)}</span>
              <span class="macro protein">P: ${formatMacro(meal.totalProtein)}</span>
              <span class="macro carbs">C: ${formatMacro(meal.totalCarbs)}</span>
              <span class="macro fat">F: ${formatMacro(meal.totalFat)}</span>
            </div>
          </div>
          <div class="meal-content">
            ${foodItemsHtml}
          </div>
        </div>
      `;
    });
  }
  
  // Calculate percentage of daily targets
  const caloriePercentage = formatPercentage(data.totals.calories, data.targets.calories);
  const proteinPercentage = formatPercentage(data.totals.protein, data.targets.protein);
  const carbsPercentage = formatPercentage(data.totals.carbs, data.targets.carbs);
  const fatPercentage = formatPercentage(data.totals.fat, data.targets.fat);
  
  // Create the complete HTML document
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nutrition Report - ${formatDate(data.date)}</title>
  <style>
    :root {
      --primary: #8B5CF6;
      --primary-light: #EDE9FE;
      --green: #10B981;
      --green-light: #ECFDF5;
      --blue: #3B82F6;
      --blue-light: #EFF6FF;
      --amber: #F59E0B;
      --amber-light: #FEF3C7;
      --gray-50: #F9FAFB;
      --gray-100: #F3F4F6;
      --gray-200: #E5E7EB;
      --gray-300: #D1D5DB;
      --gray-400: #9CA3AF;
      --gray-500: #6B7280;
      --gray-600: #4B5563;
      --gray-700: #374151;
      --gray-800: #1F2937;
      --gray-900: #111827;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.5;
      color: var(--gray-800);
      background-color: var(--gray-50);
      margin: 0;
      padding: 16px;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    
    .header {
      background-color: var(--primary);
      color: white;
      padding: 24px;
      text-align: center;
    }
    
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    
    .header .date {
      font-size: 16px;
      opacity: 0.9;
    }
    
    .summary {
      padding: 24px;
      background-color: var(--gray-50);
      border-bottom: 1px solid var(--gray-200);
    }
    
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }
    
    .nutrition-card {
      background-color: white;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }
    
    .nutrition-card.calories {
      border-top: 3px solid var(--primary);
    }
    
    .nutrition-card.protein {
      border-top: 3px solid var(--green);
    }
    
    .nutrition-card.carbs {
      border-top: 3px solid var(--blue);
    }
    
    .nutrition-card.fat {
      border-top: 3px solid var(--amber);
    }
    
    .nutrition-card .label {
      font-size: 14px;
      color: var(--gray-500);
      margin-bottom: 4px;
    }
    
    .nutrition-card .value {
      font-size: 20px;
      font-weight: 600;
      color: var(--gray-800);
    }
    
    .nutrition-card .target {
      font-size: 12px;
      color: var(--gray-400);
      margin-top: 4px;
    }
    
    .nutrition-card .percentage {
      font-size: 12px;
      font-weight: 500;
      padding: 2px 6px;
      border-radius: 4px;
      margin-top: 8px;
      display: inline-block;
    }
    
    .nutrition-card.calories .percentage {
      background-color: var(--primary-light);
      color: var(--primary);
    }
    
    .nutrition-card.protein .percentage {
      background-color: var(--green-light);
      color: var(--green);
    }
    
    .nutrition-card.carbs .percentage {
      background-color: var(--blue-light);
      color: var(--blue);
    }
    
    .nutrition-card.fat .percentage {
      background-color: var(--amber-light);
      color: var(--amber);
    }
    
    .meals-container {
      padding: 24px;
    }
    
    .meals-container h2 {
      margin-top: 0;
      margin-bottom: 16px;
      font-size: 18px;
      font-weight: 600;
      color: var(--gray-800);
    }
    
    .meal-card {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      margin-bottom: 16px;
      overflow: hidden;
    }
    
    .meal-header {
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--gray-100);
    }
    
    .meal-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
      color: var(--gray-800);
    }
    
    .meal-time {
      font-size: 14px;
      color: var(--gray-500);
      margin-left: 8px;
    }
    
    .meal-macros {
      text-align: right;
    }
    
    .calories {
      font-weight: 600;
      color: var(--gray-800);
      display: block;
      margin-bottom: 4px;
    }
    
    .macro {
      font-size: 12px;
      padding: 2px 6px;
      border-radius: 4px;
      margin-left: 4px;
    }
    
    .macro.protein {
      background-color: var(--green-light);
      color: var(--green);
    }
    
    .macro.carbs {
      background-color: var(--blue-light);
      color: var(--blue);
    }
    
    .macro.fat {
      background-color: var(--amber-light);
      color: var(--amber);
    }
    
    .meal-content {
      padding: 16px;
    }
    
    .food-items-table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .food-items-table th,
    .food-items-table td {
      padding: 8px;
      text-align: left;
      border-bottom: 1px solid var(--gray-100);
    }
    
    .food-items-table th {
      font-weight: 500;
      color: var(--gray-600);
      font-size: 14px;
    }
    
    .food-items-table td {
      font-size: 14px;
      color: var(--gray-800);
    }
    
    .food-items-table tfoot td {
      border-bottom: none;
      padding-top: 12px;
    }
    
    .empty-meals,
    .empty-items {
      color: var(--gray-500);
      text-align: center;
      padding: 32px 0;
    }
    
    .footer {
      padding: 16px;
      background-color: var(--gray-50);
      border-top: 1px solid var(--gray-200);
      text-align: center;
      font-size: 12px;
      color: var(--gray-500);
    }
    
    @media (max-width: 600px) {
      .summary-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Nutrition Report</h1>
      <div class="date">${formatDate(data.date)}</div>
    </div>
    
    <div class="summary">
      <div class="summary-grid">
        <div class="nutrition-card calories">
          <div class="label">Calories</div>
          <div class="value">${formatCalories(data.totals.calories)}</div>
          <div class="target">Target: ${formatCalories(data.targets.calories)}</div>
          <div class="percentage">${caloriePercentage}</div>
        </div>
        
        <div class="nutrition-card protein">
          <div class="label">Protein</div>
          <div class="value">${formatMacro(data.totals.protein)}</div>
          <div class="target">Target: ${formatMacro(data.targets.protein)}</div>
          <div class="percentage">${proteinPercentage}</div>
        </div>
        
        <div class="nutrition-card carbs">
          <div class="label">Carbs</div>
          <div class="value">${formatMacro(data.totals.carbs)}</div>
          <div class="target">Target: ${formatMacro(data.targets.carbs)}</div>
          <div class="percentage">${carbsPercentage}</div>
        </div>
        
        <div class="nutrition-card fat">
          <div class="label">Fat</div>
          <div class="value">${formatMacro(data.totals.fat)}</div>
          <div class="target">Target: ${formatMacro(data.targets.fat)}</div>
          <div class="percentage">${fatPercentage}</div>
        </div>
      </div>
    </div>
    
    <div class="meals-container">
      <h2>Meals</h2>
      ${mealsHtml}
    </div>
    
    <div class="footer">
      Generated by Nutrition Tracker App - ${new Date().toLocaleString()}
    </div>
  </div>
</body>
</html>
  `;
  
  return html;
}

/**
 * Export the daily nutrition data as an HTML file
 * @param data The daily nutrition data to export
 * @param filename The name of the file to download (default: nutrition-report.html)
 */
export function exportDailyDataAsHtml(data: DailyData, filename = 'nutrition-report.html'): void {
  // Generate the HTML content
  const htmlContent = generateHtmlExport(data);
  
  // Create a blob with the HTML content
  const blob = new Blob([htmlContent], { type: 'text/html' });
  
  // Create a URL for the blob
  const url = URL.createObjectURL(blob);
  
  // Create a temporary link element
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  
  // Append the link to the document
  document.body.appendChild(link);
  
  // Click the link to trigger the download
  link.click();
  
  // Remove the link from the document
  document.body.removeChild(link);
  
  // Release the URL object
  URL.revokeObjectURL(url);
}