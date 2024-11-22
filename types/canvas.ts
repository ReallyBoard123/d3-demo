export interface CanvasSize {
  width: number;
  height: number;
}

export interface CanvasRegionData {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  name: string;
}

export interface CanvasState {
  isLoading: boolean;
  error: string | null;
  hoveredRegion: string | null;
}

export interface CanvasInteractionConfig {
  enableHover?: boolean;
  enableClick?: boolean;
  enableZoom?: boolean;
  enablePan?: boolean;
}

export interface EmployeeIndicator {
  x: number;
  y: number;
  radius: number;
  id: string;
  color: string;
}