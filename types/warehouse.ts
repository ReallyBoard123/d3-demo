export interface ActivityRecord {
  date: string;
  id: string;
  startTime: number;
  endTime: number;
  startTimeFormatted: string;
  endTimeFormatted: string;
  region: string;
  activity: string;
  duration: number;
}

export interface DateRange {
  start: string;
  end: string;
}

export interface Metadata {
  totalRecords: number;
  dateRange: DateRange;
  uniqueEmployees: number;
  uniqueRegions: number;
  uniqueActivities: string[];
}

export interface WarehouseData {
  metadata: Metadata;
  records: ActivityRecord[];
}

export interface FilterSettings {
  hiddenActivities: Set<string>;
  selectedDates: Set<string>;
  comparisonDates: Set<string>;
  selectedEmployees: Set<string>;
  selectedRegions: Set<string>;
  isComparisonEnabled: boolean;
}
  
  export type DashboardConfig = {
    defaultHiddenActivities: string[];
    availableViews: string[];
    chartColors: Record<string, string>;
  };

  export interface ActivityDistributionProps {
    data: ActivityRecord[];
    hiddenActivities: Set<string>;
    comparisonData?: ActivityRecord[];
    dateLabels?: string[];
  }
  