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
import BaseWarehouseCanvas, { 
  calculateRegionDimensions, 
  RegionDimensions, 
  renderRegionText 
} from '../BaseWarehouseCanvas';
import { formatDuration } from '@/lib/utils';
import type { ActivityRecord, ProcessMetadata, BaseActivityProps } from '@/types';
import { HeatmapTooltipOverlay } from '../HeatmapTooltip';
import RegionManagement from '../RegionManagement';

// Constants and Types
const INSTANCE_DURATION_THRESHOLD = 5; // seconds

interface RegionStats {
  duration: number;
  count: number;
  avgDuration: number;
  percentage: number;
  activity: string;
  region: string;
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

// Helper Functions
const getHeatmapColor = (intensity: number): string => {
  const range = intensity <= 0.3 ? COLOR_RANGES.LOW : 
                intensity <= 0.7 ? COLOR_RANGES.MEDIUM : 
                COLOR_RANGES.HIGH;
  return `rgba(${range.r},${range.g},${range.b},${range.a})`;
};

const processCombinedRegions = (
  data: ActivityRecord[],
  combinations: Array<{ name: string; regions: string[] }>
): ActivityRecord[] => {
  return data.map(record => {
    const combination = combinations.find(c => 
      c.regions.includes(record.region)
    );
    return combination 
      ? { ...record, region: combination.name }
      : record;
  });
};

// Components
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
  metadata: ProcessMetadata;
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
  const { combinations } = useRegionStore();

  const { excludedRegions } = useRegionStore();

  const processedData = React.useMemo(() => {
    const filteredData = data.filter(record => !excludedRegions.has(record.region));
    return useCombinedRegions ? processCombinedRegions(filteredData, combinations) : filteredData;
  }, [data, combinations, useCombinedRegions, excludedRegions]);

  const calculateHeatData = React.useCallback((): HeatData => {
    const regionStats = new Map<string, RegionStats>();
    let maxDuration = 0;
    let maxCount = 0;
    let totalDuration = 0;
    let totalCount = 0;

    processedData.forEach(record => {
      if (record.activity !== activity) return;
      
      totalDuration += record.duration;
      if (!showInstances || record.duration > INSTANCE_DURATION_THRESHOLD) {
        totalCount++;
      }

      const current = regionStats.get(record.region) || {
        duration: 0,
        count: 0,
        avgDuration: 0,
        percentage: 0,
        activity,
        region: record.region
      };

      current.duration += record.duration;
      if (!showInstances || record.duration > INSTANCE_DURATION_THRESHOLD) {
        current.count++;
      }

      current.avgDuration = current.duration / current.count;
      current.percentage = showInstances 
        ? (current.count / totalCount) * 100
        : (current.duration / totalDuration) * 100;

      regionStats.set(record.region, current);
      maxDuration = Math.max(maxDuration, current.duration);
      maxCount = Math.max(maxCount, current.count);
    });

    return { regionStats, maxDuration, maxCount, totalDuration, totalCount };
  }, [processedData, activity, showInstances]);

  const renderHeatmap = React.useCallback((ctx: CanvasRenderingContext2D) => {
    const { regionStats, maxDuration, maxCount } = calculateHeatData();
    const newTooltipRegions = new Map();

    ctx.save();
    ctx.globalCompositeOperation = 'multiply';

    metadata.layout.regions.forEach(region => {
      const stats = regionStats.get(region.name);
      if (!stats) return;

      const intensity = showInstances
        ? maxCount > 0 ? stats.count / maxCount : 0
        : maxDuration > 0 ? stats.duration / maxDuration : 0;

      const dimensions = calculateRegionDimensions(region, ctx.canvas.width, ctx.canvas.height);

      ctx.fillStyle = getHeatmapColor(intensity);
      ctx.fillRect(dimensions.x, dimensions.y, dimensions.width, dimensions.height);

      if (stats.duration > 0) {
        const displayText = showInstances 
          ? `${stats.count}`
          : formatDuration(stats.duration);

        renderRegionText(
          ctx,
          displayText,
          dimensions
        );

        newTooltipRegions.set(region.name, {
          dimensions,
          stats
        });
      }
    });

    setTooltipRegions(newTooltipRegions);
    ctx.restore();
  }, [calculateHeatData, metadata.layout.regions, showInstances]);

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
          data={processedData}
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