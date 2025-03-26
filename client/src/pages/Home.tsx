import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DailyNutritionOverview from "@/components/DailyNutritionOverview";
import MealList from "@/components/MealList";
import NutritionHistory from "@/components/NutritionHistory";
import AddMealButton from "@/components/AddMealButton";
import { DailyData } from "@shared/schema";
import { formatDate, getToday } from "@/lib/dateUtils";

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<string>(getToday());
  
  // User ID 1 is the demo user
  const userId = 1;
  
  const { data: dailyData, isLoading, isError } = useQuery<DailyData>({
    queryKey: ['/api/users/' + userId + '/daily', { date: selectedDate }],
    queryFn: () => 
      fetch(`/api/users/${userId}/daily?date=${selectedDate}`)
        .then(res => res.json()),
  });
  
  const { data: weeklyData } = useQuery({
    queryKey: ['/api/users/' + userId + '/weekly', { endDate: selectedDate }],
    queryFn: () => 
      fetch(`/api/users/${userId}/weekly?endDate=${selectedDate}`)
        .then(res => res.json()),
  });

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header 
        selectedDate={selectedDate} 
        onDateChange={handleDateChange} 
      />
      
      <main className="flex-grow overflow-auto pb-16 md:pb-0 md:pt-0">
        <div className="container mx-auto p-4">
          {isLoading ? (
            <div className="space-y-4">
              <div className="h-40 bg-white rounded-lg shadow-sm animate-pulse"></div>
              <div className="h-60 bg-white rounded-lg shadow-sm animate-pulse"></div>
              <div className="h-60 bg-white rounded-lg shadow-sm animate-pulse"></div>
            </div>
          ) : isError ? (
            <div className="p-4 bg-red-50 text-red-500 border border-red-100 rounded-lg">
              Error loading daily nutrition data. Please try again.
            </div>
          ) : (
            <>
              <DailyNutritionOverview 
                totals={dailyData!.totals} 
                targets={dailyData!.targets} 
              />
              
              <MealList 
                meals={dailyData!.meals}
                date={selectedDate}
                userId={userId}
              />
              
              {weeklyData && (
                <NutritionHistory weeklyData={weeklyData} />
              )}
            </>
          )}
        </div>
      </main>
      
      <AddMealButton userId={userId} date={selectedDate} />
      <Footer activePage="home" />
    </div>
  );
}
