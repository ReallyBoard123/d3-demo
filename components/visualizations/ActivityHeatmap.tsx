import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProcessMetadata } from '@/hooks/useProcessMetadata';
import BaseWarehouseCanvas, { calculateRegionDimensions, RegionDimensions, renderRegionText } from '../BaseWarehouseCanvas';
import { formatDuration } from '@/lib/utils';
import type { ActivityRecord, ProcessMetadata, BaseActivityProps } from '@/types';
import { HeatmapTooltipOverlay } from '../HeatmapTooltip';

const COLOR_RANGES = {
  LOW: { r: 179, g: 214, b: 255, a: 0.4 },
  MEDIUM: { r: 255, g: 229, b: 179, a: 0.6 },
  HIGH: { r: 255, g: 179, b: 179, a: 0.8 }
} as const;

const getHeatmapColor = (intensity: number): string => {
  const range = intensity <= 0.3 ? COLOR_RANGES.LOW : 
                intensity <= 0.7 ? COLOR_RANGES.MEDIUM : 
                COLOR_RANGES.HIGH;
  return `rgba(${range.r},${range.g},${range.b},${range.a})`;
};

const ActivitySelector: React.FC<{
  activity: string;
  availableActivities: string[];
  onActivityChange: (activity: string) => void;
}> = ({ activity, availableActivities, onActivityChange }) => (
  <div className="absolute top-2 right-2 z-10 bg-card/90 backdrop-blur-sm p-2 rounded-lg shadow-sm border">
    <Select value={activity} onValueChange={onActivityChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {availableActivities.map(act => (
          <SelectItem key={act} value={act}>{act}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

interface SingleHeatmapProps {
  activity: string;
  data: ActivityRecord[];
  metadata: ProcessMetadata;
  layoutImage: File;
  availableActivities: string[];
  onActivityChange: (activity: string) => void;
}

interface RegionStats {
  duration: number;
  count: number;
  avgDuration: number;
  percentage: number;
  activity: string;
  region: string;
}

const SingleHeatmap: React.FC<SingleHeatmapProps> = React.memo(({ 
  activity,
  data,
  metadata,
  layoutImage,
  availableActivities,
  onActivityChange 
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [tooltipRegions, setTooltipRegions] = React.useState<Map<string, {
    dimensions: RegionDimensions;
    stats: RegionStats;
  }>>(new Map());

  const calculateHeatData = React.useCallback(() => {
    const regionStats = new Map<string, RegionStats>();
    let maxDuration = 0;
    let totalDuration = 0;

    // First pass to calculate totals
    data.forEach(record => {
      if (record.activity !== activity) return;
      totalDuration += record.duration;
    });

    // Second pass to calculate stats
    data.forEach(record => {
      if (record.activity !== activity) return;
      
      const current = regionStats.get(record.region) || { 
        duration: 0, 
        count: 0,
        avgDuration: 0,
        percentage: 0,
        activity,
        region: record.region
      };
      
      current.duration += record.duration;
      current.count++;
      current.avgDuration = current.duration / current.count;
      current.percentage = (current.duration / totalDuration) * 100;
      
      regionStats.set(record.region, current);
      maxDuration = Math.max(maxDuration, current.duration);
    });

    return { regionStats, maxDuration, totalDuration };
  }, [data, activity]);

  const renderHeatmap = React.useCallback((ctx: CanvasRenderingContext2D) => {
    const { regionStats, maxDuration } = calculateHeatData();
    const newTooltipRegions = new Map();

    ctx.save();
    ctx.globalCompositeOperation = 'multiply';

    metadata.layout.regions.forEach(region => {
      const stats = regionStats.get(region.name);
      if (!stats) return;

      const intensity = maxDuration > 0 ? stats.duration / maxDuration : 0;
      const dimensions = calculateRegionDimensions(region, ctx.canvas.width, ctx.canvas.height);

      // Draw heat color
      ctx.fillStyle = getHeatmapColor(intensity);
      ctx.fillRect(dimensions.x, dimensions.y, dimensions.width, dimensions.height);

      // Draw duration text
      if (stats.duration > 0) {
        renderRegionText(
          ctx,
          formatDuration(stats.duration),
          dimensions
        );

        // Store dimensions and stats for tooltips
        newTooltipRegions.set(region.name, {
          dimensions,
          stats
        });
      }
    });

    setTooltipRegions(newTooltipRegions);
    ctx.restore();
  }, [calculateHeatData, metadata.layout.regions]);

  return (
    <div className="relative" ref={containerRef}>
      <BaseWarehouseCanvas
        layoutImage={layoutImage}
        metadata={metadata}
        onRender={renderHeatmap}
        config={{ enableHover: false, enableClick: false }}
        renderMode="static"
      >
        <ActivitySelector
          activity={activity}
          availableActivities={availableActivities}
          onActivityChange={onActivityChange}
        />
        <HeatmapTooltipOverlay 
          regions={tooltipRegions}
          containerRef={containerRef}
        />
      </BaseWarehouseCanvas>
    </div>
  );
});

SingleHeatmap.displayName = 'SingleHeatmap';

const ActivityHeatmap: React.FC<BaseActivityProps> = ({ 
  data, 
  hiddenActivities, 
  selectedDates 
}) => {
  const { processMetadata, layoutImage } = useProcessMetadata();
  const [selectedActivities, setSelectedActivities] = React.useState<string[]>([
    'Drive', 
    'Handle center', 
    'Handle down'
  ]);

  const filteredData = React.useMemo(() => 
    data.filter(record => selectedDates.has(record.date)),
    [data, selectedDates]
  );

  const availableActivities = React.useMemo(() => {
    const activities = new Set<string>();
    filteredData.forEach(record => {
      if (!hiddenActivities.has(record.activity)) {
        activities.add(record.activity);
      }
    });
    return Array.from(activities).sort();
  }, [filteredData, hiddenActivities]);

  if (!processMetadata || !layoutImage) return null;

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Activity Heat Maps</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedActivities.map((activity, index) => (
            <SingleHeatmap
              key={`${activity}-${index}`}
              activity={activity}
              data={filteredData}
              metadata={processMetadata}
              layoutImage={layoutImage}
              availableActivities={availableActivities}
              onActivityChange={(newActivity) => {
                setSelectedActivities(prev => {
                  const updated = [...prev];
                  updated[index] = newActivity;
                  return updated;
                });
              }}
            />
          ))}
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          <p>Color intensity indicates relative activity duration in each region. Darker colors represent higher activity levels.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityHeatmap;