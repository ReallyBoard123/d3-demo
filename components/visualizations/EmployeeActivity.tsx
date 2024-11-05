import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ActivityTooltip } from '@/components/common/ActivityTooltip';
import { ChartLegend, type LegendItem } from '@/components/common/ChartLegend';
import { formatDateRange } from '@/lib/utils';
import { useColorStore } from '@/stores/useColorStore';
import type { BaseActivityProps } from '@/types/activity';

interface ActivityData {
  selected: number;
  comparison?: number;
}

interface EmployeeData {
  employee: string;
  [key: string]: string | number;
}

interface ProcessedData {
  employeeData: EmployeeData[];
  activities: string[];
}

export const EmployeeActivity: React.FC<BaseActivityProps> = ({
  data,
  hiddenActivities,
  selectedDates,
  comparisonDates,
  isComparisonEnabled
}) => {
  const [inactiveActivities, setInactiveActivities] = React.useState<Set<string>>(new Set());
  const getChartColors = useColorStore(state => state.getChartColors);
  const colors = getChartColors('employee-activity');

  const dateDisplay = React.useMemo(() => ({
    selected: formatDateRange(selectedDates),
    comparison: isComparisonEnabled ? formatDateRange(comparisonDates) : null
  }), [selectedDates, comparisonDates, isComparisonEnabled]);

  const { employeeData, activities } = React.useMemo<ProcessedData>(() => {
    const activitySet = new Set<string>();
    const summary: Record<string, Record<string, ActivityData>> = {};

    // Process selected dates data
    data.forEach(record => {
      if (hiddenActivities.has(record.activity)) return;
      if (!selectedDates.has(record.date)) return;

      if (!summary[record.id]) {
        summary[record.id] = {};
      }
      if (!summary[record.id][record.activity]) {
        summary[record.id][record.activity] = { selected: 0 };
      }
      summary[record.id][record.activity].selected += record.duration / 3600;
      activitySet.add(record.activity);
    });

    // Process comparison dates if enabled
    if (isComparisonEnabled) {
      data.forEach(record => {
        if (hiddenActivities.has(record.activity)) return;
        if (!comparisonDates.has(record.date)) return;

        if (!summary[record.id]) {
          summary[record.id] = {};
        }
        if (!summary[record.id][record.activity]) {
          summary[record.id][record.activity] = { selected: 0, comparison: 0 };
        }
        if (!summary[record.id][record.activity].comparison) {
          summary[record.id][record.activity].comparison = 0;
        }
        summary[record.id][record.activity].comparison! += record.duration / 3600;
      });
    }

    const chartData = Object.entries(summary).map(([employeeId, activities]) => {
      const result: EmployeeData = { employee: employeeId };
      Object.entries(activities).forEach(([activity, values]) => {
        result[`${activity}_selected`] = Number(values.selected.toFixed(2));
        if (isComparisonEnabled && values.comparison !== undefined) {
          result[`${activity}_comparison`] = Number(values.comparison.toFixed(2));
        }
      });
      return result;
    });

    return {
      employeeData: chartData,
      activities: Array.from(activitySet)
    };
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
    activities.map((activity, index) => ({
      label: activity,
      color: colors[index % colors.length],
      inactive: inactiveActivities.has(activity),
      onClick: () => toggleActivity(activity),
      ...(isComparisonEnabled ? {
        comparison: {
          color: `${colors[index % colors.length]}88`,
          value: ''
        }
      } : {})
    })), [activities, colors, inactiveActivities, isComparisonEnabled]);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Employee Activity</CardTitle>
          <div className="text-sm font-normal text-gray-500">
            <div>{dateDisplay.selected}</div>
            {isComparisonEnabled && dateDisplay.comparison && (
              <div>vs {dateDisplay.comparison}</div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={employeeData}
              layout="vertical"
              margin={{ left: 20 }}
            >
              <XAxis type="number" tickFormatter={(value) => `${value}h`} />
              <YAxis type="category" dataKey="employee" width={60} />
              <Tooltip
                content={
                  <ActivityTooltip
                    dateDisplay={dateDisplay}
                    isComparisonEnabled={isComparisonEnabled}
                    valueFormatter={(value) => `${value.toFixed(2)}h`}
                  />
                }
              />
              {activities.map((activity, index) => (
                <React.Fragment key={activity}>
                  <Bar
                    dataKey={`${activity}_selected`}
                    stackId="selected"
                    fill={colors[index % colors.length]}
                    hide={inactiveActivities.has(activity)}
                  />
                  {isComparisonEnabled && (
                    <Bar
                      dataKey={`${activity}_comparison`}
                      stackId="comparison"
                      fill={`${colors[index % colors.length]}88`}
                      hide={inactiveActivities.has(activity)}
                    />
                  )}
                </React.Fragment>
              ))}
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
