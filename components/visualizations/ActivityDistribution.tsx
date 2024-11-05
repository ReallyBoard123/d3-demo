import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ActivityTooltip } from '@/components/common/ActivityTooltip';
import { ChartLegend, type LegendItem } from '@/components/common/ChartLegend';
import { formatDateRange } from '@/lib/utils';
import { useColorStore } from '@/stores/useColorStore';
import type { BaseActivityProps } from '@/types/activity';

interface ProcessedData {
  activity: string;
  selected: number;
  comparison?: number;
}

export const ActivityDistribution: React.FC<BaseActivityProps> = ({
  data,
  hiddenActivities,
  selectedDates,
  comparisonDates,
  isComparisonEnabled,
  chartId
}) => {
  const [inactiveActivities, setInactiveActivities] = React.useState<Set<string>>(new Set());
  const getChartColors = useColorStore(state => state.getChartColors);
  const colors = getChartColors(chartId);

  const dateDisplay = React.useMemo(() => ({
    selected: formatDateRange(selectedDates),
    comparison: isComparisonEnabled ? formatDateRange(comparisonDates) : null
  }), [selectedDates, comparisonDates, isComparisonEnabled]);

  const processedData = React.useMemo(() => {
    const summary: Record<string, { selected: number; comparison?: number }> = {};
    
    // Process selected dates data
    data.forEach(record => {
      if (!hiddenActivities.has(record.activity) && selectedDates.has(record.date)) {
        if (!summary[record.activity]) {
          summary[record.activity] = { selected: 0 };
        }
        summary[record.activity].selected += record.duration / 3600;
      }
    });

    // Process comparison dates if enabled
    if (isComparisonEnabled) {
      data.forEach(record => {
        if (!hiddenActivities.has(record.activity) && comparisonDates.has(record.date)) {
          if (!summary[record.activity]) {
            summary[record.activity] = { selected: 0, comparison: 0 };
          }
          if (!summary[record.activity].comparison) {
            summary[record.activity].comparison = 0;
          }
          summary[record.activity].comparison! += record.duration / 3600;
        }
      });
    }

    return Object.entries(summary)
      .map(([activity, values]): ProcessedData => ({
        activity,
        selected: Number(values.selected.toFixed(2)),
        ...(isComparisonEnabled ? { 
          comparison: Number(values.comparison?.toFixed(2) ?? 0) 
        } : {})
      }))
      .sort((a, b) => b.selected - a.selected);
  }, [data, hiddenActivities, selectedDates, comparisonDates, isComparisonEnabled]);

  const toggleActivity = (activity: string) => {
    setInactiveActivities(prev => {
      const next = new Set(prev);
      if (next.has(activity)) {
        next.delete(activity);
      } else {
        next.add(activity);
      }
      return next;
    });
  };

  const legendItems: LegendItem[] = React.useMemo(() => 
    processedData.map((item, index) => ({
      label: item.activity,
      color: colors.primary[index % colors.primary.length],
      value: `${item.selected.toFixed(1)}h`,
      inactive: inactiveActivities.has(item.activity),
      onClick: () => toggleActivity(item.activity),
      ...(isComparisonEnabled && item.comparison !== undefined ? {
        comparison: {
          value: `${item.comparison.toFixed(1)}h`,
          color: colors.comparison[index % colors.comparison.length]
        }
      } : {})
    })), [processedData, colors, inactiveActivities, isComparisonEnabled]);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Activity Distribution</CardTitle>
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
            <BarChart data={processedData}>
              <XAxis dataKey="activity" />
              <YAxis 
                label={{ value: 'Hours', angle: -90, position: 'insideLeft' }}
                tickFormatter={(value) => `${value}h`}
              />
              <Tooltip
                content={
                  <ActivityTooltip
                    dateDisplay={dateDisplay}
                    isComparisonEnabled={isComparisonEnabled}
                    valueFormatter={(value) => `${value.toFixed(2)}h`}
                  />
                }
              />
              <Bar
                dataKey="selected"
                fill={colors.primary[0]}
                hide={inactiveActivities.has(processedData[0]?.activity)}
              />
              {isComparisonEnabled && (
                <Bar
                  dataKey="comparison"
                  fill={colors.comparison[0]}
                  hide={inactiveActivities.has(processedData[0]?.activity)}
                />
              )}
            </BarChart>
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