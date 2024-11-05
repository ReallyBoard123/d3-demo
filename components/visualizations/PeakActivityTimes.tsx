import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ActivityTooltip } from '@/components/common/ActivityTooltip';
import { ChartLegend, type LegendItem } from '@/components/common/ChartLegend';
import { formatDateRange } from '@/lib/utils';
import { useColorStore } from '@/stores/useColorStore';
import type { BaseActivityProps } from '@/types/activity';

interface HourData {
  hour: string;
  selected: number;
  comparison?: number;
}

export const PeakActivityTimes: React.FC<BaseActivityProps> = ({
  data,
  hiddenActivities,
  selectedDates,
  comparisonDates,
  isComparisonEnabled
}) => {
  const getChartColors = useColorStore(state => state.getChartColors);
  const colors = getChartColors('peak-activity');

  const dateDisplay = React.useMemo(() => ({
    selected: formatDateRange(selectedDates),
    comparison: isComparisonEnabled ? formatDateRange(comparisonDates) : null
  }), [selectedDates, comparisonDates, isComparisonEnabled]);

  const hourlyData = React.useMemo(() => {
    const hours: HourData[] = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i.toString().padStart(2, '0')}:00`,
      selected: 0,
      ...(isComparisonEnabled ? { comparison: 0 } : {})
    }));

    // Process selected dates data
    data.forEach(record => {
      if (hiddenActivities.has(record.activity)) return;
      if (!selectedDates.has(record.date)) return;

      const startHour = Math.floor(record.startTime / 3600) % 24;
      const duration = record.duration / 3600;
      hours[startHour].selected += duration;
    });

    // Process comparison dates if enabled
    if (isComparisonEnabled) {
      data.forEach(record => {
        if (hiddenActivities.has(record.activity)) return;
        if (!comparisonDates.has(record.date)) return;

        const startHour = Math.floor(record.startTime / 3600) % 24;
        const duration = record.duration / 3600;
        hours[startHour].comparison! += duration;
      });
    }

    return hours.map(h => ({
      ...h,
      selected: Number(h.selected.toFixed(2)),
      ...(isComparisonEnabled ? { 
        comparison: Number(h.comparison!.toFixed(2)) 
      } : {})
    }));
  }, [data, hiddenActivities, selectedDates, comparisonDates, isComparisonEnabled]);

  const legendItems: LegendItem[] = React.useMemo(() => [
    {
      label: 'Selected Period',
      color: colors[0],
      value: `${hourlyData.reduce((sum, h) => sum + h.selected, 0).toFixed(1)}h total`,
      ...(isComparisonEnabled ? {
        comparison: {
          color: colors[1],
          value: `${hourlyData.reduce((sum, h) => sum + (h.comparison || 0), 0).toFixed(1)}h total`
        }
      } : {})
    }
  ], [hourlyData, colors, isComparisonEnabled]);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Peak Activity Times</CardTitle>
          <div className="text-sm font-normal text-gray-500">
            <div>{dateDisplay.selected}</div>
            {isComparisonEnabled && dateDisplay.comparison && (
              <div>vs {dateDisplay.comparison}</div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={hourlyData}>
              <XAxis dataKey="hour" />
              <YAxis 
                label={{ value: 'Hours of Activity', angle: -90, position: 'insideLeft' }}
                tickFormatter={(value) => `${value}h`}
              />
              <Tooltip
                content={
                  <ActivityTooltip
                    dateDisplay={dateDisplay}
                    isComparisonEnabled={isComparisonEnabled}
                    valueFormatter={(value) => `${value.toFixed(2)}h`}
                    labelKey="hour"
                  />
                }
              />
              <Line 
                type="monotone" 
                dataKey="selected"
                stroke={colors[0]}
                strokeWidth={2}
                dot={false}
              />
              {isComparisonEnabled && (
                <Line 
                  type="monotone" 
                  dataKey="comparison"
                  stroke={colors[1]}
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="5 5"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <ChartLegend
          className="mt-6"
          items={legendItems}
          showComparison={isComparisonEnabled}
        />
      </CardContent>
    </Card>
  );
};