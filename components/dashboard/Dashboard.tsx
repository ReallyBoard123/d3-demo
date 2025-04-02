"use client"

import React, { useState } from 'react';
import { ActivityRecord, ChartId } from '@/types';
import SettingsSidebar from './SettingsSidebar';
import VisualizationContainer from '../visualizations/VisualizationContainer';
import { useDashboardData } from '@/hooks/useDashboardData';
import { LoadingSpinner } from './LoadingSpinner';

interface DashboardProps {
  data: ActivityRecord[];
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const { filterSettings, setFilterSettings, loadingProgress, metadata, dateMetrics, chartConfigs } = useDashboardData(data);
  const [selectedChart, setSelectedChart] = useState<ChartId>('activity-timeline');

  if (loadingProgress < 100) {
    return <LoadingSpinner progress={loadingProgress} />;
  }

  return (
    <div className="flex h-screen">
      <div className="flex-1 p-4 overflow-auto">
        <VisualizationContainer
          data={data}
          filterSettings={filterSettings}
          chartId={selectedChart}
        />
      </div>
      <SettingsSidebar
        metadata={metadata}
        dateMetrics={dateMetrics}
        filterSettings={filterSettings}
        onFilterChange={setFilterSettings}
        availableCharts={chartConfigs}
        onChartSelect={setSelectedChart}
      />
    </div>
  );
};

export default Dashboard;