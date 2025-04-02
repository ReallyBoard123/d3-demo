import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { formatDuration } from '@/lib/utils';

interface RegionStats {
  duration: number;
  count: number;
  percentage: number;
  activity: string;
  region: string;
  instanceCategories?: Array<{ range: string; count: number }>;
}

interface RegionDimensions {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface HeatmapTooltipOverlayProps {
  regions: Map<string, {
    dimensions: RegionDimensions;
    stats: RegionStats;
  }>;
  containerRef: React.RefObject<HTMLDivElement>;
  showInstances: boolean;
}

const InstanceTooltipContent: React.FC<{ 
  stats: RegionStats
}> = ({ stats }) => {
  const { t, translateActivity } = useTranslation();
  
  const categories = stats.instanceCategories || [];
  
  return (
    <div className="p-2 space-y-2">
      <div className="flex justify-between items-center gap-4">
        <span className="font-medium text-sm">{translateActivity(stats.activity)}</span>
        <span className="text-xs text-muted-foreground">{stats.region}</span>
      </div>
      <div className="space-y-1">
        {categories.map(({ range, count }) => (
          <div key={range} className="flex justify-between text-sm gap-4">
            <span className="text-muted-foreground">{range}:</span>
            <span className="font-medium">{count}</span>
          </div>
        ))}
        <div className="flex justify-between text-sm gap-4 pt-1 border-t">
          <span className="text-muted-foreground">{t('heatmapTooltip.totalInstances')}:</span>
          <span className="font-medium">{stats.count}</span>
        </div>
        <div className="flex justify-between text-sm gap-4">
          <span className="text-muted-foreground">{t('heatmapTooltip.percentageTotal')}:</span>
          <span className="font-medium">{stats.percentage.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
};

const DurationTooltipContent: React.FC<{ 
  stats: RegionStats 
}> = ({ stats }) => {
  const { t, translateActivity } = useTranslation();
  
  return (
    <div className="p-2 space-y-2">
      <div className="flex justify-between items-center gap-4">
        <span className="font-medium text-sm">{translateActivity(stats.activity)}</span>
        <span className="text-xs text-muted-foreground">{stats.region}</span>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-sm gap-4">
          <span className="text-muted-foreground">{t('heatmapTooltip.duration')}:</span>
          <span className="font-medium">{formatDuration(stats.duration)}</span>
        </div>
        <div className="flex justify-between text-sm gap-4">
          <span className="text-muted-foreground">{t('heatmapTooltip.percentageTotal')}:</span>
          <span className="font-medium">{stats.percentage.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
};

export const HeatmapTooltipOverlay: React.FC<HeatmapTooltipOverlayProps> = ({ 
  regions, 
  containerRef, 
  showInstances
}) => {
  const [scale, setScale] = React.useState(1);

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
              {showInstances ? (
                <InstanceTooltipContent stats={stats} />
              ) : (
                <DurationTooltipContent stats={stats} />
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </>
  );
};

export default HeatmapTooltipOverlay;