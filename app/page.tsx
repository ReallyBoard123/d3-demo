'use client';

import React from 'react';
import Dashboard from '@/components/Dashboard';
import FileUploader from '@/components/FileUploader';
import type { WarehouseData } from '@/types/warehouse';

export default function Home() {
  const [warehouseData, setWarehouseData] = React.useState<WarehouseData | null>(null);
  const [selectedDates, setSelectedDates] = React.useState<Set<string>>(new Set());
  const [comparisonDates, setComparisonDates] = React.useState<Set<string>>(new Set());
  const [hiddenActivities, setHiddenActivities] = React.useState<Set<string>>(new Set());
  const [isComparisonEnabled, setIsComparisonEnabled] = React.useState(false);

  const handleDataLoaded = (data: WarehouseData) => {
    setWarehouseData(data);
    // Initialize selectedDates with all available dates
    const dates = new Set(data.records.map(record => record.date));
    setSelectedDates(dates);
  };

  if (!warehouseData) {
    return <FileUploader onDataLoaded={handleDataLoaded} />;
  }

  return (
    <Dashboard
      data={warehouseData.records}
      selectedDates={selectedDates}
      comparisonDates={comparisonDates}
      hiddenActivities={hiddenActivities}
      isComparisonEnabled={isComparisonEnabled}
    />
  );
}
