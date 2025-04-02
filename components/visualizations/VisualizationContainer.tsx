import React from 'react';
import { ActivityRecord, ChartConfig, ChartId, FilterSettings } from '@/types';
import { useColorStore } from '@/stores/useColorStore';
import { useTranslation } from '@/hooks/useTranslation';
import { TranslationPath } from '@/config/translations/translations';
import { TimelineVisualization } from './timeline';
import { ActivityHeatmap } from './activity-heatmap';
import { ActivityDistribution } from './activity-distribution';
import { EmployeeActivity } from './employee-activity';
import { PeakActivityTimes } from './peak-activity';
import { RegionHeatmap } from './region-heatmap';

interface VisualizationContainerProps {
  data: ActivityRecord[];
  filterSettings: FilterSettings;
  chartId: ChartId;
}

const VisualizationContainer: React.FC<VisualizationContainerProps> = ({
  data,
  filterSettings,
  chartId,
}) => {
  const { t } = useTranslation();
  const globalScheme = useColorStore(state => state.globalScheme);

  const chartConfigs: Record<ChartId, ChartConfig> = {
    'activity-timeline': {
      id: 'activity-timeline',
      title: t('dashboard.activityTimeline' as TranslationPath),
      component: TimelineVisualization,
      fullWidth: true,
      defaultVisible: true
    },
    'activity-heatmap': {
      id: 'activity-heatmap',
      title: t('dashboard.regionHeatmap' as TranslationPath),
      component: ActivityHeatmap,
      fullWidth: true,
      defaultVisible: true
    },
    'activity-distribution': {
      id: 'activity-distribution',
      title: t('dashboard.activityDistribution' as TranslationPath),
      component: ActivityDistribution,
      defaultVisible: true
    },
    'employee-activity': {
      id: 'employee-activity',
      title: t('dashboard.employeeActivity' as TranslationPath),
      component: EmployeeActivity,
      defaultVisible: true
    },
    'peak-activity': {
      id: 'peak-activity',
      title: t('dashboard.peakActivityTimes' as TranslationPath),
      component: PeakActivityTimes,
      defaultVisible: true
    },
    'region-heatmap': {
      id: 'region-heatmap',
      title: t('dashboard.regionHeatmap' as TranslationPath),
      component: RegionHeatmap,
      defaultVisible: true
    }
  };

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

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${config.fullWidth ? 'col-span-2' : ''}`}>
      <h2 className="text-xl font-semibold mb-4">{t(config.title as TranslationPath)}</h2>
      <ChartComponent {...props} key={`${chartId}-${globalScheme}`} />
    </div>
  );
};

export default VisualizationContainer; 