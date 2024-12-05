import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { 
  CanvasSize,
  CanvasState,
  CanvasInteractionConfig,
  RegionDefinition
} from '@/types';
import { CANVAS_CONSTANTS } from '@/types/constants';
import { useRegionStore } from '@/stores/useRegionStore';
import { 
  updateMetadataWithCombinedRegions, 
  type ExtendedProcessMetadata,
  type RegionDimensions
} from '@/lib/RegionCalculations';

export interface BaseWarehouseCanvasProps {
  layoutImage: File;
  metadata: ExtendedProcessMetadata;
  className?: string;
  config?: CanvasInteractionConfig;
  onCanvasReady?: (context: CanvasRenderingContext2D) => void;
  onRender?: (context: CanvasRenderingContext2D) => void;
  onRegionHover?: (region: string | null) => void;
  onRegionClick?: (region: string) => void;
  children?: React.ReactNode;
  renderMode?: 'static' | 'dynamic';
}

export function calculateRegionDimensions(
  region: RegionDefinition,
  canvasWidth: number,
  canvasHeight: number
): RegionDimensions {
  return {
    x: region.position_top_left_x * canvasWidth,
    y: region.position_top_left_y * canvasHeight,
    width: (region.position_bottom_right_x - region.position_top_left_x) * canvasWidth,
    height: (region.position_bottom_right_y - region.position_top_left_y) * canvasHeight
  };
}

export function calculateTextLayout(width: number, height: number): 'vertical' | 'horizontal' | 'square' {
  const aspectRatio = width / height;
  if (aspectRatio < 0.8) return 'vertical';
  if (aspectRatio > 1.2) return 'horizontal';
  return 'square';
}

export function renderRegionText(
  ctx: CanvasRenderingContext2D,
  text: string,
  dimensions: RegionDimensions
): void {
  const layout = calculateTextLayout(dimensions.width, dimensions.height);
  const longestDimension = Math.max(dimensions.width, dimensions.height);
  const baseFontSize = Math.min(
    longestDimension * 0.8 / (text.length > 8 ? 8 : 5),
    longestDimension * 0.8
  );

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const centerX = dimensions.x + dimensions.width / 2;
  const centerY = dimensions.y + dimensions.height / 2;

  if (layout === 'vertical') {
    ctx.translate(centerX, centerY);
    ctx.rotate(-Math.PI / 2);
    ctx.font = `${baseFontSize}px Inter, sans-serif`;
  } else {
    ctx.font = `${baseFontSize}px Inter, sans-serif`;
  }

  const outlineWidth = baseFontSize / 8;
  
  ctx.strokeStyle = 'white';
  ctx.lineWidth = outlineWidth;
  ctx.strokeText(
    text,
    layout === 'vertical' ? 0 : centerX,
    layout === 'vertical' ? 0 : centerY
  );

  ctx.fillStyle = 'black';
  ctx.fillText(
    text,
    layout === 'vertical' ? 0 : centerX,
    layout === 'vertical' ? 0 : centerY
  );

  ctx.restore();
}

