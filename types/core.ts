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

export type ChartId = 
  | 'activity-distribution'
  | 'employee-activity'
  | 'peak-activity'
  | 'region-heatmap'
  | 'activity-timeline'
  | 'activity-heatmap';

export type ChartSpeed = number;