interface Employee {
  id: string;
  color: string;
  activity: string;
}

interface EmployeeIndicatorProps {
  x: number;
  y: number;
  employees: Employee[];
  scale: number;
}

interface IndicatorConfig {
  circleRadius: number;
  iconSize: number;
  strokeWidth: number;
}

const DEFAULT_CONFIG: IndicatorConfig = {
  circleRadius: 25,
  iconSize: 20,
  strokeWidth: 2
};

export function drawEmployeeIndicator(
  ctx: CanvasRenderingContext2D,
  { x, y, employees, scale }: EmployeeIndicatorProps,
  config: Partial<IndicatorConfig> = {}
): void {
  const { circleRadius, strokeWidth } = { ...DEFAULT_CONFIG, ...config };
  const count = Math.min(employees.length, 8);
  const radius = circleRadius * scale;
  
  // Draw white background circle
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = strokeWidth;
  ctx.stroke();

  if (count === 1) {
    // Single employee - full circle
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = employees[0].color;
    ctx.fill();
    ctx.stroke();
  } else {
    // Multiple employees - pie segments
    const sliceAngle = (2 * Math.PI) / count;
    employees.slice(0, count).forEach((employee, index) => {
      const startAngle = index * sliceAngle - Math.PI / 2;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.arc(x, y, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = employee.color;
      ctx.fill();
      ctx.stroke();
    });
  }

  ctx.globalAlpha = 1;
}

export function calculateIndicatorScale(
  canvasWidth: number,
  defaultWidth: number = 800
): number {
  return canvasWidth / defaultWidth;
}

export default drawEmployeeIndicator;