const BaseWarehouseCanvas: React.FC<BaseWarehouseCanvasProps> = ({
  layoutImage,
  metadata,
  className,
  config = {
    enableHover: true,
    enableClick: true,
  },
  onCanvasReady,
  onRender,
  onRegionHover,
  onRegionClick,
  children,
  renderMode = 'dynamic',
}) => {
  const combinations = useRegionStore(state => state.combinations);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const imageRef = React.useRef<HTMLImageElement | null>(null);
  const [isImageLoaded, setIsImageLoaded] = React.useState(false);
  const [imageLoadAttempt, setImageLoadAttempt] = React.useState(0);
  const [processedMetadata, setProcessedMetadata] = React.useState<ExtendedProcessMetadata>(metadata);
  const [canvasSize, setCanvasSize] = React.useState<CanvasSize>({
    width: metadata.layout.width_pixel || CANVAS_CONSTANTS.DEFAULT_WIDTH,
    height: metadata.layout.height_pixel || CANVAS_CONSTANTS.DEFAULT_HEIGHT
  });
  const [state, setState] = React.useState<CanvasState>({
    isLoading: true,
    error: null,
    hoveredRegion: null
  });

  React.useEffect(() => {
    const updatedMetadata = updateMetadataWithCombinedRegions(metadata, combinations);
    setProcessedMetadata(updatedMetadata);
  }, [metadata, combinations]);

  const createImageUrl = React.useCallback(async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read file as data URL'));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }, []);

  const drawBaseImage = React.useCallback((ctx: CanvasRenderingContext2D): boolean => {
    if (!imageRef.current || !isImageLoaded) return false;
    try {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.drawImage(imageRef.current, 0, 0, ctx.canvas.width, ctx.canvas.height);
      return true;
    } catch (error) {
      console.error('Error drawing image:', error);
      return false;
    }
  }, [isImageLoaded]);

  const renderContent = React.useCallback((ctx: CanvasRenderingContext2D) => {
    const baseDrawn = drawBaseImage(ctx);
    if (!baseDrawn) return;

    // Let onRender handle all the drawing
    onRender?.(ctx);
  }, [drawBaseImage, onRender]);

  React.useEffect(() => {
    let mounted = true;
    let currentImage: HTMLImageElement | null = null;

    const loadImage = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        setIsImageLoaded(false);

        const img = new Image();
        currentImage = img;
        imageRef.current = img;

        img.onload = () => {
          if (!mounted) return;
          setIsImageLoaded(true);
          setState(prev => ({ ...prev, isLoading: false }));
        };

        img.onerror = (error) => {
          if (!mounted) return;
          console.error('Image load error:', error);
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: 'Failed to load layout image'
          }));
          if (imageLoadAttempt < 3) {
            setImageLoadAttempt(prev => prev + 1);
          }
        };

        const dataUrl = await createImageUrl(layoutImage);
        if (!mounted) return;
        img.src = dataUrl;

      } catch (error) {
        if (!mounted) return;
        console.error('Error in image loading process:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to process layout image'
        }));
      }
    };

    loadImage();

    return () => {
      mounted = false;
      if (currentImage) {
        currentImage.onload = null;
        currentImage.onerror = null;
      }
      imageRef.current = null;
    };
  }, [layoutImage, createImageUrl, imageLoadAttempt]);

  React.useEffect(() => {
    if (!isImageLoaded) return;

    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    onCanvasReady?.(ctx);
    renderContent(ctx);

    let animationFrameId: number;
    if (renderMode === 'dynamic') {
      const animate = () => {
        renderContent(ctx);
        animationFrameId = requestAnimationFrame(animate);
      };
      animationFrameId = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isImageLoaded, renderContent, onCanvasReady, renderMode]);

  const handleResize = React.useCallback(() => {
    const container = canvasRef.current?.parentElement;
    if (!container) return;

    const { width } = container.getBoundingClientRect();
    const aspectRatio = processedMetadata.layout.height_pixel / processedMetadata.layout.width_pixel;
    
    setCanvasSize(prev => {
      const next = {
        width,
        height: width * aspectRatio
      };
      return prev.width !== next.width || prev.height !== next.height ? next : prev;
    });
  }, [processedMetadata.layout]);

  React.useEffect(() => {
    handleResize();
    const resizeObserver = new ResizeObserver(handleResize);
    const container = canvasRef.current?.parentElement;
    if (container) {
      resizeObserver.observe(container);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [handleResize]);

  React.useEffect(() => {
    if (renderMode === 'static' && isImageLoaded) {
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        renderContent(ctx);
      }
    }
  }, [renderContent, canvasSize, renderMode, isImageLoaded]);

  const handleMouseMove = React.useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!config.enableHover || !onRegionHover) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (canvas.height / rect.height);

    let hoveredRegion: string | null = null;
    processedMetadata.layout.regions.forEach(region => {
      const dimensions = calculateRegionDimensions(region, canvas.width, canvas.height);
      if (
        x >= dimensions.x && 
        x <= dimensions.x + dimensions.width && 
        y >= dimensions.y && 
        y <= dimensions.y + dimensions.height
      ) {
        hoveredRegion = region.name;
      }
    });

    onRegionHover(hoveredRegion);
  }, [config.enableHover, onRegionHover, processedMetadata.layout.regions]);

  const handleClick = React.useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!config.enableClick || !onRegionClick) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (canvas.height / rect.height);

    processedMetadata.layout.regions.forEach(region => {
      const dimensions = calculateRegionDimensions(region, canvas.width, canvas.height);
      if (
        x >= dimensions.x && 
        x <= dimensions.x + dimensions.width && 
        y >= dimensions.y && 
        y <= dimensions.y + dimensions.height
      ) {
        onRegionClick(region.name);
      }
    });
  }, [config.enableClick, onRegionClick, processedMetadata.layout.regions]);

  if (state.error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {state.error} (Attempt {imageLoadAttempt + 1}/3)
        </AlertDescription>
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
          style={{ cursor: config.enableClick ? 'pointer' : 'default' }}
          onMouseMove={handleMouseMove}
          onClick={handleClick}
        />
        {children}
      </CardContent>
    </Card>
  );
};

export default BaseWarehouseCanvas;