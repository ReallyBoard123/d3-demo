import React from 'react';
import { cn } from '@/lib/utils';

export interface LegendItem {
  label: string;
  color: string;
  value?: string | number;
  inactive?: boolean;
  onClick?: () => void;
  comparison?: {
    value: string | number;
    color: string;  // Make color required for comparison items
  };
}

interface ChartLegendProps {
  items: LegendItem[];
  className?: string;
  showComparison?: boolean;
}

export const ChartLegend: React.FC<ChartLegendProps> = ({ 
  items, 
  className,
  showComparison 
}) => {
  return (
    <div className={cn("flex flex-wrap gap-4 justify-center", className)}>
      {items.map((item, index) => (
        <button
          key={index}
          onClick={item.onClick}
          className={cn(
            "flex items-center gap-2 px-2 py-1 rounded-lg transition-colors",
            item.onClick && "hover:bg-gray-100",
            item.inactive && "opacity-40"
          )}
        >
          <div className="flex items-center gap-1.5">
            <div className="flex space-x-1">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: item.color }}
              />
              {showComparison && item.comparison && (
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: item.comparison.color }}
                />
              )}
            </div>
            <span className="text-sm font-medium">{item.label}</span>
          </div>
          {(item.value || (showComparison && item.comparison)) && (
            <div className="flex items-center gap-2">
              {item.value && (
                <span className="text-sm text-gray-600">{item.value}</span>
              )}
              {showComparison && item.comparison && (
                <span className="text-sm text-gray-400">
                  vs {item.comparison.value}
                </span>
              )}
            </div>
          )}
        </button>
      ))}
    </div>
  );
};