import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getToday, getPreviousDays, formatDate } from "@/lib/dateUtils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function Reports() {
  const [selectedDate, setSelectedDate] = useState<string>(getToday());
  const userId = 1; // Demo user
  
  const { data: weeklyData } = useQuery({
    queryKey: ['/api/users/' + userId + '/weekly', { endDate: selectedDate }],
    queryFn: () => 
      fetch(`/api/users/${userId}/weekly?endDate=${selectedDate}`)
        .then(res => res.json()),
  });
  
  // Get daily data for the selected date
  const { data: dailyData } = useQuery({
    queryKey: ['/api/users/' + userId + '/daily', { date: selectedDate }],
    queryFn: () => 
      fetch(`/api/users/${userId}/daily?date=${selectedDate}`)
        .then(res => res.json()),
  });

  // Past 7 days' queries for a week view
  const past7Days = getPreviousDays(selectedDate, 7);
  
  const { data: weeklyNutrients } = useQuery({
    queryKey: ['/api/users/' + userId + '/weekly-nutrients', { dates: past7Days }],
    queryFn: () => 
      Promise.all(
        past7Days.map(date => 
          fetch(`/api/users/${userId}/daily?date=${date}`).then(res => res.json())
        )
      ),
  });

  // Prepare macro distribution data for pie chart
  const macroData = dailyData ? [
    { name: 'Protein', value: dailyData.totals.protein * 4 }, // 4 calories per gram
    { name: 'Carbs', value: dailyData.totals.carbs * 4 }, // 4 calories per gram
    { name: 'Fat', value: dailyData.totals.fat * 9 }, // 9 calories per gram
  ] : [];

  const COLORS = ['#22C55E', '#3B82F6', '#F59E0B'];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header 
        selectedDate={selectedDate} 
        onDateChange={setSelectedDate} 
      />
      
      <main className="flex-grow overflow-auto pb-16 md:pb-0">
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4">Nutrition Reports</h1>
          
          <Tabs defaultValue="daily" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="daily">Daily Overview</TabsTrigger>
              <TabsTrigger value="weekly">Weekly Trends</TabsTrigger>
            </TabsList>
            
            <TabsContent value="daily" className="space-y-4">
              {dailyData ? (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Calorie Breakdown for {formatDate(selectedDate)}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="text-center mb-4">
                        <span className="text-4xl font-bold text-primary">
                          {dailyData.totals.calories.toFixed(0)}
                        </span>
                        <span className="text-xl text-gray-400"> / {dailyData.targets.calories} kcal</span>
                      </div>
                      
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={macroData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {macroData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => [`${value} kcal`, 'Calories']} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Meal Distribution</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {dailyData.meals.length > 0 ? (
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={dailyData.meals.map(meal => ({
                                  name: meal.name,
                                  calories: meal.totalCalories
                                }))}
                                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value) => [`${value} kcal`, 'Calories']} />
                                <Bar dataKey="calories" fill="#4F46E5" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        ) : (
                          <p className="text-center py-10 text-gray-500">No meals logged for this day</p>
                        )}
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Nutrients Breakdown</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">Protein</span>
                              <span className="text-sm font-semibold">
                                {dailyData.totals.protein.toFixed(1)}g / {dailyData.targets.protein}g
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-green-500 rounded-full h-2.5" 
                                style={{ width: `${Math.min(100, (dailyData.totals.protein / dailyData.targets.protein) * 100)}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">Carbs</span>
                              <span className="text-sm font-semibold">
                                {dailyData.totals.carbs.toFixed(1)}g / {dailyData.targets.carbs}g
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-blue-500 rounded-full h-2.5" 
                                style={{ width: `${Math.min(100, (dailyData.totals.carbs / dailyData.targets.carbs) * 100)}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">Fat</span>
                              <span className="text-sm font-semibold">
                                {dailyData.totals.fat.toFixed(1)}g / {dailyData.targets.fat}g
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-yellow-500 rounded-full h-2.5" 
                                style={{ width: `${Math.min(100, (dailyData.totals.fat / dailyData.targets.fat) * 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              ) : (
                <Card>
                  <CardContent className="p-6">
                    <div className="h-64 flex items-center justify-center">
                      <p className="text-gray-500">Loading daily report data...</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="weekly" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Calorie Intake</CardTitle>
                </CardHeader>
                <CardContent>
                  {weeklyData ? (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={weeklyData.dates.map((date, index) => ({
                            date: formatDate(date, { weekday: 'short' }),
                            calories: weeklyData.calories[index],
                            target: weeklyData.target
                          }))}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip formatter={(value) => [`${value} kcal`, 'Calories']} />
                          <Legend />
                          <Bar dataKey="calories" fill="#4F46E5" name="Calories" />
                          <Line type="monotone" dataKey="target" stroke="#DC2626" name="Target" strokeWidth={2} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center">
                      <p className="text-gray-500">Loading weekly data...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {weeklyNutrients && (
                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Nutrient Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={weeklyNutrients.map((day: any, index: number) => ({
                            date: formatDate(past7Days[index], { weekday: 'short' }),
                            protein: day.totals.protein,
                            carbs: day.totals.carbs,
                            fat: day.totals.fat
                          }))}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip formatter={(value) => [`${value}g`, '']} />
                          <Legend />
                          <Line type="monotone" dataKey="protein" stroke="#22C55E" name="Protein" />
                          <Line type="monotone" dataKey="carbs" stroke="#3B82F6" name="Carbs" />
                          <Line type="monotone" dataKey="fat" stroke="#F59E0B" name="Fat" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer activePage="reports" />
    </div>
  );
}
