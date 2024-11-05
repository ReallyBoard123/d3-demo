import { ActivityRecord } from './warehouse';

export interface BaseVisualizationProps {
  data: ActivityRecord[];
  hiddenActivities: Set<string>;
  selectedDates: Set<string>;
  comparisonDates: Set<string>;
  isComparisonEnabled: boolean;
}

export interface ActivityDistributionProps extends BaseVisualizationProps {}
export interface PeakActivityTimesProps extends BaseVisualizationProps {}
export interface RegionHeatmapProps extends BaseVisualizationProps {}
export interface EmployeeActivityProps extends BaseVisualizationProps {}