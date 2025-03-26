import { useState } from "react";
import { MealWithItems } from "@shared/schema";
import { ChevronDown, ChevronUp, Plus, Clock, UtensilsCrossed } from "lucide-react";
import FoodItemRow from "./FoodItemRow";
import AddFoodDialog from "./AddFoodDialog";
import { cn } from "@/lib/utils";

interface MealCardProps {
  meal: MealWithItems;
  userId: number;
  borderColorClass?: string;
}

export default function MealCard({ meal, userId, borderColorClass = "border-primary" }: MealCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddFood, setShowAddFood] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleAddFood = () => {
    setShowAddFood(true);
  };
  
  // Get meal icon based on meal name
  const getMealIcon = () => {
    const name = meal.name.toLowerCase();
    if (name.includes('breakfast')) {
      return (
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 4v2a4 4 0 1 0 8 0V4m0 10v.01M6 14v.01M12 18.5v1.5m-8 0h16" />
          </svg>
        </div>
      );
    } else if (name.includes('lunch')) {
      return (
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </div>
      );
    } else if (name.includes('dinner')) {
      return (
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
          <UtensilsCrossed className="h-4 w-4 text-blue-600" />
        </div>
      );
    } else {
      return (
        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
      <div 
        className={`p-4 border-l-4 ${borderColorClass} cursor-pointer transition-colors hover:bg-gray-50`}
        onClick={toggleExpanded}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            {getMealIcon()}
            <div>
              <h3 className="font-medium text-gray-800">{meal.name}</h3>
              <p className="text-sm text-gray-500 flex items-center">
                <Clock className="h-3 w-3 mr-1 inline" />
                {meal.time}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold text-gray-800">{Math.round(meal.totalCalories)} cal</p>
            <div className="flex text-xs text-gray-500 space-x-2 mt-1">
              <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">P: {Math.round(meal.totalProtein)}g</span>
              <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">C: {Math.round(meal.totalCarbs)}g</span>
              <span className="bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">F: {Math.round(meal.totalFat)}g</span>
            </div>
          </div>
        </div>
        <div className="flex justify-end text-gray-400 mt-1">
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>
      
      {/* Food Items List */}
      <div className={cn(
        "transition-all duration-300 ease-in-out bg-gray-50", 
        isExpanded 
          ? "max-h-96 opacity-100" 
          : "max-h-0 opacity-0 invisible"
      )}>
        <div className="px-4 py-3 border-t border-gray-100">
          {meal.items.length > 0 ? (
            meal.items.map((item) => (
              <FoodItemRow 
                key={item.id}
                mealItem={item}
                mealId={meal.id}
              />
            ))
          ) : (
            <div className="text-center py-6 text-gray-500 bg-white rounded-lg border border-dashed border-gray-200 my-2">
              <UtensilsCrossed className="h-8 w-8 mx-auto text-gray-300 mb-2" />
              <p>No food items added yet</p>
            </div>
          )}
          
          <div className="mt-3">
            <button 
              className="text-primary font-medium text-sm flex items-center justify-center w-full py-2 bg-white border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors"
              onClick={handleAddFood}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Food Item
            </button>
          </div>
        </div>
      </div>
      
      <AddFoodDialog
        open={showAddFood}
        onClose={() => setShowAddFood(false)}
        userId={userId}
        date={meal.date}
        mealId={meal.id}
      />
    </div>
  );
}
