import React from 'react';
import { ActivityRecord } from '@/types/warehouse';
import VisualizationWrapper from '../common/VisualizationWrapper';

interface RegionHeatmapProps {
  data: ActivityRecord[];
  hiddenActivities: Set<string>;
}

const RegionHeatmap: React.FC<RegionHeatmapProps> = ({ data, hiddenActivities }) => {
  const regionData = React.useMemo(() => {
    const summary: Record<string, number> = {};
    
    data.forEach(record => {
      if (hiddenActivities.has(record.activity)) return;
      
      if (!summary[record.region]) {
        summary[record.region] = 0;
      }
      summary[record.region] += record.duration;
    });

    return Object.entries(summary)
      .map(([region, duration]) => ({
        region,
        hours: duration / 3600,
        intensity: Math.min(1, duration / (8 * 3600)) // Normalize to 8 hours max
      }))
      .sort((a, b) => b.hours - a.hours);
  }, [data, hiddenActivities]);

  return (
    <VisualizationWrapper title="Region Activity Heat Map">
      <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto">
        {regionData.map(({ region, hours, intensity }) => (
          <div 
            key={region} 
            className="p-3 rounded"
            style={{
              backgroundColor: `rgba(79, 70, 229, ${intensity})`
            }}
          >
            <p className="text-sm font-medium text-white">{region}</p>
            <p className="text-xs text-white/80">{hours.toFixed(1)}h</p>
          </div>
        ))}
      </div>
    </VisualizationWrapper>
  );
};

export default RegionHeatmap;