import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ActivityTooltip } from '@/components/common/ActivityTooltip';
import { ChartLegend, type LegendItem } from '@/components/common/ChartLegend';
import { formatDateRange } from '@/lib/utils';
import { useColorStore } from '@/stores/useColorStore';
import { useTranslation } from '@/hooks/useTranslation';
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
  isComparisonEnabled,
  chartId
}) => {
  const { t } = useTranslation();
  const getChartColors = useColorStore(state => state.getChartColors);
  const colors = getChartColors(chartId);

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

    data.forEach(record => {
      if (hiddenActivities.has(record.activity) || !selectedDates.has(record.date)) return;

      const startHour = Math.floor(record.startTime / 3600) % 24;
      const duration = record.duration / 3600;
      hours[startHour].selected += duration;
    });

    if (isComparisonEnabled) {
      data.forEach(record => {
        if (hiddenActivities.has(record.activity) || !comparisonDates.has(record.date)) return;

        const startHour = Math.floor(record.startTime / 3600) % 24;
        const duration = record.duration / 3600;
        hours[startHour].comparison! += duration;
      });
    }

    return hours.map(h => ({
      ...h,
      selected: Number(h.selected.toFixed(2)),
      ...(isComparisonEnabled ? { comparison: Number(h.comparison!.toFixed(2)) } : {})
    }));
  }, [data, hiddenActivities, selectedDates, comparisonDates, isComparisonEnabled]);

  const legendItems: LegendItem[] = React.useMemo(() => [
    {
      label: t('activityTooltip.selected'),
      color: colors.primary[0],
      value: `${hourlyData.reduce((sum, h) => sum + h.selected, 0).toFixed(1)}${t('dashboard.hoursAbbreviation')} ${t('activityTooltip.total')}`,
      ...(isComparisonEnabled ? {
        comparison: {
          color: colors.comparison[0],
          value: `${hourlyData.reduce((sum, h) => sum + (h.comparison || 0), 0).toFixed(1)}${t('dashboard.hoursAbbreviation')} ${t('activityTooltip.total')}`
        }
      } : {})
    }
  ], [hourlyData, colors, isComparisonEnabled, t]);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{t('dashboard.peakActivityTimes')}</CardTitle>
          <div className="text-sm font-normal text-gray-500">
            <div>{dateDisplay.selected}</div>
            {isComparisonEnabled && dateDisplay.comparison && (
              <div>{t('common.comparison.vs')} {dateDisplay.comparison}</div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={hourlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="hour" />
              <YAxis 
                label={{ value: t('charts.activityDistribution.hoursLabel'), angle: -90, position: 'insideLeft' }}
                tickFormatter={(value) => `${value}${t('dashboard.hoursAbbreviation').trim()}`}
                width={100}  // Control width
                style={{ whiteSpace: 'pre' }} // Preserve whitespace
              />
              <Tooltip
              content={
                <ActivityTooltip
                dateDisplay={dateDisplay}
                isComparisonEnabled={isComparisonEnabled}
                valueFormatter={(value) => `${value.toFixed(2)}${t('dashboard.hoursAbbreviation')}`}
                labelKey="hour"
                />
              }
              />
              <Line 
              type="monotone" 
              dataKey="selected"
              stroke={colors.primary[0]}
              strokeWidth={2}
              dot={false}
              />
              {isComparisonEnabled && (
              <Line 
                type="monotone" 
                dataKey="comparison"
                stroke={colors.comparison[0]}
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