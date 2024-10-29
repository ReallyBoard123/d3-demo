
export type ActivityRecord = {
    date: string;
    id: string;
    startTime: number;
    endTime: number;
    startTimeFormatted: string;
    endTimeFormatted: string;
    region: string;
    activity: string;
    duration: number;
  };
  
  export type DateRange = {
    start: string;
    end: string;
  };
  
  export type Metadata = {
    totalRecords: number;
    dateRange: DateRange;
    uniqueEmployees: number;
    uniqueRegions: number;
    uniqueActivities: string[];
  };
  
  export type WarehouseData = {
    metadata: Metadata;
    records: ActivityRecord[];
  };
  
  export type FilterSettings = {
    hiddenActivities: Set<string>;
    selectedDateRange: DateRange | null;
    selectedEmployees: Set<string>;
    selectedRegions: Set<string>;
  };
  
  export type DashboardConfig = {
    defaultHiddenActivities: string[];
    availableViews: string[];
    chartColors: Record<string, string>;
  };