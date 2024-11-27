import React from 'react';
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ActivityRecord, EMPLOYEE_COLORS } from '@/types';

interface ActivityListProps {
 activities: ActivityRecord[];
 className?: string;
}

export const ActivityList: React.FC<ActivityListProps> = ({ 
  activities,
  className 
 }) => {
  const getTextColor = (bgColor: string): string => {
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 125 ? '#000000' : '#ffffff';
  };
 
  return (
    <div className={cn("space-y-2", className)}>
      {activities.map((activity, index) => {
        const employeeColor = EMPLOYEE_COLORS[activity.id.split('-')[1]] || '#ccc';
        const textColor = getTextColor(employeeColor);
        
        return (
          <div
            key={`${activity.id}-${index}`}
            className="flex items-center justify-between p-3 bg-card rounded-lg border border-border transition-colors hover:bg-accent"
          >
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                style={{ 
                  backgroundColor: employeeColor,
                  color: textColor,
                  borderColor: 'transparent'
                }}
              >
                {activity.id}
              </Badge>
              <span className="text-sm font-medium">
                {activity.activity}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {activity.region}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {format(new Date(0, 0, 0, 0, 0, activity.startTime), "HH:mm")}
                {" - "}
                {format(new Date(0, 0, 0, 0, 0, activity.endTime), "HH:mm")}
              </span>
            </div>
          </div>
        );
      })}
      {activities.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          No activities at this time
        </div>
      )}
    </div>
  );
 };

interface TimelineIndicatorProps {
 currentTime: number;
 isPlaying: boolean;
 className?: string;
}

export const TimelineIndicator: React.FC<TimelineIndicatorProps> = ({
 currentTime,
 isPlaying,
 className
}) => {
 return (
   <div className={cn("flex items-center gap-2", className)}>
     <div className={cn(
       "w-2 h-2 rounded-full",
       isPlaying ? "bg-green-500" : "bg-gray-500",
       isPlaying && "animate-pulse"
     )} />
     <span className="text-sm font-medium">
       {format(new Date(0, 0, 0, 0, 0, currentTime), "HH:mm:ss")}
     </span>
   </div>
 );
};

export const TimelineProgress: React.FC<{ 
 progress: number;
 className?: string;
}> = ({ progress, className }) => (
 <div className={cn("w-full bg-secondary rounded-full h-1", className)}>
   <div
     className="bg-primary h-full rounded-full transition-all duration-300"
     style={{ width: `${progress}%` }}
   />
 </div>
);