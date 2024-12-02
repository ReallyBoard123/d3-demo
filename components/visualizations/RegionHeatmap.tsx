import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ChartLegend, type LegendItem } from '@/components/common/ChartLegend';
import { formatDateRange } from '@/lib/utils';
import { useColorStore } from '@/stores/useColorStore';
import { useTranslation } from '@/hooks/useTranslation';
import type { BaseActivityProps } from '@/types/activity';
import { ACTIVITY_CONFIG } from '@/config/activity';

interface RegionData {
  region: string;
  selectedHours: number;
  comparisonHours?: number;
  selectedIntensity: number;
  comparisonIntensity?: number;
}

interface RegionSummary {
  selected: number;
  comparison?: number;
}

export const RegionHeatmap: React.FC<BaseActivityProps> = ({
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
  const baseColor = colors.primary[0];

  const dateDisplay = React.useMemo(() => ({
    selected: formatDateRange(selectedDates),
    comparison: isComparisonEnabled ? formatDateRange(comparisonDates) : null
  }), [selectedDates, comparisonDates, isComparisonEnabled]);

  const regionData = React.useMemo(() => {
    const summary: Record<string, RegionSummary> = {};
    
    // Process selected dates data
    data.forEach(record => {
      if (hiddenActivities.has(record.activity)) return;
      if (!selectedDates.has(record.date)) return;
      
      if (!summary[record.region]) {
        summary[record.region] = { selected: 0 };
      }
      summary[record.region].selected += record.duration;
    });

    // Process comparison dates if enabled
    if (isComparisonEnabled) {
      data.forEach(record => {
        if (hiddenActivities.has(record.activity)) return;
        if (!comparisonDates.has(record.date)) return;
        
        if (!summary[record.region]) {
          summary[record.region] = { selected: 0, comparison: 0 };
        }
        if (!summary[record.region].comparison) {
          summary[record.region].comparison = 0;
        }
        summary[record.region].comparison! += record.duration;
      });
    }

    const maxDuration = ACTIVITY_CONFIG.MAX_HOURS_PER_DAY * 3600;

    return Object.entries(summary)
      .map(([region, values]): RegionData => ({
        region,
        selectedHours: values.selected / 3600,
        comparisonHours: values.comparison ? values.comparison / 3600 : undefined,
        selectedIntensity: Math.min(1, values.selected / maxDuration),
        comparisonIntensity: values.comparison 
          ? Math.min(1, values.comparison / maxDuration)
          : undefined
      }))
      .sort((a, b) => b.selectedHours - a.selectedHours)
      .slice(0, ACTIVITY_CONFIG.TOP_REGIONS_LIMIT);
  }, [data, hiddenActivities, selectedDates, comparisonDates, isComparisonEnabled]);

  const legendItems: LegendItem[] = React.useMemo(() => [
    {
      label: t('charts.heatmap.activityIntensity'),
      color: colors.primary[0],
      value: `0-${ACTIVITY_CONFIG.MAX_HOURS_PER_DAY}${t('dashboard.hoursAbbreviation')}`,
      ...(isComparisonEnabled ? {
        comparison: {
          color: colors.comparison[0],
          value: `0-${ACTIVITY_CONFIG.MAX_HOURS_PER_DAY}${t('dashboard.hoursAbbreviation')}`
        }
      } : {})
    }
  ], [colors, isComparisonEnabled, t]);

  const getColorIntensity = (intensity: number): string => {
    const hex = Math.floor(intensity * 255).toString(16).padStart(2, '0');
    return `${baseColor}${hex}`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{t('dashboard.regionHeatmap')}</CardTitle>
          <div className="text-sm font-normal text-gray-500">
            <div>{dateDisplay.selected}</div>
            {isComparisonEnabled && dateDisplay.comparison && (
              <div>{t('common.comparison.vs')} {dateDisplay.comparison}</div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto p-2">
          {regionData.map(({ region, selectedHours, comparisonHours, selectedIntensity }) => (
            <div 
              key={region} 
              className="relative"
            >
              {/* Border container */}
              <div className="absolute inset-0 rounded-lg border-2 border-slate-300" />
              
              {/* Background color container */}
              <div 
                className="absolute inset-0 rounded-lg"
                style={{
                  backgroundColor: getColorIntensity(selectedIntensity),
                  transition: 'background-color 0.2s ease-in-out',
                }}
              />
              
              {/* Content container */}
              <div className="relative p-4">
                <p 
                  className="text-sm font-medium truncate" 
                  style={{ color: selectedIntensity > 0.5 ? 'white' : 'black' }}
                  title={region}
                >
                  {region}
                </p>
                <p 
                  className="text-xs mt-1"
                  style={{ color: selectedIntensity > 0.5 ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.7)' }}
                >
                  {selectedHours.toFixed(1)}{t('dashboard.hoursAbbreviation')}
                  {isComparisonEnabled && comparisonHours !== undefined && (
                    <span className="ml-2">
                      {t('common.comparison.vs')} {comparisonHours.toFixed(1)}{t('dashboard.hoursAbbreviation')}
                    </span>
                  )}
                </p>
              </div>
            </div>
          ))}
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