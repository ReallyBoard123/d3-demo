"use client"

import React from 'react';
import FileUploader from './FileUploader';
import SettingsSidebar from './SettingsSidebar';
import ActivityDistribution from './visualizations/ActivityDistribution';
import PeakActivityTimes from './visualizations/PeakActivityTimes';
import RegionHeatmap from './visualizations/RegionHeatmap';
import type { WarehouseData, FilterSettings } from '@/types/warehouse';
import EmployeeActivity from './visualizations/EmployeeActivity';

const DEFAULT_HIDDEN_ACTIVITIES = ['Sit', 'Unknown'];

const Dashboard: React.FC = () => {
  const [data, setData] = React.useState<WarehouseData | null>(null);
  const [filterSettings, setFilterSettings] = React.useState<FilterSettings>({
    hiddenActivities: new Set(DEFAULT_HIDDEN_ACTIVITIES),
    selectedDateRange: null,
    selectedEmployees: new Set(),
    selectedRegions: new Set(),
  });

  // Apply filters to data
  const filteredData = React.useMemo(() => {
    if (!data) return null;

    return {
      ...data,
      records: data.records.filter(record => {
        // Filter by date range if selected
        if (filterSettings.selectedDateRange) {
          const recordDate = new Date(record.date);
          const startDate = new Date(filterSettings.selectedDateRange.start);
          const endDate = new Date(filterSettings.selectedDateRange.end);
          if (recordDate < startDate || recordDate > endDate) return false;
        }

        // Filter by selected employees if any
        if (filterSettings.selectedEmployees.size > 0 && 
            !filterSettings.selectedEmployees.has(record.id)) {
          return false;
        }

        // Filter by selected regions if any
        if (filterSettings.selectedRegions.size > 0 && 
            !filterSettings.selectedRegions.has(record.region)) {
          return false;
        }

        return true;
      })
    };
  }, [data, filterSettings]);

  if (!data) {
    return <FileUploader onDataLoaded={setData} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Warehouse Activity Dashboard</h1>
          <SettingsSidebar
            metadata={data.metadata}
            filterSettings={filterSettings}
            onFilterChange={setFilterSettings}
          />
        </div>
      </header>

      {/* Main content area */}
      <main className="container mx-auto px-4 py-8">
        {/* Filters Section */}
        <div className="mb-8">
          {/* We'll add DateRangePicker, EmployeeFilter, and RegionFilter here */}
        </div>

        {/* Bento Box Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredData && (
            <>
              {/* First Row - Larger Components */}
              <div className="lg:col-span-2">
                <ActivityDistribution 
                  data={filteredData.records}
                  hiddenActivities={filterSettings.hiddenActivities}
                />
              </div>
              <div>
                <PeakActivityTimes 
                  data={filteredData.records}
                  hiddenActivities={filterSettings.hiddenActivities}
                />
              </div>

              {/* Second Row */}
              <div className="lg:col-span-3">
                <RegionHeatmap 
                  data={filteredData.records}
                  hiddenActivities={filterSettings.hiddenActivities}
                />
              </div>

                {/* Third Row */}
                <div className="lg:col-span-3">
                <EmployeeActivity 
                  data={filteredData.records}
                  hiddenActivities={filterSettings.hiddenActivities}
                />
                </div>

              {/* We'll add more visualization components here */}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;