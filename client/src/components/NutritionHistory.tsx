import { useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WeeklyData } from "@shared/schema";
import { formatDate } from "@/lib/dateUtils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer
} from "recharts";

interface NutritionHistoryProps {
  weeklyData: WeeklyData;
}

export default function NutritionHistory({ weeklyData }: NutritionHistoryProps) {
  // Format data for the chart
  const data = weeklyData.dates.map((date, index) => ({
    name: formatDate(date, { weekday: 'short' }),
    calories: weeklyData.calories[index],
  }));

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <h2 className="text-lg font-semibold mb-4">Weekly Overview</h2>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              formatter={(value) => [`${value} kcal`, 'Calories']}
              labelFormatter={(value) => `Day: ${value}`}
            />
            <Legend />
            <Bar dataKey="calories" fill="#4F46E5" radius={[4, 4, 0, 0]} />
            <ReferenceLine y={weeklyData.target} stroke="#DC2626" strokeDasharray="5 5" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
