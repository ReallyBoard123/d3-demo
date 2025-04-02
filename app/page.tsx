'use client';

import React from 'react';
import { Dashboard } from '@/components/dashboard';
import { FileUploader } from '@/components/shared';
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