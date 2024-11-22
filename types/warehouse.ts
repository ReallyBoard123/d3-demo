

export interface RegionDefinition {
  name: string;
  position_top_left_x: number;
  position_top_left_y: number;
  position_bottom_right_x: number;
  position_bottom_right_y: number;
  region_label_uuid: string;
}

export interface RegionLabel {
  uuid: string;
  name: string;
  color: string;
}

export interface LayoutMetadata {
  regions: RegionDefinition[];
  region_labels: RegionLabel[];
  width_pixel: number;
  height_pixel: number;
}

export interface HumanActivity {
  activity_name: string;
  duration_minutes: number;
}

export interface ProcessMetadata {
  layout: LayoutMetadata;
  human_activities: HumanActivity[];
  timestamp: string;
  version: string;
}