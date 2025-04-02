import { RegionDimensions } from '@/lib/RegionCalculations';

interface Region {
  position_top_left_x: number;
  position_top_left_y: number;
  position_bottom_right_x: number;
  position_bottom_right_y: number;
}

export const calculateRegionDimensions = (region: Region, canvasWidth: number, canvasHeight: number): RegionDimensions => {
  return {
    x: region.position_top_left_x * canvasWidth,
    y: region.position_top_left_y * canvasHeight,
    width: (region.position_bottom_right_x - region.position_top_left_x) * canvasWidth,
    height: (region.position_bottom_right_y - region.position_top_left_y) * canvasHeight
  };
};

export const renderRegionText = (ctx: CanvasRenderingContext2D, text: string, dimensions: RegionDimensions) => {
  const fontSize = Math.min(dimensions.width, dimensions.height) * 0.2;
  ctx.font = `${fontSize}px sans-serif`;
  ctx.fillStyle = '#000';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(
    text,
    dimensions.x + dimensions.width / 2,
    dimensions.y + dimensions.height / 2
  );
}; 