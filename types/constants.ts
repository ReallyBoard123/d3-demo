export const VISUALIZATION_CONSTANTS = {
  MAX_EMPLOYEES_DISPLAY: 10,
  MIN_CHART_HEIGHT: 300,
  DEFAULT_CHART_HEIGHT: 400,
  ANIMATION_DURATION: 300,
  DEFAULT_CHART_MARGIN: { top: 20, right: 20, bottom: 30, left: 40 }
} as const;

export const CANVAS_CONSTANTS = {
  DEFAULT_WIDTH: 800,
  DEFAULT_HEIGHT: 600,
  MIN_ZOOM: 0.5,
  MAX_ZOOM: 4,
  EMPLOYEE_INDICATOR_RADIUS: 15
} as const;

export const EMPLOYEE_COLORS: Record<string, string> = {
  'A': '#E63946', // Bright Red
  'B': '#2A9D8F', // Teal
  'C': '#4361EE', // Royal Blue
  'D': '#FFB703', // Golden Yellow
  'E': '#9B5DE5', // Purple
  'F': '#00B4D8', // Cyan
  'G': '#FB8500', // Orange
  'H': '#2B9348', // Forest Green
  'I': '#F72585', // Pink
  'J': '#7209B7'  // Deep Purple
} as const;