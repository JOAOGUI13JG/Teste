import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface AddMealButtonProps {
  userId: number;
  date: string;
}

export default function AddMealButton({ userId, date }: AddMealButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mealName, setMealName] = useState('');
  const [mealTime, setMealTime] = useState('');
  const { toast } = useToast();

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
          className="bg-primary hover:bg-indigo-700 text-white rounded-full w-14 h-14 shadow-lg flex items-center justify-center"
          onClick={() => setIsOpen(true)}
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Meal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="mealName">Meal Name</Label>
              <Input
                id="mealName"
                placeholder="Breakfast, Lunch, Dinner, Snack..."
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mealTime">Time</Label>
              <Input
                id="mealTime"
                placeholder="8:30 AM, 12:00 PM..."
                value={mealTime}
                onChange={(e) => setMealTime(e.target.value)}
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
            >
              {createMeal.isPending ? "Adding..." : "Add Meal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
