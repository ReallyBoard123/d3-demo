import { ActivityRecord } from './core';
import { ProcessMetadata } from './warehouse';

export interface Metadata {
  totalRecords: number;
  dateRange: {
    start: string;
    end: string;
  };
  uniqueEmployees: number;
  uniqueRegions: number;
  uniqueActivities: string[];
  expectedEmployeeCount: number;
}

export interface WarehouseData {
  metadata: Metadata;
  records: ActivityRecord[];
}

export interface WarehouseFiles {
  layout?: File;
  processMetadata?: ProcessMetadata;
  warehouseData?: WarehouseData;
}

export interface FileUploaderProps {
  onDataLoaded: (data: WarehouseData) => void;
}

export interface FileStatus {
  layout: boolean;
  processMetadata: boolean;
  warehouseData: boolean;
}

export interface FileUploaderProps {
  onDataLoaded: (data: WarehouseData) => void;
}

export interface FileStatus {
  layout: boolean;
  processMetadata: boolean;
  warehouseData: boolean;
}