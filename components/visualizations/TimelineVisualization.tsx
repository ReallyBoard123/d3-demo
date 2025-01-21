import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import type { BaseActivityProps } from '@/types/activity';
import type { TimelineState, TimelineSpeed } from '@/types/timeline';
import { TIMELINE_CONSTANTS } from '@/types/timeline';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import TimelineControls from '../timeline/TimelineControls';
import WarehouseCanvas from '../timeline/WarehouseCanvas';
import { ActivityList } from './ActivityTimeline';
import { useProcessMetadata } from '@/hooks/useProcessMetadata';
import { useTranslation } from '@/hooks/useTranslation';

const TimelineVisualization: React.FC<BaseActivityProps> = ({ 
 data,
 hiddenActivities,
 selectedDates
}) => {
 const { t } = useTranslation();
 const { processMetadata, layoutImage } = useProcessMetadata();
 const [state, setState] = React.useState<TimelineState>({
   currentTime: 0,
   isPlaying: false,
   speed: 1,
   selectedDate: Array.from(selectedDates)[0] || "",
   selectedEmployee: null,
 });

 const getCurrentActivities = React.useCallback(() => {
   return data.filter(
     record => 
       record.date === state.selectedDate &&
       record.startTime <= state.currentTime &&
       record.endTime >= state.currentTime &&
       !hiddenActivities.has(record.activity) &&
       (!state.selectedEmployee || state.selectedEmployee === TIMELINE_CONSTANTS.ALL_EMPLOYEES || 
        record.id === state.selectedEmployee)
   );
 }, [data, state.selectedDate, state.currentTime, state.selectedEmployee, hiddenActivities]);

 const currentActivities = getCurrentActivities();
 const timeRange = React.useMemo(() => {
   const selectedData = data.filter(record => 
     record.date === state.selectedDate && 
     !hiddenActivities.has(record.activity)
   );

   if (selectedData.length === 0) {
     return { start: 0, end: TIMELINE_CONSTANTS.SECONDS_PER_DAY };
   }

   const startTimes = selectedData.map(r => r.startTime);
   const endTimes = selectedData.map(r => r.endTime);

   return {
     start: Math.max(0, Math.min(...startTimes) - 300), // 5 min padding
     end: Math.min(TIMELINE_CONSTANTS.SECONDS_PER_DAY, Math.max(...endTimes) + 300)
   };
 }, [data, state.selectedDate, hiddenActivities]);

 const uniqueEmployees = React.useMemo(() => 
   Array.from(new Set(data.map(record => record.id))).sort(),
   [data]
 );

 const uniqueDates = React.useMemo(() => 
   Array.from(selectedDates).sort(),
   [selectedDates]
 );

 React.useEffect(() => {
   if (uniqueDates.length > 0 && !uniqueDates.includes(state.selectedDate)) {
     setState(prev => ({ 
       ...prev, 
       selectedDate: uniqueDates[0],
       currentTime: timeRange.start
     }));
   }
 }, [uniqueDates, state.selectedDate, timeRange.start]);

 React.useEffect(() => {
   setState(prev => ({
     ...prev,
     currentTime: timeRange.start
   }));
 }, [timeRange.start]);

 React.useEffect(() => {
   let animationFrameId: number;
   let lastTimestamp: number;

   const animate = (timestamp: number) => {
     if (!lastTimestamp) lastTimestamp = timestamp;
     
     const elapsed = timestamp - lastTimestamp;
     if (elapsed >= TIMELINE_CONSTANTS.FRAME_INTERVAL) {
       setState(prev => {
         const newTime = prev.currentTime + (prev.speed / 60);
         if (newTime >= timeRange.end) {
           return { ...prev, currentTime: timeRange.start };
         }
         return { ...prev, currentTime: newTime };
       });
       lastTimestamp = timestamp;
     }
     
     animationFrameId = requestAnimationFrame(animate);
   };

   if (state.isPlaying) {
     animationFrameId = requestAnimationFrame(animate);
   }

   return () => {
     if (animationFrameId) {
       cancelAnimationFrame(animationFrameId);
     }
   };
 }, [state.isPlaying, state.speed, timeRange.end, timeRange.start]);

 if (!state.selectedDate) {
   return (
     <Alert variant="destructive">
       <AlertCircle className="h-4 w-4" />
       <AlertDescription>
         {t('timeline.noDataAvailable')}
       </AlertDescription>
     </Alert>
   );
 }

 return (
   <div className="flex flex-col h-full">
     <div className="flex justify-end items-center gap-4 p-4">
       <Select
         value={state.selectedDate}
         onValueChange={(date) => setState(prev => ({ 
           ...prev, 
           selectedDate: date,
           currentTime: timeRange.start
         }))}
       >
         <SelectTrigger className="w-[180px]">
           <SelectValue placeholder={t('timeline.selectDate')} />
         </SelectTrigger>
         <SelectContent>
           {uniqueDates.map(date => (
             <SelectItem key={date} value={date}>
               {format(new Date(date), "MMM d, yyyy")}
             </SelectItem>
           ))}
         </SelectContent>
       </Select>

       <Select
         value={state.selectedEmployee ?? TIMELINE_CONSTANTS.ALL_EMPLOYEES}
         onValueChange={(employee) => setState(prev => ({ 
           ...prev, 
           selectedEmployee: employee === TIMELINE_CONSTANTS.ALL_EMPLOYEES ? null : employee 
         }))}
       >
         <SelectTrigger className="w-[180px]">
           <SelectValue placeholder={t('dashboard.selectEmployee')} />
         </SelectTrigger>
         <SelectContent>
           <SelectItem value={TIMELINE_CONSTANTS.ALL_EMPLOYEES}>
             {t('dashboard.allEmployees')}
           </SelectItem>
           {uniqueEmployees.map(id => (
             <SelectItem key={id} value={id}>
               {t('timeline.employee', { id })}
             </SelectItem>
           ))}
         </SelectContent>
       </Select>
     </div>

     <ResizablePanelGroup direction="horizontal" className="flex-1">
       <ResizablePanel defaultSize={60}>
         <div className="h-full p-4">
           <TimelineControls
             isPlaying={state.isPlaying}
             speed={state.speed}
             currentTime={state.currentTime}
             selectedDate={state.selectedDate}
             timeRange={timeRange}
             onPlayPause={() => setState(prev => ({ ...prev, isPlaying: !prev.isPlaying }))}
             onSpeedChange={(speed: number) => setState(prev => ({ ...prev, speed: speed as TimelineSpeed }))}
             onTimeChange={(time: number) => setState(prev => ({ ...prev, currentTime: time }))}
           />
           <ActivityList activities={currentActivities} className="mt-4" />
         </div>
       </ResizablePanel>
       <ResizableHandle />
       <ResizablePanel defaultSize={40}>
         {processMetadata && layoutImage && (
           <div className="h-full p-4">
             <WarehouseCanvas
               layoutImage={layoutImage}
               metadata={processMetadata}
               currentActivities={currentActivities}
             />
           </div>
         )}
       </ResizablePanel>
     </ResizablePanelGroup>
   </div>
 );
};

export default TimelineVisualization;