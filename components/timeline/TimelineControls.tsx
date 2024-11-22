import React from 'react';
import { Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { format } from "date-fns";
import { TIMELINE_CONSTANTS } from '@/types/timeline';

interface TimeRange {
  start: number;
  end: number;
}

interface TimelineControlsProps {
  isPlaying: boolean;
  speed: number;
  currentTime: number;
  selectedDate: string;
  timeRange: TimeRange;
  onPlayPause: () => void;
  onSpeedChange: (speed: number) => void;
  onTimeChange: (time: number) => void;
}

export const TimelineControls: React.FC<TimelineControlsProps> = ({
  isPlaying,
  speed,
  currentTime,
  selectedDate,
  timeRange,
  onPlayPause,
  onSpeedChange,
  onTimeChange,
}) => {
  const formatTime = (seconds: number) => {
    return format(new Date(`${selectedDate}T00:00:00`).setSeconds(seconds), "HH:mm:ss");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={onPlayPause}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>

        <div className="flex items-center gap-2">
          {TIMELINE_CONSTANTS.PLAYBACK_SPEEDS.map(s => (
            <Button
              key={s}
              variant={speed === s ? "default" : "outline"}
              size="sm"
              onClick={() => onSpeedChange(s)}
            >
              {s}x
            </Button>
          ))}
        </div>

        <div className="text-sm font-medium">
          {formatTime(currentTime)}
        </div>
      </div>

      <div className="space-y-2">
        <Slider
          value={[currentTime]}
          min={timeRange.start}
          max={timeRange.end}
          step={1}
          onValueChange={([value]) => onTimeChange(value)}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatTime(timeRange.start)}</span>
          <span>{formatTime(timeRange.end)}</span>
        </div>
      </div>
    </div>
  );
};

export default TimelineControls;