import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  selected: string;
  onSelect: (date: string) => void;
  trigger?: React.ReactNode;
}

export default function DatePicker({ selected, onSelect, trigger }: DatePickerProps) {
  const [date, setDate] = useState<Date | undefined>(selected ? new Date(selected) : new Date());
  const initialRender = useRef(true);

  useEffect(() => {
    if (!initialRender.current) {
      if (date) {
        const dateString = date.toISOString().split('T')[0];
        onSelect(dateString);
      }
    } else {
      initialRender.current = false;
    }
  }, [date, onSelect]);

  useEffect(() => {
    if (selected) {
      setDate(new Date(selected));
    }
  }, [selected]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        {trigger || (
          <Button
            variant={"outline"}
            className={cn(
              "w-[240px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
