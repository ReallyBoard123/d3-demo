import React from 'react';
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { useTranslation } from '@/hooks/useTranslation';

interface DateMetrics {
  employeeCount: number;
  totalDuration: number;
  missingEmployees: string[];
}

interface DateSelectionProps {
  dates: string[];
  dateMetrics: Record<string, DateMetrics>;
  selectedDates: Set<string>;
  comparisonDates: Set<string>;
  isComparisonEnabled: boolean;
  expectedEmployeeCount: number;
  onDateToggle: (date: string, isComparison: boolean) => void;
}

export const DateSelection: React.FC<DateSelectionProps> = ({
  dates,
  dateMetrics,
  selectedDates,
  comparisonDates,
  isComparisonEnabled,
  expectedEmployeeCount,
  onDateToggle,
}) => {
  const { t } = useTranslation();
  const formatDate = (date: string) => format(new Date(date), 'MMM dd, yyyy');

  const hasIncompleteData = (date: string) => {
    const metrics = dateMetrics[date];
    return metrics && metrics.employeeCount < expectedEmployeeCount;
  };

  const getMissingEmployeesText = (date: string) => {
    const metrics = dateMetrics[date];
    if (!metrics?.missingEmployees?.length) return null;
    return t('settings.dateSelection.missingEmployees', { 
      employees: metrics.missingEmployees.join(', ') 
    });
  };

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-4">
        {dates.map(date => {
          const metrics = dateMetrics[date];
          if (!metrics || metrics.totalDuration === 0) return null;

          const isIncomplete = hasIncompleteData(date);
          const missingText = getMissingEmployeesText(date);

          return (
            <div key={date} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">{formatDate(date)}</span>
                {isIncomplete && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{missingText || t('settings.dateSelection.missingCount', { 
                          count: expectedEmployeeCount - metrics.employeeCount 
                        })}</p>
                        <p className="text-xs mt-1">{t('settings.dateSelection.expected', { 
                          count: expectedEmployeeCount 
                        })}</p>
                        <p className="text-xs">{t('settings.dateSelection.present', { 
                          count: metrics.employeeCount 
                        })}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <div className="flex gap-2">
                <Switch
                  checked={selectedDates.has(date)}
                  onCheckedChange={() => onDateToggle(date, false)}
                  className={isIncomplete ? 'data-[state=checked]:bg-red-500' : ''}
                />
                {isComparisonEnabled && (
                  <Switch
                    checked={comparisonDates.has(date)}
                    onCheckedChange={() => onDateToggle(date, true)}
                    className={isIncomplete ? 'data-[state=checked]:bg-red-500' : ''}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};