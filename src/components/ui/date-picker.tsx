import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { bs } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  minDate?: Date;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Izaberite datum",
  className,
  disabled,
  minDate,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "dd.MM.yyyy", { locale: bs }) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-card" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(date) => {
            onChange?.(date);
            setOpen(false);
          }}
          disabled={(date) => minDate ? date < minDate : false}
          initialFocus
          locale={bs}
          className="pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );
}
