import { Flame, Drumstick, Dumbbell, Salad } from 'lucide-react';

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
  
  // Get color class based on percentage
  const getColorClass = (percentage: number) => {
    if (percentage < 50) return 'from-emerald-400 to-emerald-500';
    if (percentage < 85) return 'from-amber-400 to-amber-500';
    return 'from-rose-400 to-rose-500';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-5 mb-6 border border-gray-100">
      <h2 className="text-lg font-semibold mb-4 flex items-center text-primary">
        <Flame className="mr-2 h-5 w-5" />
        Daily Summary
      </h2>
      
      {/* Calories */}
      <div className="mb-5">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium flex items-center">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-primary/80 to-primary mr-2"></div>
            Calories
          </span>
          <span className="text-sm font-semibold">
            {formatNumber(totals.calories)} 
            <span className="text-gray-400 text-xs ml-1">/ {formatNumber(targets.calories)}</span>
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-primary/80 to-primary rounded-full h-3 transition-all duration-500" 
            style={{ width: `${caloriesPercentage}%` }}
          ></div>
        </div>
      </div>
      
      {/* Nutrients */}
      <div className="grid grid-cols-3 gap-6">
        {/* Protein */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center mb-2">
            <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center mr-2">
              <Dumbbell className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <span className="text-xs text-gray-500 block leading-none">Protein</span>
              <span className="text-sm font-semibold block">{totals.protein.toFixed(0)}g</span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`bg-gradient-to-r ${getColorClass(proteinPercentage)} rounded-full h-2 transition-all duration-500`}
              style={{ width: `${proteinPercentage}%` }}
            ></div>
          </div>
          <div className="text-right mt-1">
            <span className="text-[10px] text-gray-400">
              {Math.round(proteinPercentage)}% of {targets.protein}g
            </span>
          </div>
        </div>
        
        {/* Carbs */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center mb-2">
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center mr-2">
              <Salad className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <span className="text-xs text-gray-500 block leading-none">Carbs</span>
              <span className="text-sm font-semibold block">{totals.carbs.toFixed(0)}g</span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`bg-gradient-to-r ${getColorClass(carbsPercentage)} rounded-full h-2 transition-all duration-500`}
              style={{ width: `${carbsPercentage}%` }}
            ></div>
          </div>
          <div className="text-right mt-1">
            <span className="text-[10px] text-gray-400">
              {Math.round(carbsPercentage)}% of {targets.carbs}g
            </span>
          </div>
        </div>
        
        {/* Fat */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center mb-2">
            <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center mr-2">
              <Drumstick className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <span className="text-xs text-gray-500 block leading-none">Fat</span>
              <span className="text-sm font-semibold block">{totals.fat.toFixed(0)}g</span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`bg-gradient-to-r ${getColorClass(fatPercentage)} rounded-full h-2 transition-all duration-500`}
              style={{ width: `${fatPercentage}%` }}
            ></div>
          </div>
          <div className="text-right mt-1">
            <span className="text-[10px] text-gray-400">
              {Math.round(fatPercentage)}% of {targets.fat}g
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
