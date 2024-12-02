import React from 'react';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { formatDuration } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import type { ActivityRecord } from '@/types';
import { TranslationPath } from '@/config/translations/translations';

interface RegionStats {
  duration: number;
  count: number;
  percentage: number;
  activity: string;
  region: string;
  instanceCategories?: Map<string, number>;
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

interface DurationCategory {
  range: string;
  count: number;
}

interface DurationTooltipContentProps {
  stats: RegionStats;
}

interface InstanceTooltipContentProps {
  stats: RegionStats;
  instanceCategories: DurationCategory[];
}

interface HeatmapTooltipOverlayProps {
  regions: Map<string, TooltipRegion>;
  containerRef: React.RefObject<HTMLDivElement>;
  showInstances: boolean;
  data: ActivityRecord[];
}

const calculateDurationCategories = (durations: number[], t: (key: TranslationPath) => string): DurationCategory[] => {
  if (durations.length === 0) return [];
  
  const sortedDurations = durations.sort((a, b) => a - b);
  const q1Index = Math.floor(durations.length / 4);
  const q2Index = Math.floor(durations.length / 2);
  const q3Index = Math.floor(3 * durations.length / 4);

  const boundaries = [
    5,
    sortedDurations[q1Index],
    sortedDurations[q2Index],
    sortedDurations[q3Index]
  ].sort((a, b) => a - b);

  const categories = new Map<string, number>();
  
  durations.forEach(duration => {
    if (duration <= boundaries[1]) {
      const range = `${boundaries[0]}-${boundaries[1].toFixed(0)}${t('heatmapTooltip.seconds')}`;
      categories.set(range, (categories.get(range) || 0) + 1);
    } else if (duration <= boundaries[2]) {
      const range = `${boundaries[1].toFixed(0)}-${boundaries[2].toFixed(0)}${t('heatmapTooltip.seconds')}`;
      categories.set(range, (categories.get(range) || 0) + 1);
    } else if (duration <= boundaries[3]) {
      const range = `${boundaries[2].toFixed(0)}-${boundaries[3].toFixed(0)}${t('heatmapTooltip.seconds')}`;
      categories.set(range, (categories.get(range) || 0) + 1);
    } else {
      const range = `${t('heatmapTooltip.greaterThan')}${boundaries[3].toFixed(0)}${t('heatmapTooltip.seconds')}`;
      categories.set(range, (categories.get(range) || 0) + 1);
    }
  });

  return Array.from(categories.entries())
    .map(([range, count]) => ({ range, count }))
    .sort((a, b) => {
      const aStart = parseInt(a.range.split('-')[0].replace(/[^0-9]/g, ''));
      const bStart = parseInt(b.range.split('-')[0].replace(/[^0-9]/g, ''));
      return aStart - bStart;
    });
};

const DurationTooltipContent: React.FC<DurationTooltipContentProps> = ({ stats }) => {
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

const InstanceTooltipContent: React.FC<InstanceTooltipContentProps> = ({ 
  stats, 
  instanceCategories 
}) => {
  const { t, translateActivity } = useTranslation();
  
  return (
    <div className="p-2 space-y-2">
      <div className="flex justify-between items-center gap-4">
        <span className="font-medium text-sm">{translateActivity(stats.activity)}</span>
        <span className="text-xs text-muted-foreground">{stats.region}</span>
      </div>
      <div className="space-y-1">
        {instanceCategories.map(({ range, count }) => (
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



export const HeatmapTooltipOverlay: React.FC<HeatmapTooltipOverlayProps> = ({ 
  regions, 
  containerRef, 
  showInstances, 
  data 
}) => {
  const { t } = useTranslation();
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
      {Array.from(regions.entries()).map(([regionName, { dimensions, stats }]) => {
        const instanceCategories = showInstances ? calculateDurationCategories(
          data
            .filter(record => 
              record.region === regionName && 
              record.activity === stats.activity &&
              record.duration > 5
            )
            .map(record => record.duration),
          t
        ) : [];

        return (
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
                  <InstanceTooltipContent 
                    stats={stats} 
                    instanceCategories={instanceCategories} 
                  />
                ) : (
                  <DurationTooltipContent stats={stats} />
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </>
  );
};
