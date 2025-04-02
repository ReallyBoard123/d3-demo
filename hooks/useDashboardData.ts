import React from 'react';
import { ActivityRecord, FilterSettings, ChartId } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';
import { createChartConfigs, processBasicMetadata, processDateMetrics, createMetadata, filterData } from '@/lib/services/dataProcessing';
import { TranslationPath } from '@/config/translations/translations';

const DEFAULT_HIDDEN_ACTIVITIES = new Set(['Sit', 'Unknown']);

export const useDashboardData = (data: ActivityRecord[]) => {
  const { t } = useTranslation();
  const [loadingProgress, setLoadingProgress] = React.useState<number>(0);
  
  const chartConfigs = React.useMemo(() => createChartConfigs((key: TranslationPath) => t(key)), [t]);
  
  const basicMetadata = React.useMemo(() => processBasicMetadata(data), [data]);

  const dateMetrics = React.useMemo(() => {
    const allEmployees = new Set(data.map(record => record.id));
    return processDateMetrics(data, basicMetadata.dates, allEmployees);
  }, [data, basicMetadata.dates]);

  const metadata = React.useMemo(() => createMetadata(data, basicMetadata), [data, basicMetadata]);

  const [filterSettings, setFilterSettings] = React.useState<FilterSettings>(() => ({
    hiddenActivities: DEFAULT_HIDDEN_ACTIVITIES,
    selectedDates: new Set(
      Object.entries(dateMetrics)
        .filter(([, metrics]) => metrics.totalDuration > 0)
        .map(([date]) => date)
    ),
    comparisonDates: new Set<string>(),
    selectedEmployees: new Set<string>(),
    selectedRegions: new Set<string>(),
    isComparisonEnabled: false,
    visibleCharts: new Set<ChartId>(
      chartConfigs.filter(chart => chart.defaultVisible).map(chart => chart.id)
    )
  }));

  const filteredData = React.useMemo(() => filterData(data, filterSettings.hiddenActivities), [data, filterSettings.hiddenActivities]);

  React.useEffect(() => {
    const loadStages = [
      { progress: 25, delay: 100 },
      { progress: 50, delay: 200 },
      { progress: 75, delay: 300 },
      { progress: 100, delay: 400 },
    ] as const;
  
    let mounted = true;
  
    const runLoadingSequence = async () => {
      for (const stage of loadStages) {
        if (!mounted) break;
        setLoadingProgress(stage.progress);
        await new Promise(resolve => setTimeout(resolve, stage.delay));
      }
    };
  
    runLoadingSequence();
    return () => { mounted = false; };
  }, []);

  return {
    loadingProgress,
    chartConfigs,
    metadata,
    dateMetrics,
    filterSettings,
    setFilterSettings,
    filteredData
  };
}; 