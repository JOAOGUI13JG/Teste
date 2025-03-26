import { useState } from "react";
import { MealWithItems } from "@shared/schema";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
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

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div 
        className={`p-4 border-l-4 ${borderColorClass} cursor-pointer`}
        onClick={toggleExpanded}
      >
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium">{meal.name}</h3>
            <p className="text-sm text-gray-500">{meal.time}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold">{Math.round(meal.totalCalories)} cal</p>
            <div className="flex text-xs text-gray-500 space-x-2">
              <span>P: {Math.round(meal.totalProtein)}g</span>
              <span>C: {Math.round(meal.totalCarbs)}g</span>
              <span>F: {Math.round(meal.totalFat)}g</span>
            </div>
          </div>
        </div>
        <div className="flex justify-end text-gray-400 mt-1">
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>
      
      {/* Food Items List */}
      <div className={cn(
        "transition-all duration-300 ease-in-out", 
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
            <div className="text-center py-6 text-gray-500">
              <p>No food items added yet</p>
            </div>
          )}
          
          <div className="mt-3">
            <button 
              className="text-primary font-medium text-sm flex items-center"
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
