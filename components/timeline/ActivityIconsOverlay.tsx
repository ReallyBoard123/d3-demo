import React from 'react';
import { 
  SquareArrowDown, 
  SquareArrowUp, 
  Box, 
  Car, 
  PersonStanding,
  Footprints,
  MapPinHouse,
  CircleHelp,
  type LucideIcon
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ActivityType = 'Drive' | 'Walk' | 'Stand' | 'Handle up' | 'Handle down' | 'Handle center' | 'Sit' | 'Unknown';

const ACTIVITY_ICONS: Record<ActivityType, LucideIcon> = {
  'Drive': Car,
  'Walk': Footprints,
  'Stand': PersonStanding,
  'Handle up': SquareArrowUp,
  'Handle down': SquareArrowDown,
  'Handle center': Box,
  'Sit': MapPinHouse,
  'Unknown': CircleHelp
};

// Pre-calculated optimal positions for 1-8 employees relative to center
export const EMPLOYEE_POSITIONS = {
  1: [{ x: 0, y: 0 }],  // Center
  2: [  // Left and right
    { x: -0.6, y: 0 },
    { x: 0.6, y: 0 }
  ],
  3: [  // Triangle formation
    { x: -0.5, y: -0.3 },  // Top left
    { x: 0.5, y: -0.3 },   // Top right
    { x: 0, y: 0.6 }       // Bottom
  ],
  4: [  // Square formation
    { x: -0.4, y: -0.4 },  // Top left
    { x: 0.4, y: -0.4 },   // Top right
    { x: 0.4, y: 0.4 },    // Bottom right
    { x: -0.4, y: 0.4 }    // Bottom left
  ],
  5: [  // Pentagon formation
    { x: 0, y: -0.6 },     // Top
    { x: 0.6, y: -0.2 },   // Upper right
    { x: 0.4, y: 0.5 },    // Lower right
    { x: -0.4, y: 0.5 },   // Lower left
    { x: -0.6, y: -0.2 }   // Upper left
  ],
  6: [  // Hexagon formation
    { x: -0.5, y: -0.4 },  // Top left
    { x: 0.5, y: -0.4 },   // Top right
    { x: 0.6, y: 0 },      // Right
    { x: 0.3, y: 0.5 },    // Bottom right
    { x: -0.3, y: 0.5 },   // Bottom left
    { x: -0.6, y: 0 }      // Left
  ],
  7: [  // Heptagon formation
    { x: 0, y: -0.6 },     // Top
    { x: 0.5, y: -0.4 },   // Upper right
    { x: 0.6, y: 0.1 },    // Right
    { x: 0.3, y: 0.5 },    // Lower right
    { x: -0.3, y: 0.5 },   // Lower left
    { x: -0.6, y: 0.1 },   // Left
    { x: -0.5, y: -0.4 }   // Upper left
  ],
  8: [  // Octagon formation
    { x: 0, y: -0.6 },     // Top
    { x: 0.5, y: -0.4 },   // Upper right
    { x: 0.6, y: 0.1 },    // Right
    { x: 0.3, y: 0.5 },    // Lower right
    { x: -0.3, y: 0.5 },   // Lower left
    { x: -0.6, y: 0.1 },   // Left
    { x: -0.5, y: -0.4 },  // Upper left
    { x: 0, y: 0 }         // Center
  ]
} as const;

interface ActivityIconsOverlayProps {
  activities: Array<{
    id: string;
    activity: string;
    x: number;
    y: number;
    color: string;
    employeeId: string;
    size: number;
    placement?: { x: number; y: number };  // Optional placement override
  }>;
}

export const ActivityIconsOverlay: React.FC<ActivityIconsOverlayProps> = ({ activities }) => {
  const getTextColor = (bgColor: string): string => {
    const rgb = parseInt(bgColor.slice(1), 16);
    const brightness = ((rgb >> 16) * 0.299 + ((rgb >> 8) & 255) * 0.587 + (rgb & 255) * 0.114) / 255;
    return brightness > 0.5 ? '#000000' : '#ffffff';
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {activities.map((activity, index) => {
        const IconComponent = ACTIVITY_ICONS[activity.activity as ActivityType];
        if (!IconComponent) return null;

        const x = activity.placement ? 
          activity.x + (activity.placement.x * activity.size * 1.5) :
          activity.x;
        
        const y = activity.placement ? 
          activity.y + (activity.placement.y * activity.size * 1.5) :
          activity.y;

        return (
          <TooltipProvider key={`${activity.employeeId}-${index}`}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-help"
                  style={{
                    left: `${x}px`,
                    top: `${y}px`,
                    zIndex: 10
                  }}
                >
                  <IconComponent
                    size={activity.size}
                    color={getTextColor(activity.color)}
                    strokeWidth={2}
                    className="drop-shadow-md"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-sm">
                  <p>Employee: {activity.employeeId}</p>
                  <p>Activity: {activity.activity}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );
};

export default ActivityIconsOverlay;