import { CalendarIcon, User } from "lucide-react";
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
    <header className="bg-gradient-to-r from-primary/90 to-primary shadow-md">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-white rounded-full p-1.5 mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17l4-4m0 0l4-4m-4 4H3m14-4h4" />
                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                <path d="M12 8v8M8 12h8" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white flex items-center">
              <span className="mr-1">Cal</span>
              <span className="bg-white text-primary px-1 rounded">Track</span>
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            <DatePicker 
              selected={selectedDate} 
              onSelect={onDateChange}
              trigger={
                <button className="flex items-center text-sm font-medium text-white bg-white/20 hover:bg-white/30 transition-colors px-3 py-1.5 rounded-full">
                  <span>{displayDate}</span>
                  <CalendarIcon className="ml-2 h-4 w-4" />
                </button>
              }
            />
            <button className="text-white hover:text-white/80 bg-white/20 hover:bg-white/30 transition-colors p-2 rounded-full">
              <User className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
