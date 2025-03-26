import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { MealItem } from "@shared/schema";
import { Trash2, Edit2, UtensilsCrossed, Flame, Dumbbell, Salad, Drumstick } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface FoodItemRowProps {
  mealItem: MealItem & { foodItem: any };
  mealId: number;
}

export default function FoodItemRow({ mealItem, mealId }: FoodItemRowProps) {
  const { toast } = useToast();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [quantity, setQuantity] = useState(mealItem.quantity);

  // Calculate nutrient values based on quantity
  const calories = mealItem.foodItem.calories * mealItem.quantity;
  const protein = mealItem.foodItem.protein * mealItem.quantity;
  const carbs = mealItem.foodItem.carbs * mealItem.quantity;
  const fat = mealItem.foodItem.fat * mealItem.quantity;

  // Update meal item mutation
  const updateMealItem = useMutation({
    mutationFn: ({ id, quantity }: { id: number, quantity: number }) => 
      apiRequest("PATCH", `/api/meal-items/${id}`, { quantity }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Food quantity updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/meals/' + mealId] });
      setShowEditDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update food quantity: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Delete meal item mutation
  const deleteMealItem = useMutation({
    mutationFn: (id: number) => 
      apiRequest("DELETE", `/api/meal-items/${id}`),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Food item removed.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/meals/' + mealId] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to remove food item: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const handleUpdateQuantity = () => {
    if (quantity <= 0) {
      toast({
        title: "Error",
        description: "Quantity must be greater than 0",
        variant: "destructive"
      });
      return;
    }
    
    updateMealItem.mutate({ id: mealItem.id, quantity });
  };

  const handleDelete = () => {
    deleteMealItem.mutate(mealItem.id);
  };

  return (
    <div className="bg-white rounded-lg p-3 my-2 border border-gray-100 hover:border-gray-200 transition-colors">
      <div className="flex justify-between items-start">
        <div className="flex">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3 flex-shrink-0">
            <UtensilsCrossed className="h-5 w-5 text-gray-500" />
          </div>
          <div>
            <p className="font-medium text-gray-800">{mealItem.foodItem.name}</p>
            <p className="text-sm text-gray-500 flex items-center">
              <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium mr-2">
                {mealItem.quantity} servings
              </span>
              {mealItem.foodItem.servingSize}{mealItem.foodItem.servingUnit}
            </p>
          </div>
        </div>
        <div className="flex items-start ml-2">
          <div className="text-right mr-3">
            <p className="font-semibold text-gray-800 flex items-center justify-end">
              <Flame className="h-3.5 w-3.5 text-primary mr-1" />
              {Math.round(calories)} cal
            </p>
            <div className="flex text-xs text-gray-500 space-x-2 mt-1">
              <span className="flex items-center bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">
                <Dumbbell className="h-3 w-3 mr-1" />
                {protein.toFixed(1)}g
              </span>
              <span className="flex items-center bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                <Salad className="h-3 w-3 mr-1" />
                {carbs.toFixed(1)}g
              </span>
              <span className="flex items-center bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">
                <Drumstick className="h-3 w-3 mr-1" />
                {fat.toFixed(1)}g
              </span>
            </div>
          </div>
          <div className="flex gap-1">
            <button 
              onClick={() => setShowEditDialog(true)}
              className="text-gray-400 hover:text-blue-500 bg-gray-100 hover:bg-blue-50 p-1.5 rounded-full transition-colors"
              aria-label="Edit quantity"
            >
              <Edit2 size={14} />
            </button>
            <button 
              onClick={handleDelete}
              className="text-gray-400 hover:text-red-500 bg-gray-100 hover:bg-red-50 p-1.5 rounded-full transition-colors"
              aria-label="Delete food item"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
      
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Quantity</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-medium text-gray-800">{mealItem.foodItem.name}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Serving size: {mealItem.foodItem.servingSize}{mealItem.foodItem.servingUnit}
                </p>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  <div className="bg-white p-2 rounded border border-gray-100">
                    <div className="text-xs text-gray-500">Calories</div>
                    <div className="font-semibold">{mealItem.foodItem.calories} kcal</div>
                  </div>
                  <div className="bg-white p-2 rounded border border-gray-100">
                    <div className="text-xs text-gray-500">Protein</div>
                    <div className="font-semibold">{mealItem.foodItem.protein}g</div>
                  </div>
                  <div className="bg-white p-2 rounded border border-gray-100">
                    <div className="text-xs text-gray-500">Carbs</div>
                    <div className="font-semibold">{mealItem.foodItem.carbs}g</div>
                  </div>
                  <div className="bg-white p-2 rounded border border-gray-100">
                    <div className="text-xs text-gray-500">Fat</div>
                    <div className="font-semibold">{mealItem.foodItem.fat}g</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Quantity (servings)</label>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseFloat(e.target.value))}
                  min="0.1"
                  step="0.1"
                  className="text-lg"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateQuantity}
              disabled={updateMealItem.isPending}
            >
              {updateMealItem.isPending ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
