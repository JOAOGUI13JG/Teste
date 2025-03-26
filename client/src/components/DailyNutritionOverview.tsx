interface DailyNutritionOverviewProps {
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  targets: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export default function DailyNutritionOverview({ totals, targets }: DailyNutritionOverviewProps) {
  // Calculate percentages for progress bars
  const caloriesPercentage = Math.min(100, (totals.calories / targets.calories) * 100);
  const proteinPercentage = Math.min(100, (totals.protein / targets.protein) * 100);
  const carbsPercentage = Math.min(100, (totals.carbs / targets.carbs) * 100);
  const fatPercentage = Math.min(100, (totals.fat / targets.fat) * 100);

  // Format numbers with commas for thousands
  const formatNumber = (num: number) => {
    return num.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <h2 className="text-lg font-semibold mb-3">Daily Summary</h2>
      
      {/* Calories */}
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium">Calories</span>
          <span className="text-sm font-semibold">
            {formatNumber(totals.calories)} / {formatNumber(targets.calories)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-primary rounded-full h-2.5" 
            style={{ width: `${caloriesPercentage}%` }}
          ></div>
        </div>
      </div>
      
      {/* Nutrients */}
      <div className="grid grid-cols-3 gap-4">
        {/* Protein */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs font-medium">Protein</span>
            <span className="text-xs font-semibold">
              {totals.protein.toFixed(0)}g / {targets.protein}g
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 rounded-full h-2" 
              style={{ width: `${proteinPercentage}%` }}
            ></div>
          </div>
        </div>
        
        {/* Carbs */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs font-medium">Carbs</span>
            <span className="text-xs font-semibold">
              {totals.carbs.toFixed(0)}g / {targets.carbs}g
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 rounded-full h-2" 
              style={{ width: `${carbsPercentage}%` }}
            ></div>
          </div>
        </div>
        
        {/* Fat */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs font-medium">Fat</span>
            <span className="text-xs font-semibold">
              {totals.fat.toFixed(0)}g / {targets.fat}g
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-yellow-500 rounded-full h-2" 
              style={{ width: `${fatPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
