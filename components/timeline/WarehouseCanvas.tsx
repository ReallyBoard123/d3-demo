import React from 'react';
import type { 
  ProcessMetadata, 
  RegionDefinition,
  CanvasRegionData,
  CanvasInteractionConfig,
  ActivityRecord
} from '@/types';
import { EMPLOYEE_COLORS } from '@/types/constants';
import { drawEmployeeIndicator } from './EmployeeIndicator';
import { HeatmapControls, useHeatmapOverlay } from '../timeline/HeatmapOverlay';
import BaseWarehouseCanvas from '../BaseWarehouseCanvas';

interface WarehouseCanvasProps {
  layoutImage: File;
  metadata: ProcessMetadata;
  currentActivities: ActivityRecord[];
  className?: string;
  config?: CanvasInteractionConfig;
  onRegionHover?: (region: string | null) => void;
  onRegionClick?: (region: string) => void;
}

export const WarehouseCanvas: React.FC<WarehouseCanvasProps> = ({
  layoutImage,
  metadata,
  currentActivities,
  className,
  config = {
    enableHover: true,
    enableClick: true,
  },
  onRegionHover,
  onRegionClick
}) => {
  const regionsRef = React.useRef<Map<string, CanvasRegionData>>(new Map());
  const { isHeatmapEnabled, setIsHeatmapEnabled, renderHeatmap } = useHeatmapOverlay();

  const calculateRegionData = React.useCallback((
    region: RegionDefinition,
    canvasWidth: number,
    canvasHeight: number
  ): CanvasRegionData => {
    const x = region.position_top_left_x * canvasWidth;
    const y = region.position_top_left_y * canvasHeight;
    const width = (region.position_bottom_right_x - region.position_top_left_x) * canvasWidth;
    const height = (region.position_bottom_right_y - region.position_top_left_y) * canvasHeight;
    
    const label = metadata.layout.region_labels.find(l => l.uuid === region.region_label_uuid);
    
    return {
      x,
      y,
      width,
      height,
      color: label?.color || '#ccc',
      name: region.name
    };
  }, [metadata.layout]);

  const handleRender = React.useCallback((ctx: CanvasRenderingContext2D) => {
    const canvas = ctx.canvas;
    
    if (isHeatmapEnabled) {
      renderHeatmap({
        activities: currentActivities,
        regions: metadata.layout.regions,
        ctx,
        canvasWidth: canvas.width,
        canvasHeight: canvas.height
      });
    }

    regionsRef.current.clear();
    metadata.layout.regions.forEach(region => {
      const regionData = calculateRegionData(region, canvas.width, canvas.height);
      regionsRef.current.set(region.name, regionData);

      const isActive = currentActivities.some(activity => activity.region === region.name);
      const isHovered = onRegionHover !== undefined && region.name === region.name;

      if (isActive || isHovered) {
        ctx.strokeStyle = regionData.color;
        ctx.lineWidth = isHovered ? 3 : 2;
        ctx.strokeRect(regionData.x, regionData.y, regionData.width, regionData.height);

        if (isHovered) {
          ctx.fillStyle = `${regionData.color}20`;
          ctx.fillRect(regionData.x, regionData.y, regionData.width, regionData.height);
        }
      }

      if (isActive) {
        const regionActivities = currentActivities.filter(a => a.region === region.name);
        if (regionActivities.length > 0) {
          const centerX = regionData.x + regionData.width / 2;
          const centerY = regionData.y + regionData.height / 2;

          drawEmployeeIndicator(ctx, {
            x: centerX,
            y: centerY,
            employees: regionActivities.map(activity => ({
              id: activity.id,
              color: EMPLOYEE_COLORS[activity.id.split('-')[1]] || '#ccc'
            }))
          });
        }
      }
    });
  }, [metadata.layout, currentActivities, calculateRegionData, isHeatmapEnabled, renderHeatmap, onRegionHover]);

  return (
    <BaseWarehouseCanvas
      layoutImage={layoutImage}
      metadata={metadata}
      className={className}
      config={config}
      onRender={handleRender}
      onRegionHover={onRegionHover}
      onRegionClick={onRegionClick}
      renderMode='dynamic'
    >
      <HeatmapControls
        isEnabled={isHeatmapEnabled}
        onToggle={setIsHeatmapEnabled}
      />
    </BaseWarehouseCanvas>
  );
};

export default WarehouseCanvas;