import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { FoodItem } from "@shared/schema";
import { SearchIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AddFoodDialogProps {
  open: boolean;
  onClose: () => void;
  userId: number;
  date: string;
  mealId?: number;
  food?: FoodItem;
}

export default function AddFoodDialog({ 
  open, 
  onClose, 
  userId, 
  date, 
  mealId, 
  food 
}: AddFoodDialogProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFoodId, setSelectedFoodId] = useState<number | null>(food?.id || null);
  const [quantity, setQuantity] = useState('1');
  const [activeTab, setActiveTab] = useState(food ? 'add' : 'search');

  // Get meals for the current date
  const { data: meals } = useQuery({
    queryKey: [`/api/users/${userId}/meals`, { date }],
    queryFn: () => 
      fetch(`/api/users/${userId}/meals?date=${date}`)
        .then(res => res.json()),
    enabled: open && !mealId // Only fetch if dialog is open and no mealId is provided
  });

  // Get food items for search
  const { data: foodItems, isLoading: isSearching } = useQuery({
    queryKey: ['/api/food-items/search', { q: searchQuery }],
    queryFn: () => 
      fetch(`/api/food-items/search?q=${encodeURIComponent(searchQuery)}`)
        .then(res => res.json()),
    enabled: open && activeTab === 'search' && searchQuery.length > 0
  });

  // Get all food items
  const { data: allFoodItems, isLoading: isLoadingFoods } = useQuery({
    queryKey: ['/api/food-items'],
    queryFn: () => 
      fetch('/api/food-items')
        .then(res => res.json()),
    enabled: open && activeTab === 'browse'
  });

  // Get selected food details
  const { data: selectedFood } = useQuery({
    queryKey: ['/api/food-items/' + selectedFoodId],
    queryFn: () => 
      fetch(`/api/food-items/${selectedFoodId}`)
        .then(res => res.json()),
    enabled: open && selectedFoodId !== null && !food
  });

  // Create meal item mutation
  const createMealItem = useMutation({
    mutationFn: (mealItem: { mealId: number, foodItemId: number, quantity: number }) => 
      apiRequest("POST", "/api/meal-items", mealItem),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Food added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/daily`] });
      queryClient.invalidateQueries({ queryKey: [`/api/meals/${mealId}`] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add food: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Create meal and then meal item mutation
  const createMealAndItem = useMutation({
    mutationFn: async (data: { 
      meal: { userId: number, name: string, date: string, time: string },
      foodItemId: number,
      quantity: number
    }) => {
      const mealResponse = await apiRequest("POST", "/api/meals", data.meal);
      const mealData = await mealResponse.json();
      
      return apiRequest("POST", "/api/meal-items", {
        mealId: mealData.id,
        foodItemId: data.foodItemId,
        quantity: data.quantity
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Meal and food added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/daily`] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add meal and food: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const handleAddFood = () => {
    const foodId = selectedFoodId || (food?.id ?? null);
    if (!foodId) {
      toast({
        title: "Error",
        description: "Please select a food item",
        variant: "destructive"
      });
      return;
    }

    const parsedQuantity = parseFloat(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid quantity",
        variant: "destructive"
      });
      return;
    }

    if (mealId) {
      // If mealId is provided, just add the food to the meal
      createMealItem.mutate({
        mealId,
        foodItemId: foodId,
        quantity: parsedQuantity
      });
    } else if (meals && meals.length > 0) {
      // If there are meals for the date, show select dropdown
      const selectedMealId = document.getElementById('mealSelect') as HTMLSelectElement;
      if (selectedMealId.value) {
        createMealItem.mutate({
          mealId: parseInt(selectedMealId.value),
          foodItemId: foodId,
          quantity: parsedQuantity
        });
      } else {
        toast({
          title: "Error",
          description: "Please select a meal",
          variant: "destructive"
        });
      }
    } else {
      // Create a new meal with defaults
      const currentTime = new Date();
      const hours = currentTime.getHours();
      let mealName = "Snack";
      let mealTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      if (hours < 10) {
        mealName = "Breakfast";
      } else if (hours < 14) {
        mealName = "Lunch";
      } else if (hours < 20) {
        mealName = "Dinner";
      }
      
      createMealAndItem.mutate({
        meal: {
          userId,
          name: mealName,
          date,
          time: mealTime
        },
        foodItemId: foodId,
        quantity: parsedQuantity
      });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The useQuery will automatically refetch due to queryKey change
  };

  const displayFood = food || selectedFood;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Food to Meal</DialogTitle>
        </DialogHeader>
        
        {displayFood ? (
          // Food is selected, show quantity form
          <div className="py-4">
            <div className="mb-4">
              <h3 className="font-medium text-lg">{displayFood.name}</h3>
              <div className="text-sm text-gray-500 mt-1">
                Per serving ({displayFood.servingSize}{displayFood.servingUnit}):
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="bg-gray-50 p-2 rounded">
                  <div className="text-xs text-gray-500">Calories</div>
                  <div className="font-semibold">{displayFood.calories} kcal</div>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <div className="text-xs text-gray-500">Protein</div>
                  <div className="font-semibold">{displayFood.protein}g</div>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <div className="text-xs text-gray-500">Carbs</div>
                  <div className="font-semibold">{displayFood.carbs}g</div>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <div className="text-xs text-gray-500">Fat</div>
                  <div className="font-semibold">{displayFood.fat}g</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity (servings)</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
              
              {!mealId && meals && meals.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="mealSelect">Add to Meal</Label>
                  <Select id="mealSelect">
                    <SelectTrigger>
                      <SelectValue placeholder="Select a meal" />
                    </SelectTrigger>
                    <SelectContent>
                      {meals.map((meal: any) => (
                        <SelectItem key={meal.id} value={meal.id.toString()}>
                          {meal.name} ({meal.time})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            
            <div className="mt-4">
              <Button
                className="w-full"
                onClick={handleAddFood}
                disabled={createMealItem.isPending || createMealAndItem.isPending}
              >
                {createMealItem.isPending || createMealAndItem.isPending ? 
                  "Adding..." : "Add to Meal"}
              </Button>
              <Button 
                variant="outline" 
                className="w-full mt-2"
                onClick={() => {
                  setSelectedFoodId(null);
                  setActiveTab('search');
                }}
              >
                Select Different Food
              </Button>
            </div>
          </div>
        ) : (
          // No food selected, show search form
          <div className="py-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="search">Search</TabsTrigger>
                <TabsTrigger value="browse">Browse All</TabsTrigger>
              </TabsList>
              
              <TabsContent value="search" className="space-y-4 pt-4">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <Input
                    placeholder="Search for foods..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-grow"
                  />
                  <Button type="submit" variant="outline" size="icon">
                    <SearchIcon className="h-4 w-4" />
                  </Button>
                </form>
                
                <div className="max-h-64 overflow-y-auto">
                  {isSearching ? (
                    <div className="py-4 text-center text-gray-500">Searching...</div>
                  ) : foodItems && foodItems.length > 0 ? (
                    <div className="space-y-2">
                      {foodItems.map((item: FoodItem) => (
                        <div 
                          key={item.id}
                          className="border rounded p-3 cursor-pointer hover:bg-gray-50"
                          onClick={() => setSelectedFoodId(item.id)}
                        >
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-500">
                            {item.calories} kcal | P: {item.protein}g | C: {item.carbs}g | F: {item.fat}g
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : searchQuery ? (
                    <div className="py-4 text-center text-gray-500">
                      No foods found matching "{searchQuery}"
                    </div>
                  ) : (
                    <div className="py-4 text-center text-gray-500">
                      Enter a search term to find foods
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="browse" className="pt-4">
                <div className="max-h-64 overflow-y-auto">
                  {isLoadingFoods ? (
                    <div className="py-4 text-center text-gray-500">Loading foods...</div>
                  ) : allFoodItems && allFoodItems.length > 0 ? (
                    <div className="space-y-2">
                      {allFoodItems.map((item: FoodItem) => (
                        <div 
                          key={item.id}
                          className="border rounded p-3 cursor-pointer hover:bg-gray-50"
                          onClick={() => setSelectedFoodId(item.id)}
                        >
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-500">
                            {item.calories} kcal | P: {item.protein}g | C: {item.carbs}g | F: {item.fat}g
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-4 text-center text-gray-500">
                      No foods available
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
