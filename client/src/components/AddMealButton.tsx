import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Plus, AlarmClock, UtensilsCrossed } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AddMealButtonProps {
  userId: number;
  date: string;
}

export default function AddMealButton({ userId, date }: AddMealButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mealName, setMealName] = useState('');
  const [mealTime, setMealTime] = useState('');
  const { toast } = useToast();

  // Common meal suggestions
  const mealSuggestions = [
    { value: "Breakfast", time: "8:00 AM" },
    { value: "Brunch", time: "10:30 AM" },
    { value: "Lunch", time: "12:30 PM" },
    { value: "Afternoon Snack", time: "3:00 PM" },
    { value: "Dinner", time: "7:00 PM" },
    { value: "Evening Snack", time: "9:00 PM" }
  ];

  // Handle meal type selection
  const handleMealTypeSelect = (value: string) => {
    setMealName(value);
    const suggestion = mealSuggestions.find(s => s.value === value);
    if (suggestion) {
      setMealTime(suggestion.time);
    }
  };

  // Create meal mutation
  const createMeal = useMutation({
    mutationFn: (meal: { userId: number, name: string, date: string, time: string }) => 
      apiRequest("POST", "/api/meals", meal),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Meal created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/daily`] });
      setIsOpen(false);
      setMealName('');
      setMealTime('');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create meal: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const handleAddMeal = () => {
    if (!mealName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a meal name",
        variant: "destructive"
      });
      return;
    }

    if (!mealTime.trim()) {
      toast({
        title: "Error",
        description: "Please enter a meal time",
        variant: "destructive"
      });
      return;
    }

    createMeal.mutate({
      userId,
      name: mealName,
      date,
      time: mealTime
    });
  };

  return (
    <>
      <div className="fixed bottom-24 right-6 z-10 md:bottom-10">
        <button 
          className="bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg text-white rounded-full w-14 h-14 shadow-xl flex items-center justify-center transition-all hover:scale-105"
          onClick={() => setIsOpen(true)}
          aria-label="Add meal"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-primary">
              <UtensilsCrossed className="mr-2 h-5 w-5" />
              Add New Meal
            </DialogTitle>
            <DialogDescription>
              Create a new meal to start tracking your food intake
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="mealType" className="text-sm font-medium">Meal Type</Label>
              <Select value={mealName} onValueChange={handleMealTypeSelect}>
                <SelectTrigger id="mealType">
                  <SelectValue placeholder="Select a meal type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Common Meals</SelectLabel>
                    {mealSuggestions.map(suggestion => (
                      <SelectItem key={suggestion.value} value={suggestion.value}>
                        {suggestion.value}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="customMealName" className="text-sm font-medium">Custom Meal Name</Label>
              <Input
                id="customMealName"
                placeholder="Or enter a custom meal name..."
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
                className="focus:ring-2 focus:ring-primary/20"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mealTime" className="text-sm font-medium flex items-center">
                <AlarmClock className="mr-1 h-4 w-4" />
                Time
              </Label>
              <Input
                id="mealTime"
                placeholder="8:30 AM, 12:00 PM..."
                value={mealTime}
                onChange={(e) => setMealTime(e.target.value)}
                className="focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddMeal}
              disabled={createMeal.isPending}
              className="bg-gradient-to-r from-primary to-primary/80"
            >
              {createMeal.isPending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding...
                </>
              ) : (
                "Add Meal"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
