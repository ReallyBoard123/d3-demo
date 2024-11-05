'use client';

import React from 'react';
import { ActivityDistribution } from '@/components/visualizations/ActivityDistribution';
import { EmployeeActivity } from '@/components/visualizations/EmployeeActivity';
import { PeakActivityTimes } from '@/components/visualizations/PeakActivityTimes';
import { RegionHeatmap } from '@/components/visualizations/RegionHeatmap';
import { DashboardOverview } from '@/components/DashboardOverview';
import SettingsSidebar from '@/components/SettingsSidebar';
import VisualizationWrapper from '@/components/common/VisualizationWrapper';
import { Progress } from "@/components/ui/progress";
import { useColorStore } from '@/stores/useColorStore';
import type { ActivityRecord } from '@/types/activity';
import type { FilterSettings } from '@/types/warehouse';

// Define ChartId type based on available charts
type ChartId = 'activity-distribution' | 'employee-activity' | 'peak-activity' | 'region-heatmap';

// Extended props including chartId
interface BaseActivityProps {
  data: ActivityRecord[];
  hiddenActivities: Set<string>;
  selectedDates: Set<string>;
  comparisonDates: Set<string>;
  isComparisonEnabled: boolean;
  chartId: ChartId;
}

const DEFAULT_HIDDEN_ACTIVITIES = new Set(['Sit', 'Unknown']);

interface DashboardProps {
  data: ActivityRecord[];
}

interface ChartConfig {
  id: ChartId;
  title: string;
  component: React.ComponentType<BaseActivityProps>;
}

interface DateMetrics {
  employeeCount: number;
  totalDuration: number;
  missingEmployees: string[];
}

const CHARTS: ChartConfig[] = [
  { id: 'activity-distribution', title: 'Activity Distribution', component: ActivityDistribution },
  { id: 'employee-activity', title: 'Employee Activity', component: EmployeeActivity },
  { id: 'peak-activity', title: 'Peak Activity Times', component: PeakActivityTimes },
  { id: 'region-heatmap', title: 'Region Heatmap', component: RegionHeatmap },
] as const;

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const globalScheme = useColorStore(state => state.globalScheme);
  const [loadingProgress, setLoadingProgress] = React.useState(0);
  
  // Calculate basic sets - this is fast
  const basicMetadata = React.useMemo(() => {
    const uniqueEmployees = new Set<string>();
    const uniqueActivities = new Set<string>();
    const uniqueRegions = new Set<string>();
    const uniqueDates = new Set<string>();
    
    data.forEach(record => {
      uniqueEmployees.add(record.id);
      uniqueActivities.add(record.activity);
      uniqueRegions.add(record.region);
      uniqueDates.add(record.date);
    });

    return {
      employeeCount: uniqueEmployees.size,
      activities: Array.from(uniqueActivities),
      regions: Array.from(uniqueRegions),
      dates: Array.from(uniqueDates).sort(),
    };
  }, [data]);

  const dateMetrics = React.useMemo(() => {
    const metrics: Record<string, DateMetrics> = {};
    const allEmployees = new Set(data.map(record => record.id));
    
    // Pre-initialize all dates
    basicMetadata.dates.forEach(date => {
      metrics[date] = {
        employeeCount: 0,
        totalDuration: 0,
        missingEmployees: []
      };
    });
  
    // Create a map for faster lookups
    const dateEmployees = new Map<string, Set<string>>();
    
    data.forEach(record => {
      const dateKey = record.date;
      if (!dateEmployees.has(dateKey)) {
        dateEmployees.set(dateKey, new Set());
      }
      dateEmployees.get(dateKey)!.add(record.id);
      metrics[dateKey].totalDuration += record.duration;
    });
  
    // Calculate missing employees for each date
    dateEmployees.forEach((presentEmployees, date) => {
      metrics[date].employeeCount = presentEmployees.size;
      metrics[date].missingEmployees = Array.from(allEmployees)
        .filter(id => !presentEmployees.has(id));
    });
  
    return metrics;
  }, [data, basicMetadata.dates]);

  // Construct full metadata
  const metadata = React.useMemo(() => ({
    totalRecords: data.length,
    dateRange: {
      start: basicMetadata.dates[0],
      end: basicMetadata.dates[basicMetadata.dates.length - 1]
    },
    uniqueEmployees: basicMetadata.employeeCount,
    uniqueRegions: basicMetadata.regions.length,
    uniqueActivities: basicMetadata.activities,
    expectedEmployeeCount: basicMetadata.employeeCount
  }), [basicMetadata, data.length]);

  // Initialize filter settings
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
  }));

  const filteredData = React.useMemo(() => {
    const hiddenActivities = Array.from(filterSettings.hiddenActivities);
    return data.filter(record => !hiddenActivities.includes(record.activity));
  }, [data, filterSettings.hiddenActivities]);

  const createChartProps = React.useCallback((chartId: ChartId): BaseActivityProps => ({
    data: filteredData,
    hiddenActivities: filterSettings.hiddenActivities,
    selectedDates: filterSettings.selectedDates,
    comparisonDates: filterSettings.comparisonDates,
    isComparisonEnabled: filterSettings.isComparisonEnabled,
    chartId,
  }), [
    filteredData,
    filterSettings.hiddenActivities,
    filterSettings.selectedDates,
    filterSettings.comparisonDates,
    filterSettings.isComparisonEnabled,
  ]);

  // Loading effect
  React.useEffect(() => {
    const loadStages = [
      { progress: 25, delay: 100 },
      { progress: 50, delay: 200 },
      { progress: 75, delay: 300 },
      { progress: 100, delay: 400 },
    ];
  
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

  if (loadingProgress < 100) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm">
        <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg">
          <div className="flex flex-col space-y-2 text-center sm:text-left">
            <h2 className="text-lg font-semibold">Loading Dashboard</h2>
            <Progress value={loadingProgress} className="w-full" />
            <p className="text-sm text-muted-foreground">
              Preparing your analytics...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Activity Dashboard</h1>
        <SettingsSidebar 
          metadata={metadata}
          dateMetrics={dateMetrics}
          filterSettings={filterSettings}
          onFilterChange={setFilterSettings}
        />
      </div>

      <DashboardOverview
        metadata={metadata}
        selectedDates={filterSettings.selectedDates}
        comparisonDates={filterSettings.comparisonDates}
        isComparisonEnabled={filterSettings.isComparisonEnabled}
        data={filteredData}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {CHARTS.map(({ id, title, component: ChartComponent }) => (
          <VisualizationWrapper key={id} title={title}>
            <ChartComponent 
              {...createChartProps(id)} 
              key={`${id}-${globalScheme}`} 
            />
          </VisualizationWrapper>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;