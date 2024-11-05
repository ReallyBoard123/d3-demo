export interface ActivityRecord {
  id: string;
  date: string;
  startTime: number;
  endTime: number;
  startTimeFormatted: string;
  endTimeFormatted: string;
  region: string;
  activity: string;
  duration: number;
}

export interface BaseActivityProps {
  data: ActivityRecord[];
  hiddenActivities: Set<string>;
  selectedDates: Set<string>;
  comparisonDates: Set<string>;
  isComparisonEnabled: boolean;
  chartId: ChartId;
}

export type ChartId = 
  | 'activity-distribution'
  | 'employee-activity'
  | 'peak-activity'
  | 'region-heatmap';
