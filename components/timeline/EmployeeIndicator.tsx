interface Employee {
  id: string;
  color: string;
}

interface EmployeeIndicatorProps {
  x: number;
  y: number;
  employees: Employee[];
}

// Define a fixed size for ALL employee indicators
const FIXED_RADIUS = 25; // Increased size for better visibility

export const drawEmployeeIndicator = (
  ctx: CanvasRenderingContext2D,
  { x, y, employees }: EmployeeIndicatorProps
): void => {
  // Draw the circle background
  ctx.beginPath();
  ctx.arc(x, y, FIXED_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 2;
  ctx.stroke();

  if (employees.length === 1) {
    // Single employee - draw circle with letter
    ctx.beginPath();
    ctx.arc(x, y, FIXED_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = employees[0].color;
    ctx.fill();
    ctx.stroke();

    // Draw the letter
    ctx.fillStyle = "#ffffff";
    ctx.font = `${Math.floor(FIXED_RADIUS * 0.8)}px sans-serif`; // Slightly smaller font for better fit
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(employees[0].id.split('-')[1] || employees[0].id, x, y);
  } else {
    // Multiple employees - draw pie chart with the SAME fixed radius
    const sliceAngle = (Math.PI * 2) / employees.length;
    employees.forEach((employee, index) => {
      const startAngle = index * sliceAngle - Math.PI / 2;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.arc(x, y, FIXED_RADIUS, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = employee.color;
      ctx.fill();
      ctx.stroke();
    });
  }
};

export default drawEmployeeIndicator;