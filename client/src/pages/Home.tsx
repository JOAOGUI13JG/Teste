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
import { Button } from "@/components/ui/button";
import { exportDailyDataAsHtml } from "@/lib/exportUtils";
import { CalendarDays, ArrowLeft, ArrowRight, UtensilsCrossed, BarChart, FileDown } from "lucide-react";

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
  
  // Helper functions to navigate dates
  const goToPreviousDay = () => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() - 1);
    setSelectedDate(currentDate.toISOString().split('T')[0]);
  };
  
  const goToNextDay = () => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + 1);
    const nextDate = currentDate.toISOString().split('T')[0];
    // Don't allow selecting future dates
    if (nextDate <= getToday()) {
      setSelectedDate(nextDate);
    }
  };
  
  const goToToday = () => {
    setSelectedDate(getToday());
  };
  
  // Check if selected date is today
  const isToday = selectedDate === getToday();
  const displayDate = formatDate(selectedDate, {
    weekday: 'long',
    month: 'long', 
    day: 'numeric'
  });

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header 
        selectedDate={selectedDate} 
        onDateChange={handleDateChange} 
      />
      
      <main className="flex-grow overflow-auto pb-16 md:pb-0 md:pt-0">
        <div className="container mx-auto p-4">
          {/* Date navigation and export button */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <div className="flex justify-between items-center w-full md:w-auto bg-white p-3 rounded-lg shadow-sm border border-gray-100 mb-3 md:mb-0">
              <button 
                onClick={goToPreviousDay}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                aria-label="Previous day"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              
              <div className="flex flex-col items-center mx-4">
                <h2 className="text-lg font-semibold text-gray-800">{displayDate}</h2>
                {!isToday && (
                  <button 
                    onClick={goToToday}
                    className="flex items-center text-xs text-primary mt-1 hover:underline"
                  >
                    <CalendarDays className="h-3 w-3 mr-1" />
                    Jump to Today
                  </button>
                )}
              </div>
              
              <button 
                onClick={goToNextDay}
                className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${new Date(selectedDate) >= new Date(getToday()) ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600'}`}
                aria-label="Next day"
                disabled={new Date(selectedDate) >= new Date(getToday())}
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
            
            {!isLoading && !isError && dailyData && (
              <Button
                variant="outline"
                className="w-full md:w-auto border-primary text-primary hover:bg-primary/5"
                onClick={() => {
                  const formattedDate = formatDate(selectedDate, { year: 'numeric', month: 'short', day: 'numeric' });
                  exportDailyDataAsHtml(dailyData, `nutrition-report-${formattedDate}.html`);
                }}
              >
                <FileDown className="h-4 w-4 mr-2" />
                Export as HTML
              </Button>
            )}
          </div>
        
          {isLoading ? (
            <div className="space-y-4">
              <div className="h-40 bg-white rounded-lg shadow-sm animate-pulse"></div>
              <div className="h-60 bg-white rounded-lg shadow-sm animate-pulse"></div>
              <div className="h-60 bg-white rounded-lg shadow-sm animate-pulse"></div>
            </div>
          ) : isError ? (
            <div className="p-4 bg-red-50 text-red-500 border border-red-100 rounded-lg">
              <p className="font-medium">Error loading daily nutrition data</p>
              <p className="text-sm mt-1">Please try refreshing the page</p>
            </div>
          ) : (
            <>
              <DailyNutritionOverview 
                totals={dailyData!.totals} 
                targets={dailyData!.targets} 
              />
              
              {/* Quick stats */}
              {weeklyData && (
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
                    <div className="text-xs text-gray-500 mb-1">Daily Average</div>
                    <div className="text-lg font-semibold text-primary">
                      {Math.round(weeklyData.calories.reduce((sum, val) => sum + val, 0) / weeklyData.calories.length)} cal
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
                    <div className="text-xs text-gray-500 mb-1">Tracked Days</div>
                    <div className="text-lg font-semibold text-emerald-600">
                      {weeklyData.dates.length} days
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
                    <div className="text-xs text-gray-500 mb-1">Today's Progress</div>
                    <div className="text-lg font-semibold text-amber-600">
                      {Math.round((dailyData!.totals.calories / dailyData!.targets.calories) * 100)}%
                    </div>
                  </div>
                </div>
              )}
              
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <div className="w-1.5 h-6 bg-primary rounded-full mr-2"></div>
                <UtensilsCrossed className="h-5 w-5 mr-2 text-primary" />
                Meals
              </h2>
              
              <MealList 
                meals={dailyData!.meals}
                date={selectedDate}
                userId={userId}
              />
              
              {weeklyData && (
                <>
                  <h2 className="text-xl font-semibold mb-4 mt-8 flex items-center">
                    <div className="w-1.5 h-6 bg-primary rounded-full mr-2"></div>
                    <BarChart className="h-5 w-5 mr-2 text-primary" />
                    Weekly Overview
                  </h2>
                  <NutritionHistory weeklyData={weeklyData} />
                </>
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
