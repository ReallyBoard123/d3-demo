import React from 'react';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { formatDuration } from '@/lib/utils';

interface RegionStats {
  duration: number;
  count: number;
  percentage: number;
  activity: string;
  region: string;
}

interface RegionDimensions {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface TooltipRegion {
  dimensions: RegionDimensions;
  stats: RegionStats;
}

export const HeatmapTooltipOverlay: React.FC<{
  regions: Map<string, TooltipRegion>;
  containerRef: React.RefObject<HTMLDivElement>;
}> = ({ regions, containerRef }) => {
  const [scale, setScale] = React.useState(1);

  // Update scale when container size changes
  React.useEffect(() => {
    if (!containerRef.current) return;

    const updateScale = () => {
      const container = containerRef.current;
      if (!container) return;

      const { width: containerWidth } = container.getBoundingClientRect();
      const canvasWidth = container.querySelector('canvas')?.width || containerWidth;
      setScale(containerWidth / canvasWidth);
    };

    const resizeObserver = new ResizeObserver(updateScale);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    updateScale();
    return () => resizeObserver.disconnect();
  }, [containerRef]);

  return (
    <>
      {Array.from(regions.entries()).map(([regionName, { dimensions, stats }]) => (
        <TooltipProvider key={regionName}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="absolute cursor-pointer"
                style={{
                  left: dimensions.x * scale,
                  top: dimensions.y * scale,
                  width: dimensions.width * scale,
                  height: dimensions.height * scale,
                  background: 'transparent',
                }}
              />
            </TooltipTrigger>
            <TooltipContent>
              <div className="p-2 space-y-2">
                <div className="flex justify-between items-center gap-4">
                  <span className="font-medium text-sm">{stats.activity}</span>
                  <span className="text-xs text-muted-foreground">{stats.region}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm gap-4">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">{formatDuration(stats.duration)}</span>
                  </div>
                  <div className="flex justify-between text-sm gap-4">
                    <span className="text-muted-foreground">Instances:</span>
                    <span className="font-medium">{stats.count}</span>
                  </div>
                  <div className="flex justify-between text-sm gap-4">
                    <span className="text-muted-foreground">% of Total:</span>
                    <span className="font-medium">{stats.percentage.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </>
  );
};