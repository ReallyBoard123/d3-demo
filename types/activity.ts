import { ActivityRecord, ChartId } from './core';

export interface BaseActivityProps {
  data: ActivityRecord[];
  hiddenActivities: Set<string>;
  selectedDates: Set<string>;
  comparisonDates: Set<string>;
  isComparisonEnabled: boolean;
  chartId: ChartId;
}

export interface FilterSettings {
  hiddenActivities: Set<string>;
  selectedDates: Set<string>;
  comparisonDates: Set<string>;
  selectedEmployees: Set<string>;
  selectedRegions: Set<string>;
  isComparisonEnabled: boolean;
  visibleCharts: Set<ChartId>;
}