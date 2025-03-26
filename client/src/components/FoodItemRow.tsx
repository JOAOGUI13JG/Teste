import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { MealItem } from "@shared/schema";
import { Trash2, Edit2 } from "lucide-react";
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
    <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
      <div>
        <p className="font-medium">{mealItem.foodItem.name}</p>
        <p className="text-sm text-gray-500">
          {mealItem.quantity} x {mealItem.foodItem.servingSize}{mealItem.foodItem.servingUnit}
        </p>
      </div>
      <div className="flex items-start">
        <div className="text-right mr-3">
          <p className="font-semibold">{Math.round(calories)} cal</p>
          <div className="flex text-xs text-gray-500 space-x-2">
            <span>P: {protein.toFixed(1)}g</span>
            <span>C: {carbs.toFixed(1)}g</span>
            <span>F: {fat.toFixed(1)}g</span>
          </div>
        </div>
        <div className="flex flex-col space-y-1">
          <button 
            onClick={() => setShowEditDialog(true)}
            className="text-gray-400 hover:text-blue-500"
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={handleDelete}
            className="text-gray-400 hover:text-red-500"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Quantity</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div>
                <p className="font-medium">{mealItem.foodItem.name}</p>
                <p className="text-sm text-gray-500">
                  Serving size: {mealItem.foodItem.servingSize}{mealItem.foodItem.servingUnit}
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Quantity</label>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseFloat(e.target.value))}
                  min="0.1"
                  step="0.1"
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
