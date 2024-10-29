import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ActivityRecord } from '@/types/warehouse';
import VisualizationWrapper from '../common/VisualizationWrapper';

interface ActivityDistributionProps {
  data: ActivityRecord[];
  hiddenActivities: Set<string>;
}

const ActivityDistribution: React.FC<ActivityDistributionProps> = ({ data, hiddenActivities }) => {
  const activityData = React.useMemo(() => {
    const summary: Record<string, number> = {};
    
    data.forEach(record => {
      if (!hiddenActivities.has(record.activity)) {
        if (!summary[record.activity]) {
          summary[record.activity] = 0;
        }
        summary[record.activity] += record.duration / 3600; // Convert to hours
      }
    });

    return Object.entries(summary)
      .map(([activity, duration]) => ({
        activity,
        hours: Number(duration.toFixed(2))
      }))
      .sort((a, b) => b.hours - a.hours);
  }, [data, hiddenActivities]);

  return (
    <VisualizationWrapper title="Activity Distribution">
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={activityData}>
            <XAxis dataKey="activity" />
            <YAxis 
              label={{ value: 'Hours', angle: -90, position: 'insideLeft' }}
              tickFormatter={(value) => `${value}h`}
            />
            <Tooltip 
              formatter={(value: number) => [`${value.toFixed(2)} hours`, 'Duration']}
            />
            <Bar dataKey="hours" fill="#4f46e5" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </VisualizationWrapper>
  );
};

export default ActivityDistribution;