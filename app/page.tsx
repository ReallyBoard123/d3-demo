'use client';

import React from 'react';
import Dashboard from '@/components/Dashboard';
import FileUploader from '@/components/FileUploader';
import { WarehouseData } from '@/types';


export default function Home() {
  const [warehouseData, setWarehouseData] = React.useState<WarehouseData | null>(null);

  const handleDataLoaded = (data: WarehouseData) => {
    setWarehouseData(data);
  };

  if (!warehouseData) {
    return <FileUploader onDataLoaded={handleDataLoaded} />;
  }

  return (
    <Dashboard
      data={warehouseData.records}
    />
  );
}