export type {
  // core.ts
  ActivityRecord,
  ChartId,
  ChartSpeed,

} from './core';

export type {
  // activity.ts  
  BaseActivityProps,
  FilterSettings,
  
} from './activity';

export type {
  // visualization.ts
  VisualizationConfig,
  BaseVisualizationProps,
  ChartConfig,
  DashboardProps,
  DashboardOverviewProps,
  SettingsSidebarProps,
  DateMetrics,
} from './visualization';

export type {
  // timeline.ts
  TimelineState,
  TimelineControlsProps,
  TimelineConfig,
  TimelineSpeed,
} from './timeline';

export type {
  // metadata.ts
  Metadata,
  WarehouseData, 
  WarehouseFiles,
  FileUploaderProps,
  FileStatus,
} from './metadata';

export type {
  // warehouse.ts
  RegionDefinition,
  RegionLabel,
  LayoutMetadata,
  ProcessMetadata,
  HumanActivity,
} from './warehouse';

export type {
  // canvas.ts
  CanvasSize,
  CanvasRegionData, 
  CanvasState,
  CanvasInteractionConfig,
  EmployeeIndicator,
} from './canvas';

export {
  CANVAS_CONSTANTS,
  EMPLOYEE_COLORS,
  VISUALIZATION_CONSTANTS,
} from './constants';