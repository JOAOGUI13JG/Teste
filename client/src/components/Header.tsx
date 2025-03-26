import { CalendarIcon } from "lucide-react";
import DatePicker from "@/components/DatePicker";
import { formatDate } from "@/lib/dateUtils";

interface HeaderProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export default function Header({ selectedDate, onDateChange }: HeaderProps) {
  const isToday = selectedDate === new Date().toISOString().split('T')[0];
  const displayDate = isToday ? `Today, ${formatDate(selectedDate, { month: 'short', day: 'numeric' })}` : formatDate(selectedDate);

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">CalTrack</h1>
          <div className="flex items-center space-x-3">
            <DatePicker 
              selected={selectedDate} 
              onSelect={onDateChange}
              trigger={
                <button className="flex items-center text-sm font-medium text-gray-700 hover:text-primary">
                  <span>{displayDate}</span>
                  <CalendarIcon className="ml-2 h-4 w-4" />
                </button>
              }
            />
            <button className="text-gray-500 hover:text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
