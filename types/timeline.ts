export interface TimelineState {
  currentTime: number;
  isPlaying: boolean;
  speed: number;
  selectedDate: string;
  selectedEmployee: string | null;
}

export interface TimelineControlsProps {
  isPlaying: boolean;
  speed: number;
  currentTime: number;
  selectedDate: string;
  onPlayPause: () => void;
  onSpeedChange: (speed: number) => void;
  onTimeChange: (time: number) => void;
}

export const TIMELINE_CONSTANTS = {
  PLAYBACK_SPEEDS: [0.5, 1, 2, 5, 10] as const,
  SECONDS_PER_DAY: 86400,
  FRAME_INTERVAL: 1000 / 60,
  ALL_EMPLOYEES: 'all'
} as const;

export interface TimelineConfig {
  showControls?: boolean;
  showEmployeeSelector?: boolean;
  showDateSelector?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  defaultSpeed?: TimelineSpeed;
}

export type TimelineSpeed = typeof TIMELINE_CONSTANTS.PLAYBACK_SPEEDS[number];