import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GitCompareIcon, X } from "lucide-react";
import { format, parse, isValid } from "date-fns";
import { cn } from '@/lib/utils';

interface DateComparisonFilterProps {
  availableDates: string[];  // yyyy-MM-dd format
  selectedDates: string[];
  onDateSelection: (dates: string[]) => void;
  comparisonMode: boolean;
  onComparisonModeChange: (enabled: boolean) => void;
}

const DateComparisonFilter: React.FC<DateComparisonFilterProps> = ({
  availableDates,
  selectedDates,
  onDateSelection,
  comparisonMode,
  onComparisonModeChange,
}) => {
  // Group dates by week and month for better organization
  const groupedDates = React.useMemo(() => {
    const groups: Record<string, string[]> = {};
    
    availableDates.forEach(date => {
      const parsedDate = parse(date, 'yyyy-MM-dd', new Date());
      if (!isValid(parsedDate)) return;

      const weekKey = format(parsedDate, "'Week of' MMM d");
      if (!groups[weekKey]) {
        groups[weekKey] = [];
      }
      groups[weekKey].push(date);
    });

    return groups;
  }, [availableDates]);

  const handleDateToggle = (date: string) => {
    if (comparisonMode && selectedDates.length >= 2 && !selectedDates.includes(date)) {
      // In comparison mode, limit to 2 dates
      return;
    }
    
    const newDates = selectedDates.includes(date)
      ? selectedDates.filter(d => d !== date)
      : [...selectedDates, date];
    
    onDateSelection(newDates);
  };

  const formatDisplayDate = (date: string) => {
    const parsedDate = parse(date, 'yyyy-MM-dd', new Date());
    return format(parsedDate, 'EEE, MMM d');
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base font-medium">Date Selection</CardTitle>
          <Button
            variant={comparisonMode ? "default" : "outline"}
            size="sm"
            onClick={() => onComparisonModeChange(!comparisonMode)}
            className="h-8"
          >
            <GitCompareIcon className="h-4 w-4 mr-2" />
            Compare
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Selected Dates Display */}
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedDates.map(date => (
            <Badge 
              key={date}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {formatDisplayDate(date)}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleDateToggle(date)}
              />
            </Badge>
          ))}
        </div>

        {/* Date Selection Dropdown */}
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select dates..." />
          </SelectTrigger>
          <SelectContent>
            <ScrollArea className="h-80">
              {Object.entries(groupedDates).map(([weekLabel, dates]) => (
                <SelectGroup key={weekLabel}>
                  <SelectLabel className="px-2 py-1.5 text-sm font-medium">
                    {weekLabel}
                  </SelectLabel>
                  {dates.map(date => (
                    <SelectItem
                      key={date}
                      value={date}
                      onSelect={() => handleDateToggle(date)}
                      className={cn(
                        "cursor-pointer",
                        selectedDates.includes(date) && "bg-secondary"
                      )}
                    >
                      <div className="flex justify-between items-center">
                        <span>{formatDisplayDate(date)}</span>
                        {selectedDates.includes(date) && (
                          <Badge variant="outline" className="ml-2">
                            Selected
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </ScrollArea>
          </SelectContent>
        </Select>

        {comparisonMode && (
          <p className="text-xs text-muted-foreground mt-2">
            Select two dates to compare their activities
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default DateComparisonFilter;