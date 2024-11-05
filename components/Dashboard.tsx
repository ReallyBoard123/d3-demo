'use client';

import React from 'react';
import { ActivityDistribution } from '@/components/visualizations/ActivityDistribution';
import { EmployeeActivity } from '@/components/visualizations/EmployeeActivity';
import { PeakActivityTimes } from '@/components/visualizations/PeakActivityTimes';
import { RegionHeatmap } from '@/components/visualizations/RegionHeatmap';
import SettingsSidebar from '@/components/SettingsSidebar';
import VisualizationWrapper from '@/components/common/VisualizationWrapper';
import { useColorStore } from '@/stores/useColorStore';
import type { ActivityRecord, BaseActivityProps, ChartId } from '@/types/activity';
import type { FilterSettings, Metadata } from '@/types/warehouse';

interface DashboardProps {
  data: ActivityRecord[];
  className?: string;
}

interface ChartConfig {
  id: ChartId;
  title: string;
  component: React.ComponentType<BaseActivityProps>;
}

const CHARTS: ChartConfig[] = [
  { id: 'activity-distribution', title: 'Activity Distribution', component: ActivityDistribution },
  { id: 'employee-activity', title: 'Employee Activity', component: EmployeeActivity },
  { id: 'peak-activity', title: 'Peak Activity Times', component: PeakActivityTimes },
  { id: 'region-heatmap', title: 'Region Heatmap', component: RegionHeatmap },
];

const Dashboard: React.FC<DashboardProps> = ({
  data,
  className,
}) => {
  // Subscribe to color scheme changes
  const globalScheme = useColorStore(state => state.globalScheme);

  // Calculate metadata
  const metadata = React.useMemo<Metadata>(() => {
    const uniqueActivities = Array.from(new Set(data.map(record => record.activity)));
    const dateRange = {
      start: data.reduce((min, record) => record.date < min ? record.date : min, data[0].date),
      end: data.reduce((max, record) => record.date > max ? record.date : max, data[0].date)
    };

    return {
      totalRecords: data.length,
      dateRange,
      uniqueEmployees: new Set(data.map(record => record.id)).size,
      uniqueRegions: new Set(data.map(record => record.region)).size,
      uniqueActivities,
    };
  }, [data]);

  // Initialize filter settings
  const [filterSettings, setFilterSettings] = React.useState<FilterSettings>(() => ({
    hiddenActivities: new Set<string>(),
    selectedDates: new Set(data.map(record => record.date)),
    comparisonDates: new Set<string>(),
    selectedEmployees: new Set<string>(),
    selectedRegions: new Set<string>(),
    isComparisonEnabled: false,
  }));

  // Create a key that changes when the color scheme changes
  const colorKey = React.useMemo(() => `color-${globalScheme}`, [globalScheme]);

  const chartProps: BaseActivityProps = {
    data,
    hiddenActivities: filterSettings.hiddenActivities,
    selectedDates: filterSettings.selectedDates,
    comparisonDates: filterSettings.comparisonDates,
    isComparisonEnabled: filterSettings.isComparisonEnabled,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Activity Dashboard</h1>
        <SettingsSidebar 
          metadata={metadata}
          filterSettings={filterSettings}
          onFilterChange={setFilterSettings}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {CHARTS.map(({ id, title, component: ChartComponent }) => (
          <VisualizationWrapper key={`${id}-${colorKey}`} title={title}>
            <ChartComponent {...chartProps} />
          </VisualizationWrapper>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;