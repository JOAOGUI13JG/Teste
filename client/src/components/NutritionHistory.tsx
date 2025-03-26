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
  ResponsiveContainer,
  LabelList
} from "recharts";

interface NutritionHistoryProps {
  weeklyData: WeeklyData;
}

export default function NutritionHistory({ weeklyData }: NutritionHistoryProps) {
  // Format data for the chart
  const data = weeklyData.dates.map((date, index) => ({
    name: formatDate(date, { weekday: 'short' }),
    calories: weeklyData.calories[index],
    // Calculate percentage of target
    percentage: Math.round((weeklyData.calories[index] / weeklyData.target) * 100),
  }));

  // Determine bar colors based on percentage of target
  const getBarColor = (entry: any) => {
    const percentage = (entry.calories / weeklyData.target) * 100;
    if (percentage < 70) return '#10b981'; // green (under target)
    if (percentage < 95) return '#6366f1'; // purple/primary (near target)
    if (percentage < 110) return '#f59e0b'; // amber (at target)
    return '#ef4444'; // red (over target)
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-lg">
          <p className="font-semibold text-gray-800">{label}</p>
          <p className="text-sm text-gray-600">
            {payload[0].payload.calories.toLocaleString()} kcal 
            <span className="ml-2 text-xs">
              ({payload[0].payload.percentage}% of target)
            </span>
          </p>
          <div className="h-1.5 w-full bg-gray-200 rounded-full mt-2">
            <div 
              className="h-1.5 rounded-full" 
              style={{ 
                width: `${Math.min(payload[0].payload.percentage, 120)}%`,
                backgroundColor: getBarColor(payload[0].payload)
              }}
            />
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6 border border-gray-100">
      <div className="h-64 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 10,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              dx={-10}
              tickFormatter={(value) => `${value.toLocaleString()}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="top" 
              height={36} 
              formatter={() => (
                <span className="flex items-center">
                  <span className="inline-block w-3 h-3 bg-primary mr-2 rounded-full"></span>
                  Daily Calories
                </span>
              )}
            />
            <ReferenceLine 
              y={weeklyData.target} 
              stroke="#DC2626" 
              strokeDasharray="5 5"
              label={{
                position: 'right',
                value: `Target: ${weeklyData.target} kcal`,
                fill: '#DC2626',
                fontSize: 12
              }}
            />
            <Bar 
              dataKey="calories" 
              name="Calories"
              radius={[6, 6, 0, 0]} 
              fill="#6366f1"
              minPointSize={3}
              barSize={40}
              animationDuration={1500}
            >
              {data.map((entry, index) => (
                <Bar key={`bar-${index}`} dataKey="calories" fill={getBarColor(entry)} />
              ))}
              <LabelList dataKey="percentage" position="top" formatter={(value: number) => `${value}%`} style={{ fontSize: '12px', fill: '#6b7280' }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-between mt-4 text-xs text-gray-500">
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 rounded-full mr-1 bg-green-500"></span>
          Under Target
        </div>
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 rounded-full mr-1 bg-primary"></span>
          Near Target
        </div>
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 rounded-full mr-1 bg-amber-500"></span>
          At Target
        </div>
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 rounded-full mr-1 bg-red-500"></span>
          Over Target
        </div>
      </div>
    </div>
  );
}
