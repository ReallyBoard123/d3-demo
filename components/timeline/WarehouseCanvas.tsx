import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { 
  ProcessMetadata, 
  RegionDefinition,
  CanvasSize,
  CanvasState,
  CanvasRegionData,
  CanvasInteractionConfig,
  ActivityRecord
} from '@/types';
import { CANVAS_CONSTANTS, EMPLOYEE_COLORS } from '@/types/constants';
import ActivityIconsOverlay, { EMPLOYEE_POSITIONS } from './ActivityIconsOverlay';
import { drawEmployeeIndicator, calculateIndicatorScale } from './EmployeeIndicator';

interface WarehouseCanvasProps {
  layoutImage: File;
  metadata: ProcessMetadata;
  currentActivities: ActivityRecord[];
  className?: string;
  config?: CanvasInteractionConfig;
  onRegionHover?: (region: string | null) => void;
  onRegionClick?: (region: string) => void;
}

// Fixed base sizes that won't change with scaling
const BASE_CIRCLE_RADIUS = 25;
const BASE_ICON_SIZE = 20;
const BASE_CIRCLE_STROKE = 2;
const SINGLE_EMPLOYEE_SCALE = 1.5;

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
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const imageRef = React.useRef<HTMLImageElement | null>(null);
  const regionsRef = React.useRef<Map<string, CanvasRegionData>>(new Map());
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);
  const [activityPositions, setActivityPositions] = React.useState<Array<{
    id: string;
    activity: string;
    x: number;
    y: number;
    color: string;
    employeeId: string;
    size: number;
    placement?: { x: number; y: number };
  }>>([]);

  const [canvasSize, setCanvasSize] = React.useState<CanvasSize>({
    width: metadata.layout.width_pixel || CANVAS_CONSTANTS.DEFAULT_WIDTH,
    height: metadata.layout.height_pixel || CANVAS_CONSTANTS.DEFAULT_HEIGHT
  });

  const [state, setState] = React.useState<CanvasState>({
    isLoading: true,
    error: null,
    hoveredRegion: null
  });

  const calculateRegionData = React.useCallback((region: RegionDefinition): CanvasRegionData => {
    const x = region.position_top_left_x * canvasSize.width;
    const y = region.position_top_left_y * canvasSize.height;
    const width = (region.position_bottom_right_x - region.position_top_left_x) * canvasSize.width;
    const height = (region.position_bottom_right_y - region.position_top_left_y) * canvasSize.height;
    
    const label = metadata.layout.region_labels.find(l => l.uuid === region.region_label_uuid);
    
    return {
      x,
      y,
      width,
      height,
      color: label?.color || '#ccc',
      name: region.name
    };
  }, [metadata.layout, canvasSize]);

  const drawCanvas = React.useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const scale = calculateIndicatorScale(canvas.width);

    regionsRef.current.clear();
    metadata.layout.regions.forEach(region => {
      const regionData = calculateRegionData(region);
      regionsRef.current.set(region.name, regionData);

      const isActive = currentActivities.some(activity => activity.region === region.name);
      const isHovered = state.hoveredRegion === region.name;

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

          drawEmployeeIndicator(
            ctx,
            {
              x: centerX,
              y: centerY,
              employees: regionActivities.map(activity => ({
                id: activity.id,
                color: EMPLOYEE_COLORS[activity.id.split('-')[1]] || '#ccc',
                activity: activity.activity
              })),
              scale
            },
            {
              circleRadius: BASE_CIRCLE_RADIUS,
              strokeWidth: BASE_CIRCLE_STROKE,
              iconSize: BASE_ICON_SIZE
            }
          );
        }
      }
    });
  }, [metadata.layout, currentActivities, state.hoveredRegion, calculateRegionData]);

  const calculateIconPositions = React.useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    
    const rect = container.getBoundingClientRect();
    const scaleX = rect.width / canvasSize.width;
    const scaleY = rect.height / canvasSize.height;
    
    const newPositions: Array<{
      id: string;
      activity: string;
      x: number;
      y: number;
      color: string;
      employeeId: string;
      size: number;
      placement?: { x: number; y: number };
    }> = [];
    
    metadata.layout.regions.forEach(region => {
      const regionData = calculateRegionData(region);
      const regionActivities = currentActivities.filter(a => a.region === region.name);
      
      if (regionActivities.length > 0) {
        const centerX = regionData.x + (regionData.width / 2);
        const centerY = regionData.y + (regionData.height / 2);
        
        const employeeCount = Math.min(regionActivities.length, 8) as keyof typeof EMPLOYEE_POSITIONS;
        const positions = EMPLOYEE_POSITIONS[employeeCount];

        regionActivities.slice(0, 8).forEach((activity, index) => {
          const placement = positions[index];
          const screenX = centerX * scaleX;
          const screenY = centerY * scaleY;
          
          // Scale up icon size for single employee
          const baseIconSize = BASE_ICON_SIZE * scaleX;
          const iconSize = employeeCount === 1 ? baseIconSize * SINGLE_EMPLOYEE_SCALE : baseIconSize;

          newPositions.push({
            id: activity.id,
            activity: activity.activity,
            x: screenX,
            y: screenY,
            color: EMPLOYEE_COLORS[activity.id.split('-')[1]] || '#ccc',
            employeeId: activity.id,
            size: iconSize,
            placement
          });
        });
      }
    });
    
    setActivityPositions(newPositions);
  }, [metadata.layout, currentActivities, calculateRegionData, canvasSize]);

  React.useEffect(() => {
    const url = URL.createObjectURL(layoutImage);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [layoutImage]);

  React.useEffect(() => {
    if (!imageUrl) return;

    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      setState(prev => ({ ...prev, isLoading: false }));
      drawCanvas();
      calculateIconPositions();
    };

    img.onerror = () => {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load layout image'
      }));
    };

    img.src = imageUrl;
  }, [imageUrl, drawCanvas, calculateIconPositions]);

  const handleResize = React.useCallback(() => {
    if (containerRef.current) {
      const { width } = containerRef.current.getBoundingClientRect();
      const aspectRatio = metadata.layout.height_pixel / metadata.layout.width_pixel;
      setCanvasSize({
        width,
        height: width * aspectRatio
      });
    }
  }, [metadata.layout]);

  React.useEffect(() => {
    handleResize();
    const observer = new ResizeObserver(handleResize);
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => {
      observer.disconnect();
    };
  }, [handleResize]);

  React.useEffect(() => {
    drawCanvas();
    calculateIconPositions();
  }, [drawCanvas, calculateIconPositions, canvasSize]);

  const handleMouseMove = React.useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!config.enableHover) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (canvas.height / rect.height);

    let hoveredRegion: string | null = null;
    regionsRef.current.forEach((region) => {
      if (
        x >= region.x && 
        x <= region.x + region.width && 
        y >= region.y && 
        y <= region.y + region.height
      ) {
        hoveredRegion = region.name;
      }
    });

    if (hoveredRegion !== state.hoveredRegion) {
      setState(prev => ({ ...prev, hoveredRegion }));
      onRegionHover?.(hoveredRegion);
    }
  }, [config.enableHover, onRegionHover, state.hoveredRegion]);

  const handleClick = React.useCallback(() => {
    if (!config.enableClick || !state.hoveredRegion || !onRegionClick) return;
    onRegionClick(state.hoveredRegion);
  }, [config.enableClick, state.hoveredRegion, onRegionClick]);

  if (state.error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{state.error}</AlertDescription>
      </Alert>
    );
  }

  if (state.isLoading) {
    return <Skeleton className="w-full h-[600px] rounded-lg" />;
  }

  return (
    <Card className={className}>
      <CardContent className="p-0 relative" ref={containerRef}>
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className="w-full h-full object-contain"
          onMouseMove={handleMouseMove}
          onClick={handleClick}
          style={{ cursor: config.enableClick ? 'pointer' : 'default' }}
        />
        <ActivityIconsOverlay activities={activityPositions} />
      </CardContent>
    </Card>
  );
};

export default WarehouseCanvas;