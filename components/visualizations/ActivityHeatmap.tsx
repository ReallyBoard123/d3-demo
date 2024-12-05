import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import { useProcessMetadata } from '@/hooks/useProcessMetadata';
import { useTranslation } from '@/hooks/useTranslation';
import { useRegionStore } from '@/stores/useRegionStore';
import BaseWarehouseCanvas, { calculateRegionDimensions, renderRegionText } from '../BaseWarehouseCanvas';
import { formatDuration } from '@/lib/utils';
import type { ActivityRecord, BaseActivityProps } from '@/types';
import { HeatmapTooltipOverlay } from '../HeatmapTooltip';
import RegionManagement from '../RegionManagement';
import { RegionDimensions, ExtendedProcessMetadata } from '@/lib/RegionCalculations';

const INSTANCE_DURATION_THRESHOLD = 5;

interface RegionStats {
  duration: number;
  count: number;
  avgDuration: number;
  percentage: number;
  activity: string;
  region: string;
  instanceCategories?: Array<{ range: string; count: number }>;
}

interface HeatData {
  regionStats: Map<string, RegionStats>;
  maxDuration: number;
  maxCount: number;
  totalDuration: number;
  totalCount: number;
}

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

const calculateCategoriesForDurations = (durations: number[]): Array<{ range: string; count: number }> => {
  if (durations.length === 0) return [];
  
  const sortedDurations = [...durations].sort((a, b) => a - b);
  const q1Index = Math.floor(durations.length / 4);
  const q2Index = Math.floor(durations.length / 2);
  const q3Index = Math.floor(3 * durations.length / 4);

  const boundaries = [
    INSTANCE_DURATION_THRESHOLD,
    sortedDurations[q1Index],
    sortedDurations[q2Index],
    sortedDurations[q3Index]
  ].sort((a, b) => a - b);

  const categories = new Map<string, number>();
  
  durations.forEach(duration => {
    if (duration <= boundaries[1]) {
      const range = `${INSTANCE_DURATION_THRESHOLD}-${boundaries[1].toFixed(0)}sec`;
      categories.set(range, (categories.get(range) || 0) + 1);
    } else if (duration <= boundaries[2]) {
      const range = `${boundaries[1].toFixed(0)}-${boundaries[2].toFixed(0)}sec`;
      categories.set(range, (categories.get(range) || 0) + 1);
    } else if (duration <= boundaries[3]) {
      const range = `${boundaries[2].toFixed(0)}-${boundaries[3].toFixed(0)}sec`;
      categories.set(range, (categories.get(range) || 0) + 1);
    } else {
      const range = `>${boundaries[3].toFixed(0)}sec`;
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

interface ActivitySelectorProps {
  activity: string;
  availableActivities: string[];
  onActivityChange: (activity: string) => void;
}

const ActivitySelector: React.FC<ActivitySelectorProps> = ({
  activity,
  availableActivities,
  onActivityChange
}) => {
  const { translateActivity } = useTranslation();
  
  return (
    <div className="absolute top-2 right-2 z-10 bg-card/90 backdrop-blur-sm p-2 rounded-lg shadow-sm border">
      <Select value={activity} onValueChange={onActivityChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue>{translateActivity(activity)}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {availableActivities.map(act => (
            <SelectItem key={act} value={act}>
              {translateActivity(act)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

interface SingleHeatmapProps {
  activity: string;
  data: ActivityRecord[];
  metadata: ExtendedProcessMetadata;
  layoutImage: File;
  availableActivities: string[];
  onActivityChange: (activity: string) => void;
  showInstances: boolean;
  useCombinedRegions: boolean;
}

const SingleHeatmap: React.FC<SingleHeatmapProps> = React.memo(({ 
  activity,
  data,
  metadata,
  layoutImage,
  availableActivities,
  onActivityChange,
  showInstances,
  useCombinedRegions
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [tooltipRegions, setTooltipRegions] = React.useState<Map<string, {
    dimensions: RegionDimensions;
    stats: RegionStats;
  }>>(new Map());
  const { combinations, excludedRegions } = useRegionStore();

  const filteredData = React.useMemo(() => {
    return data.filter(record => !excludedRegions.has(record.region));
  }, [data, excludedRegions]);

  const calculateHeatData = React.useCallback((): HeatData => {
    const regionStats = new Map<string, RegionStats>();
    let maxDuration = 0;
    let maxCount = 0;
    let totalDuration = 0;
    let totalCount = 0;
  
    filteredData.forEach(record => {
      if (record.activity !== activity) return;
  
      let targetRegion = record.region;
      if (useCombinedRegions) {
        const matchingCombo = combinations.find(c => c.regions.includes(record.region));
        if (matchingCombo) {
          targetRegion = matchingCombo.name;
        }
      }
  
      const current = regionStats.get(targetRegion) || {
        duration: 0,
        count: 0,
        avgDuration: 0,
        percentage: 0,
        activity,
        region: targetRegion
      };
  
      current.duration += record.duration;
      if (!showInstances || record.duration > INSTANCE_DURATION_THRESHOLD) {
        current.count++;
      }
  
      regionStats.set(targetRegion, current);
    });
  
    regionStats.forEach(stats => {
      totalDuration += stats.duration;
      totalCount += stats.count;
      maxDuration = Math.max(maxDuration, stats.duration);
      maxCount = Math.max(maxCount, stats.count);
    });
  
    regionStats.forEach(stats => {
      stats.percentage = showInstances 
        ? (stats.count / totalCount) * 100
        : (stats.duration / totalDuration) * 100;
      stats.avgDuration = stats.count > 0 ? stats.duration / stats.count : 0;
    });
  
    return { regionStats, maxDuration, maxCount, totalDuration, totalCount };
  }, [filteredData, activity, showInstances, useCombinedRegions, combinations]);

  const renderHeatmap = React.useCallback((ctx: CanvasRenderingContext2D) => {
    const { regionStats, maxDuration, maxCount } = calculateHeatData();
    const newTooltipRegions = new Map();
  
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
  
    // For regular regions
    metadata.layout.regions.forEach(region => {
      if (useCombinedRegions && combinations.some(c => c.regions.includes(region.name))) {
        return;
      }
  
      const stats = regionStats.get(region.name);
      if (!stats) return;
  
      const dimensions = calculateRegionDimensions(region, ctx.canvas.width, ctx.canvas.height);
      const intensity = showInstances
        ? maxCount > 0 ? stats.count / maxCount : 0
        : maxDuration > 0 ? stats.duration / maxDuration : 0;
  
      ctx.fillStyle = getHeatmapColor(intensity);
      ctx.fillRect(dimensions.x, dimensions.y, dimensions.width, dimensions.height);
  
      const displayText = showInstances ? `${stats.count}` : formatDuration(stats.duration);
      renderRegionText(ctx, displayText, dimensions);
  
      const durations = data
        .filter(record => 
          record.region === region.name && 
          record.activity === activity &&
          record.duration > INSTANCE_DURATION_THRESHOLD
        )
        .map(record => record.duration);
  
      newTooltipRegions.set(region.name, { 
        dimensions, 
        stats: {
          ...stats,
          instanceCategories: showInstances ? calculateCategoriesForDurations(durations) : []
        }
      });
    });
  
    // For combined regions
    if (useCombinedRegions) {
      combinations.forEach(combo => {
        const stats = regionStats.get(combo.name);
        if (!stats) return;
  
        const combinedDimensions = {
          x: Math.min(...combo.regions.map(rName => {
            const r = metadata.layout.regions.find(mr => mr.name === rName);
            return r ? r.position_top_left_x * ctx.canvas.width : Infinity;
          })),
          y: Math.min(...combo.regions.map(rName => {
            const r = metadata.layout.regions.find(mr => mr.name === rName);
            return r ? r.position_top_left_y * ctx.canvas.height : Infinity;
          })),
          width: Math.max(...combo.regions.map(rName => {
            const r = metadata.layout.regions.find(mr => mr.name === rName);
            return r ? r.position_bottom_right_x * ctx.canvas.width : 0;
          })) - Math.min(...combo.regions.map(rName => {
            const r = metadata.layout.regions.find(mr => mr.name === rName);
            return r ? r.position_top_left_x * ctx.canvas.width : Infinity;
          })),
          height: Math.max(...combo.regions.map(rName => {
            const r = metadata.layout.regions.find(mr => mr.name === rName);
            return r ? r.position_bottom_right_y * ctx.canvas.height : 0;
          })) - Math.min(...combo.regions.map(rName => {
            const r = metadata.layout.regions.find(mr => mr.name === rName);
            return r ? r.position_top_left_y * ctx.canvas.height : Infinity;
          }))
        };
  
        const intensity = showInstances
          ? maxCount > 0 ? stats.count / maxCount : 0
          : maxDuration > 0 ? stats.duration / maxDuration : 0;
  
        ctx.fillStyle = getHeatmapColor(intensity);
        ctx.fillRect(combinedDimensions.x, combinedDimensions.y, combinedDimensions.width, combinedDimensions.height);
  
        const displayText = showInstances ? `${stats.count}` : formatDuration(stats.duration);
        
        const smallerDimensions = {
          x: combinedDimensions.x + combinedDimensions.width * 0.15,
          y: combinedDimensions.y + combinedDimensions.height * 0.15,
          width: combinedDimensions.width * 0.7,
          height: combinedDimensions.height * 0.7
        };
        renderRegionText(ctx, displayText, smallerDimensions);
  
        const durations = combo.regions.flatMap(regionName =>
          data
            .filter(record => 
              record.region === regionName && 
              record.activity === activity &&
              record.duration > INSTANCE_DURATION_THRESHOLD
            )
            .map(record => record.duration)
        );
  
        newTooltipRegions.set(combo.name, { 
          dimensions: combinedDimensions, 
          stats: {
            ...stats,
            instanceCategories: showInstances ? calculateCategoriesForDurations(durations) : []
          }
        });
      });
    }
  
    setTooltipRegions(newTooltipRegions);
    ctx.restore();
  }, [
    calculateHeatData,
    metadata.layout.regions,
    showInstances,
    useCombinedRegions,
    combinations,
    data,
    activity,
  ]);

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
          showInstances={showInstances}
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
  const { t } = useTranslation();
  const { processMetadata, layoutImage } = useProcessMetadata();
  const [selectedActivities, setSelectedActivities] = React.useState<string[]>([
    'Handle up', 
    'Handle center', 
    'Handle down'
  ]);
  const [showInstances, setShowInstances] = React.useState<boolean>(false);
  const [useCombinedRegions, setUseCombinedRegions] = React.useState<boolean>(false);

  const dialogContentStyles = {
    maxWidth: '90vw',
    width: '1400px',
    height: '90vh',
    padding: '1.5rem',
  };

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

  const extendedMetadata: ExtendedProcessMetadata = {
    ...processMetadata,
    layout: {
      ...processMetadata.layout,
      beacons: [],
      dynamic_beacons: [],
      width_pixel: processMetadata.layout.width_pixel,
      height_pixel: processMetadata.layout.height_pixel,
      regions: processMetadata.layout.regions.map(region => ({
        ...region,
        exclude_from_eval: false,
        special_activities: [],
        regionId: parseInt(region.region_label_uuid),
        uuid: region.region_label_uuid
      })),
      region_labels: processMetadata.layout.region_labels
    }
  };

  const allRegions = processMetadata.layout.regions.map(r => r.name);

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t('heatmap.title')}</CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm">{t('heatmap.showInstances')}</span>
              <Switch
                checked={showInstances}
                onCheckedChange={setShowInstances}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">{t('heatmap.useCombinedRegions')}</span>
              <Switch
                checked={useCombinedRegions}
                onCheckedChange={setUseCombinedRegions}
              />
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Settings2 className="h-4 w-4 mr-2" />
                  {t('heatmap.manageRegions')}
                </Button>
              </DialogTrigger>
              <DialogContent style={dialogContentStyles} className="flex flex-col">
                <DialogHeader>
                  <DialogTitle>{t('regionManagement.title')}</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-hidden mt-4">
                  <RegionManagement regions={allRegions} />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedActivities.map((activity, index) => (
            <SingleHeatmap
              key={`${activity}-${index}`}
              activity={activity}
              data={filteredData}
              metadata={extendedMetadata}
              layoutImage={layoutImage}
              availableActivities={availableActivities}
              onActivityChange={(newActivity) => {
                setSelectedActivities(prev => {
                  const updated = [...prev];
                  updated[index] = newActivity;
                  return updated;
                });
              }}
              showInstances={showInstances}
              useCombinedRegions={useCombinedRegions}
            />
          ))}
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          <p>
            {t('heatmap.colorIntensityInfo', { 
              type: t(showInstances ? 'heatmap.frequency' : 'heatmap.duration')
            })}
            {showInstances && ` ${t('heatmap.instancesNote')}`} {t('heatmap.darkerColors')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityHeatmap;
