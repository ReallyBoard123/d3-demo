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
import { drawEmployeeIndicator } from './EmployeeIndicator';

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
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const imageRef = React.useRef<HTMLImageElement | null>(null);
  const regionsRef = React.useRef<Map<string, CanvasRegionData>>(new Map());
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);

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
    const canvas = canvasRef.current;
    if (!canvas) throw new Error('Canvas not initialized');

    const x = region.position_top_left_x * canvas.width;
    const y = region.position_top_left_y * canvas.height;
    const width = (region.position_bottom_right_x - region.position_top_left_x) * canvas.width;
    const height = (region.position_bottom_right_y - region.position_top_left_y) * canvas.height;
    
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

  const drawCanvas = React.useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

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
  }, [metadata.layout, currentActivities, state.hoveredRegion, calculateRegionData]);

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
    };

    img.onerror = () => {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load layout image'
      }));
    };

    img.src = imageUrl;

    return () => {
      if (imageRef.current) {
        imageRef.current = null;
      }
    };
  }, [imageUrl, drawCanvas]);

  const handleResize = React.useCallback(() => {
    if (canvasRef.current) {
      const container = canvasRef.current.parentElement;
      if (container) {
        const { width } = container.getBoundingClientRect();
        const aspectRatio = metadata.layout.height_pixel / metadata.layout.width_pixel;
        
        setCanvasSize({
          width,
          height: width * aspectRatio
        });
      }
    }
  }, [metadata.layout]);

  React.useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  React.useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

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
      <CardContent className="p-0 relative">
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className="w-full h-full object-contain"
          onMouseMove={handleMouseMove}
          onClick={handleClick}
          style={{ cursor: config.enableClick ? 'pointer' : 'default' }}
        />
      </CardContent>
    </Card>
  );
};

export default WarehouseCanvas;