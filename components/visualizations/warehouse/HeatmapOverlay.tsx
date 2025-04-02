import React from 'react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";
import type { ActivityRecord, RegionDefinition } from '@/types';

interface HeatmapData {
  region: string;
  totalDuration: number;
  normalizedIntensity: number;
}

interface HeatmapOverlayProps {
  activities: ActivityRecord[];
  regions: RegionDefinition[];
  ctx: CanvasRenderingContext2D;
  canvasWidth: number;
  canvasHeight: number;
}

const calculateHeatmapData = (
  activities: ActivityRecord[],
  regions: RegionDefinition[]
): HeatmapData[] => {
  // Calculate total duration for each region
  const regionDurations = activities.reduce((acc, activity) => {
    if (!acc[activity.region]) {
      acc[activity.region] = 0;
    }
    acc[activity.region] += activity.duration;
    return acc;
  }, {} as Record<string, number>);

  // Find max duration for normalization
  const maxDuration = Math.max(...Object.values(regionDurations));

  // Create heatmap data array with normalized intensities
  return regions.map(region => ({
    region: region.name,
    totalDuration: regionDurations[region.name] || 0,
    normalizedIntensity: maxDuration ? (regionDurations[region.name] || 0) / maxDuration : 0
  }));
};

const drawHeatmap = (
  ctx: CanvasRenderingContext2D,
  heatmapData: HeatmapData[],
  regions: RegionDefinition[],
  canvasWidth: number,
  canvasHeight: number
) => {
  // Clear any existing overlay
  ctx.globalCompositeOperation = 'source-over';

  heatmapData.forEach(data => {
    const region = regions.find(r => r.name === data.region);
    if (!region) return;

    // Calculate pixel coordinates
    const x = region.position_top_left_x * canvasWidth;
    const y = region.position_top_left_y * canvasHeight;
    const width = (region.position_bottom_right_x - region.position_top_left_x) * canvasWidth;
    const height = (region.position_bottom_right_y - region.position_top_left_y) * canvasHeight;

    // Create a gradient
    const gradient = ctx.createRadialGradient(
      x + width/2, y + height/2, 0,
      x + width/2, y + height/2, Math.max(width, height)/2
    );

    // Use red color with varying opacity based on intensity
    gradient.addColorStop(0, `rgba(255, 0, 0, ${data.normalizedIntensity * 0.7})`);
    gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');

    // Draw the heatmap overlay
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width, height);
  });

  // Reset composite operation
  ctx.globalCompositeOperation = 'source-over';
};

export const HeatmapControls: React.FC<{
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}> = ({ isEnabled, onToggle }) => {
  return (
    <Card className="p-3 absolute top-4 right-4 flex items-center gap-2">
      <Switch
        checked={isEnabled}
        onCheckedChange={onToggle}
        id="heatmap-toggle"
      />
      <Label htmlFor="heatmap-toggle" className="text-sm">
        Activity Heatmap
      </Label>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Info className="h-4 w-4 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Shows activity intensity based on duration.</p>
            <p>Darker red indicates longer activity duration.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </Card>
  );
};

export const useHeatmapOverlay = () => {
  const [isHeatmapEnabled, setIsHeatmapEnabled] = React.useState(false);

  const renderHeatmap = React.useCallback((props: HeatmapOverlayProps) => {
    if (!isHeatmapEnabled) return;

    const { activities, regions, ctx, canvasWidth, canvasHeight } = props;
    const heatmapData = calculateHeatmapData(activities, regions);
    drawHeatmap(ctx, heatmapData, regions, canvasWidth, canvasHeight);
  }, [isHeatmapEnabled]);

  return {
    isHeatmapEnabled,
    setIsHeatmapEnabled,
    renderHeatmap
  };
};