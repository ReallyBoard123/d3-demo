interface BoxDimensions {
  width: number;
  height: number;
}

interface TextPlacementProps {
  text: string;
  dimensions: BoxDimensions;
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
}

export const calculateTextLayout = (dimensions: BoxDimensions) => {
  const aspectRatio = dimensions.width / dimensions.height;
  
  if (aspectRatio < 0.8) {
    return 'vertical';
  } else if (aspectRatio > 1.2) {
    return 'horizontal';
  } else {
    return 'square';
  }
};

export const drawText = ({
  text,
  dimensions,
  ctx,
  x,
  y
}: TextPlacementProps) => {
  const layout = calculateTextLayout(dimensions);
  const minDimension = Math.min(dimensions.width, dimensions.height);
  
  // Base font size on minimum dimension
  const baseFontSize = Math.min(minDimension / 5, 14);
  
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  switch (layout) {
    case 'vertical':
      // For vertical boxes, rotate text 90 degrees
      ctx.translate(x, y);
      ctx.rotate(-Math.PI / 2);
      ctx.font = `${baseFontSize}px Inter, sans-serif`;
      break;
      
    case 'horizontal':
      // For horizontal boxes, keep text horizontal
      ctx.font = `${baseFontSize}px Inter, sans-serif`;
      break;
      
    case 'square':
      // For square boxes, use standard horizontal alignment
      ctx.font = `${baseFontSize}px Inter, sans-serif`;
      break;
  }

  // Add white outline for better visibility
  ctx.strokeStyle = 'white';
  ctx.lineWidth = baseFontSize / 6;
  ctx.strokeText(text, layout === 'vertical' ? 0 : x, layout === 'vertical' ? 0 : y);
  
  // Draw the actual text
  ctx.fillStyle = 'black';
  ctx.fillText(text, layout === 'vertical' ? 0 : x, layout === 'vertical' ? 0 : y);
  
  ctx.restore();
};

export const measureText = (
  text: string,
  fontSize: number,
  ctx: CanvasRenderingContext2D
): { width: number; height: number } => {
  ctx.save();
  ctx.font = `${fontSize}px Inter, sans-serif`;
  const metrics = ctx.measureText(text);
  ctx.restore();
  
  return {
    width: metrics.width,
    height: fontSize
  };
};