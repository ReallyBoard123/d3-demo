import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ActivityRecord } from '@/types/warehouse';
import VisualizationWrapper from '../common/VisualizationWrapper';

interface PeakActivityTimesProps {
  data: ActivityRecord[];
  hiddenActivities: Set<string>;
}

const PeakActivityTimes: React.FC<PeakActivityTimesProps> = ({ data, hiddenActivities }) => {
  const hourlyData = React.useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      total: 0,
      activities: {} as Record<string, number>
    }));

    data.forEach(record => {
      if (hiddenActivities.has(record.activity)) return;
      
      const startHour = Math.floor(record.startTime / 3600) % 24;
      const duration = record.duration / 3600; // Convert to hours
      
      hours[startHour].total += duration;
      if (!hours[startHour].activities[record.activity]) {
        hours[startHour].activities[record.activity] = 0;
      }
      hours[startHour].activities[record.activity] += duration;
    });

    return hours.map(h => ({
      ...h,
      hour: `${h.hour.toString().padStart(2, '0')}:00`,
      total: Number(h.total.toFixed(2))
    }));
  }, [data, hiddenActivities]);

  return (
    <VisualizationWrapper title="Peak Activity Times">
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={hourlyData}>
            <XAxis dataKey="hour" />
            <YAxis 
              label={{ value: 'Hours of Activity', angle: -90, position: 'insideLeft' }}
              tickFormatter={(value) => `${value}h`}
            />
            <Tooltip 
              formatter={(value: number) => [`${value.toFixed(2)} hours`, 'Activity Duration']}
            />
            <Line 
              type="monotone" 
              dataKey="total" 
              stroke="#4f46e5" 
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </VisualizationWrapper>
  );
};

export default PeakActivityTimes;