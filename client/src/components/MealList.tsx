import { useMutation } from "@tanstack/react-query";
import { MealWithItems } from "@shared/schema";
import MealCard from "./MealCard";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface MealListProps {
  meals: MealWithItems[];
  date: string;
  userId: number;
}

export default function MealList({ meals, date, userId }: MealListProps) {
  const { toast } = useToast();

  // Get meals sorted by time
  const sortedMeals = [...meals].sort((a, b) => {
    // Convert time to 24-hour format for comparison
    const timeA = a.time.includes('AM') || a.time.includes('PM') 
      ? convertTo24Hour(a.time)
      : a.time;
    const timeB = b.time.includes('AM') || b.time.includes('PM')
      ? convertTo24Hour(b.time)
      : b.time;
    return timeA.localeCompare(timeB);
  });

  // Helper function to convert time from AM/PM to 24-hour format
  function convertTo24Hour(time: string): string {
    const [timePart, modifier] = time.split(' ');
    let [hours, minutes] = timePart.split(':');
    
    if (hours === '12') {
      hours = '00';
    }
    
    if (modifier === 'PM') {
      hours = String(parseInt(hours, 10) + 12);
    }
    
    return `${hours}:${minutes}`;
  }

  // Function to get the border color for each meal type
  const getMealBorderColor = (mealName: string): string => {
    const mealName_lower = mealName.toLowerCase();
    if (mealName_lower.includes('breakfast')) return 'border-primary';
    if (mealName_lower.includes('lunch')) return 'border-green-500';
    if (mealName_lower.includes('dinner')) return 'border-blue-500';
    if (mealName_lower.includes('snack')) return 'border-yellow-500';
    return 'border-gray-500';
  };
  
  // For demo, just show default meals
  const defaultMeals = sortedMeals.length > 0 ? sortedMeals : [
    {
      id: -1, // Use negative IDs for temporary meals
      userId,
      name: "Breakfast",
      date,
      time: "8:30 AM",
      items: [],
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0
    },
    {
      id: -2,
      userId,
      name: "Lunch",
      date,
      time: "12:30 PM",
      items: [],
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0
    },
    {
      id: -3,
      userId,
      name: "Dinner",
      date,
      time: "7:00 PM",
      items: [],
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0
    },
    {
      id: -4,
      userId,
      name: "Snacks",
      date,
      time: "Various Times",
      items: [],
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0
    }
  ];

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
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create meal: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Create default meal if it doesn't exist yet
  const handleMealCardClick = (meal: MealWithItems) => {
    // If it's a temporary meal (negative ID), create it first
    if (meal.id < 0) {
      createMeal.mutate({
        userId: meal.userId,
        name: meal.name,
        date: meal.date,
        time: meal.time
      });
    }
  };

  return (
    <div className="space-y-4 mb-6">
      {defaultMeals.map((meal) => (
        <div key={meal.id} onClick={() => handleMealCardClick(meal)}>
          <MealCard 
            meal={meal}
            userId={userId}
            borderColorClass={getMealBorderColor(meal.name)}
          />
        </div>
      ))}
    </div>
  );
}
