import React from 'react';
import { ActivityRecord, ChartId, ChartConfig, FilterSettings } from '@/types';
import { useColorStore } from '@/stores/useColorStore';
import { useTranslation } from '@/hooks/useTranslation';
import { TranslationPath } from '@/config/translations/translations';
import TimelineVisualization from '@/components/visualizations/TimelineVisualization';
import ActivityHeatmap from '@/components/visualizations/ActivityHeatmap';
import { ActivityDistribution } from '@/components/visualizations/ActivityDistribution';
import { EmployeeActivity } from '@/components/visualizations/EmployeeActivity';
import { PeakActivityTimes } from '@/components/visualizations/PeakActivityTimes';
import { RegionHeatmap } from '@/components/visualizations/RegionHeatmap';

const chartConfigs: Record<ChartId, ChartConfig> = {
  'activity-timeline': {
    id: 'activity-timeline',
    title: 'dashboard.activityTimeline' as TranslationPath,
    component: TimelineVisualization,
    fullWidth: true,
    defaultVisible: true
  },
  'activity-heatmap': {
    id: 'activity-heatmap',
    title: 'dashboard.regionHeatmap' as TranslationPath,
    component: ActivityHeatmap,
    fullWidth: true,
    defaultVisible: true
  },
  'activity-distribution': {
    id: 'activity-distribution',
    title: 'dashboard.activityDistribution' as TranslationPath,
    component: ActivityDistribution,
    defaultVisible: true
  },
  'employee-activity': {
    id: 'employee-activity',
    title: 'dashboard.employeeActivity' as TranslationPath,
    component: EmployeeActivity,
    defaultVisible: true
  },
  'peak-activity': {
    id: 'peak-activity',
    title: 'dashboard.peakActivityTimes' as TranslationPath,
    component: PeakActivityTimes,
    defaultVisible: true
  },
  'region-heatmap': {
    id: 'region-heatmap',
    title: 'dashboard.regionHeatmap' as TranslationPath,
    component: RegionHeatmap,
    defaultVisible: true
  }
};

interface UseVisualizationContainerProps {
  data: ActivityRecord[];
  filterSettings: FilterSettings;
  chartId: ChartId;
}

export const useVisualizationContainer = ({ data, filterSettings, chartId }: UseVisualizationContainerProps) => {
  const { t } = useTranslation();
  const globalScheme = useColorStore(state => state.globalScheme);

  const config = chartConfigs[chartId];
  if (!config) return null;

  const ChartComponent = config.component;
  const props = {
    data,
    hiddenActivities: filterSettings.hiddenActivities,
    selectedDates: filterSettings.selectedDates,
    comparisonDates: filterSettings.comparisonDates,
    isComparisonEnabled: filterSettings.isComparisonEnabled,
    chartId,
  };

  return {
    config,
    ChartComponent,
    props,
    key: `${chartId}-${globalScheme}`,
    className: config.fullWidth ? 'col-span-2' : ''
  };
}; 