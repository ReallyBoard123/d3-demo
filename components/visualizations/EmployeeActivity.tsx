import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { CardContent } from '@/components/ui/card';
import { ActivityTooltip } from '@/components/common/ActivityTooltip';
import { ChartLegend, type LegendItem } from '@/components/common/ChartLegend';
import { formatDateRange } from '@/lib/utils';
import { useColorStore } from '@/stores/useColorStore';
import { useTranslation } from '@/hooks/useTranslation';
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
  activityOrder: string[];
}

export const EmployeeActivity: React.FC<BaseActivityProps> = ({
  data,
  hiddenActivities,
  selectedDates,
  comparisonDates,
  isComparisonEnabled,
  chartId
}) => {
  const { t, translateActivity } = useTranslation();
  const [inactiveActivities, setInactiveActivities] = React.useState<Set<string>>(new Set());
  const getChartColors = useColorStore(state => state.getChartColors);
  const colors = getChartColors(chartId);

  const dateDisplay = React.useMemo(() => ({
    selected: formatDateRange(selectedDates),
    comparison: isComparisonEnabled ? formatDateRange(comparisonDates) : null
  }), [selectedDates, comparisonDates, isComparisonEnabled]);

  const { employeeData, activityOrder } = React.useMemo<ProcessedData>(() => {
    // Calculate total durations
    const activityTotals: Record<string, number> = {};
    data.forEach(record => {
      if (!hiddenActivities.has(record.activity) && selectedDates.has(record.date)) {
        if (!activityTotals[record.activity]) {
          activityTotals[record.activity] = 0;
        }
        activityTotals[record.activity] += record.duration / 3600;
      }
    });

    // Sort activities by total duration
    const sortedActivities = Object.entries(activityTotals)
      .sort(([, a], [, b]) => b - a)
      .map(([activity]) => activity);

    // Process employee data
    const summary: Record<string, Record<string, ActivityData>> = {};

    // Process selected dates
    data.forEach(record => {
      if (hiddenActivities.has(record.activity) || !selectedDates.has(record.date)) return;

      if (!summary[record.id]) {
        summary[record.id] = {};
      }
      if (!summary[record.id][record.activity]) {
        summary[record.id][record.activity] = { selected: 0 };
      }
      summary[record.id][record.activity].selected += record.duration / 3600;
    });

    // Process comparison dates
    if (isComparisonEnabled) {
      data.forEach(record => {
        if (hiddenActivities.has(record.activity) || !comparisonDates.has(record.date)) return;

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
      activityOrder: sortedActivities
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
    activityOrder.map((activity, index) => ({
      label: translateActivity(activity),
      color: colors.primary[index % colors.primary.length],
      inactive: inactiveActivities.has(activity),
      onClick: () => toggleActivity(activity),
      ...(isComparisonEnabled ? {
        comparison: {
          color: colors.comparison[index % colors.comparison.length],
          value: ''
        }
      } : {})
    })), [activityOrder, colors, inactiveActivities, isComparisonEnabled, translateActivity]);

  return (
    <>
        <div className="flex justify-between items-center">
          <div className="text-sm font-normal text-gray-500">
            <div>{dateDisplay.selected}</div>
            {isComparisonEnabled && dateDisplay.comparison && (
              <div>{t('common.comparison.vs')} {dateDisplay.comparison}</div>
            )}
          </div>
        </div>
      
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={employeeData}
              layout="vertical"
              margin={{ left: 20 }}
            >
              <XAxis type="number" tickFormatter={(value) => `${value}${t('dashboard.hoursAbbreviation')}`} />
              <YAxis type="category" dataKey="employee" width={60} />
              <Tooltip
                content={
                  <ActivityTooltip
                    dateDisplay={dateDisplay}
                    isComparisonEnabled={isComparisonEnabled}
                    valueFormatter={(value) => `${value.toFixed(2)}${t('dashboard.hoursAbbreviation')}`}
                  />
                }
              />
              {activityOrder.map((activity, index) => (
                <React.Fragment key={activity}>
                  <Bar
                    dataKey={`${activity}_selected`}
                    stackId="selected"
                    fill={colors.primary[index % colors.primary.length]}
                    hide={inactiveActivities.has(activity)}
                  />
                  {isComparisonEnabled && (
                    <Bar
                      dataKey={`${activity}_comparison`}
                      stackId="comparison"
                      fill={colors.comparison[index % colors.comparison.length]}
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
    </>
  );
};