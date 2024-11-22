import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
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
  color?: string;
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

  const { processedData, activities } = React.useMemo(() => {
    const activitySet = new Set<string>();
    const summary: Record<string, { selected: number; comparison?: number }> = {};
    
    // Process selected dates data
    data.forEach(record => {
      if (!hiddenActivities.has(record.activity) && selectedDates.has(record.date)) {
        if (!summary[record.activity]) {
          summary[record.activity] = { selected: 0 };
        }
        summary[record.activity].selected += record.duration / 3600;
        activitySet.add(record.activity);
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
          activitySet.add(record.activity);
        }
      });
    }

    const sortedActivities = Array.from(activitySet).sort((a, b) => {
      return (summary[b]?.selected || 0) - (summary[a]?.selected || 0);
    });

    const processedData = sortedActivities.map((activity, index) => ({
      activity,
      selected: Number(summary[activity].selected.toFixed(2)),
      color: colors.primary[index % colors.primary.length],
      ...(isComparisonEnabled ? { 
        comparison: Number(summary[activity].comparison?.toFixed(2) ?? 0) 
      } : {})
    }));

    return {
      processedData,
      activities: sortedActivities
    };
  }, [data, hiddenActivities, selectedDates, comparisonDates, isComparisonEnabled, colors]);

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
    activities.map((activity, index) => ({
      label: activity,
      color: colors.primary[index % colors.primary.length],
      value: `${processedData[index].selected.toFixed(1)}h`,
      inactive: inactiveActivities.has(activity),
      onClick: () => toggleActivity(activity),
      ...(isComparisonEnabled && processedData[index].comparison !== undefined ? {
        comparison: {
          value: `${processedData[index].comparison.toFixed(1)}h`,
          color: colors.comparison[index % colors.comparison.length]
        }
      } : {})
    })), [activities, processedData, colors, inactiveActivities, isComparisonEnabled]);

  const getBarColor = (entry: ProcessedData) => {
    if (inactiveActivities.has(entry.activity)) {
      return 'transparent';
    }
    const index = activities.indexOf(entry.activity);
    return colors.primary[index % colors.primary.length];
  };

  const getComparisonBarColor = (entry: ProcessedData) => {
    if (inactiveActivities.has(entry.activity)) {
      return 'transparent';
    }
    const index = activities.indexOf(entry.activity);
    return colors.comparison[index % colors.comparison.length];
  };

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
                fill="transparent"
                fillOpacity={1}
                stroke="none"
              >
                {processedData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getBarColor(entry)}
                  />
                ))}
              </Bar>
              {isComparisonEnabled && (
                <Bar 
                  dataKey="comparison"
                  fill="transparent"
                  fillOpacity={1}
                  stroke="none"
                >
                  {processedData.map((entry, index) => (
                    <Cell
                      key={`cell-comparison-${index}`}
                      fill={getComparisonBarColor(entry)}
                    />
                  ))}
                </Bar>
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