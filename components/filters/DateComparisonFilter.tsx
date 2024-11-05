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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GitCompareIcon, X, AlertTriangle } from "lucide-react";
import { format, parse, isValid } from "date-fns";
import { cn } from '@/lib/utils';

interface DateMetrics {
  employeeCount: number;
  totalDuration: number;
}

interface DateComparisonFilterProps {
  dates: string[];  // All possible dates in yyyy-MM-dd format
  selectedDates: string[];
  onDateSelection: (dates: string[]) => void;
  comparisonMode: boolean;
  onComparisonModeChange: (enabled: boolean) => void;
  expectedEmployeeCount: number;
  dateMetrics: Record<string, DateMetrics>;
}

interface GroupedDates {
  [weekKey: string]: Array<{
    date: string;
    metrics: DateMetrics;
    hasIncompleteData: boolean;
  }>;
}

const DateComparisonFilter: React.FC<DateComparisonFilterProps> = ({
  dates,
  selectedDates,
  onDateSelection,
  comparisonMode,
  onComparisonModeChange,
  expectedEmployeeCount,
  dateMetrics
}) => {
  // Group dates by week and filter out dates with no data
  const groupedDates = React.useMemo(() => {
    const groups: GroupedDates = {};
    
    dates.forEach(date => {
      const metrics = dateMetrics[date];
      
      // Skip dates with no data
      if (!metrics || metrics.totalDuration === 0) return;

      const parsedDate = parse(date, 'yyyy-MM-dd', new Date());
      if (!isValid(parsedDate)) return;

      const weekKey = format(parsedDate, "'Week of' MMM d");
      if (!groups[weekKey]) {
        groups[weekKey] = [];
      }

      groups[weekKey].push({
        date,
        metrics,
        hasIncompleteData: metrics.employeeCount < expectedEmployeeCount
      });
    });

    return groups;
  }, [dates, dateMetrics, expectedEmployeeCount]);

  const handleDateToggle = (date: string) => {
    if (comparisonMode && selectedDates.length >= 2 && !selectedDates.includes(date)) {
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
                  {dates.map(({ date, metrics, hasIncompleteData }) => (
                    <TooltipProvider key={date}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SelectItem
                            value={date}
                            onSelect={() => handleDateToggle(date)}
                            className={cn(
                              "cursor-pointer",
                              selectedDates.includes(date) && "bg-secondary",
                              hasIncompleteData && "border-l-2 border-red-500"
                            )}
                          >
                            <div className="flex justify-between items-center w-full">
                              <span>{formatDisplayDate(date)}</span>
                              <div className="flex items-center gap-2">
                                {hasIncompleteData && (
                                  <AlertTriangle className="h-4 w-4 text-red-500" />
                                )}
                                {selectedDates.includes(date) && (
                                  <Badge variant="outline" className="ml-2">
                                    Selected
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </SelectItem>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-1 text-sm">
                            <p>Employees: {metrics.employeeCount}/{expectedEmployeeCount}</p>
                            <p>Total Hours: {(metrics.totalDuration / 3600).toFixed(1)}h</p>
                            {hasIncompleteData && (
                              <p className="text-red-500">
                                Missing data for {expectedEmployeeCount - metrics.employeeCount} employee(s)
                              </p>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
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