import React from 'react';
import { ActivityDistribution } from '@/components/visualizations/ActivityDistribution';
import { EmployeeActivity } from '@/components/visualizations/EmployeeActivity';
import { PeakActivityTimes } from '@/components/visualizations/PeakActivityTimes';
import { RegionHeatmap } from '@/components/visualizations/RegionHeatmap';
import { DashboardOverview } from '@/components/DashboardOverview';
import SettingsSidebar from '@/components/SettingsSidebar';
import VisualizationWrapper from '@/components/common/VisualizationWrapper';
import type { ActivityRecord, BaseActivityProps, ChartId } from '@/types/activity';
import type { FilterSettings, Metadata } from '@/types/warehouse';
import { useColorStore } from '@/stores/useColorStore';

const DEFAULT_HIDDEN_ACTIVITIES = new Set(['Sit', 'Unknown']);

interface DashboardProps {
  data: ActivityRecord[];
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
] as const;

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const globalScheme = useColorStore(state => state.globalScheme);

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

  const [filterSettings, setFilterSettings] = React.useState<FilterSettings>(() => ({
    hiddenActivities: DEFAULT_HIDDEN_ACTIVITIES,
    selectedDates: new Set(data.map(record => record.date)),
    comparisonDates: new Set<string>(),
    selectedEmployees: new Set<string>(),
    selectedRegions: new Set<string>(),
    isComparisonEnabled: false,
  }));

  const filteredData = React.useMemo(() => 
    data.filter(record => !filterSettings.hiddenActivities.has(record.activity)),
    [data, filterSettings.hiddenActivities]
  );

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