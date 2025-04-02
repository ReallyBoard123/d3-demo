import { BaseActivityProps, FilterSettings } from './activity';
import { ActivityRecord, ChartId } from './core';
import { Metadata } from './metadata';

export interface ChartConfig {
  id: ChartId;
  title: string;
  component: React.ComponentType<BaseActivityProps>;
  fullWidth?: boolean;
  defaultVisible: boolean;
}

export interface VisualizationConfig {
  showLegend?: boolean;
  showControls?: boolean;
  height?: number;
  animate?: boolean;
}

export interface BaseVisualizationProps extends BaseActivityProps {
  config?: VisualizationConfig;
}

export interface DashboardProps {
  data: ActivityRecord[];
}

export interface DashboardOverviewProps {
  metadata: Metadata;
  selectedDates: Set<string>;
  comparisonDates: Set<string>;
  isComparisonEnabled: boolean;
  data: ActivityRecord[];
}

export interface DateMetrics {
  employeeCount: number;
  totalDuration: number;
  missingEmployees: string[];
}

export interface SettingsSidebarProps {
  metadata: Metadata & {
    expectedEmployeeCount: number;
  };
  dateMetrics: Record<string, DateMetrics>;
  filterSettings: FilterSettings;
  onFilterChange: (settings: FilterSettings) => void;
  availableCharts: readonly ChartConfig[];
  onChartSelect: (chartId: ChartId) => void;
}