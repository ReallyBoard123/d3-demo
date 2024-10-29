import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ActivityRecord } from '@/types/warehouse';
import VisualizationWrapper from '../common/VisualizationWrapper';

interface EmployeeActivityProps {
  data: ActivityRecord[];
  hiddenActivities: Set<string>;
}

const EmployeeActivity: React.FC<EmployeeActivityProps> = ({ data, hiddenActivities }) => {
  const employeeData = React.useMemo(() => {
    const summary: Record<string, Record<string, number>> = {};
    const activities = new Set<string>();

    // Initialize employee summaries
    data.forEach(record => {
      if (!hiddenActivities.has(record.activity)) {
        if (!summary[record.id]) {
          summary[record.id] = {};
        }
        if (!summary[record.id][record.activity]) {
          summary[record.id][record.activity] = 0;
        }
        summary[record.id][record.activity] += record.duration / 3600; // Convert to hours
        activities.add(record.activity);
      }
    });

    // Convert to chart format
    return Object.entries(summary).map(([employeeId, activities]) => ({
      employee: employeeId,
      ...activities,
      total: Object.values(activities).reduce((sum, duration) => sum + duration, 0)
    }));
  }, [data, hiddenActivities]);

  const activities = React.useMemo(() => {
    const uniqueActivities = new Set<string>();
    data.forEach(record => {
      if (!hiddenActivities.has(record.activity)) {
        uniqueActivities.add(record.activity);
      }
    });
    return Array.from(uniqueActivities);
  }, [data, hiddenActivities]);

  // Generate colors for activities
  const colors = ['#4f46e5', '#2563eb', '#7c3aed', '#db2777', '#059669', '#d97706'];

  return (
    <VisualizationWrapper title="Employee Activity Summary">
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={employeeData}
            layout="vertical"
            margin={{ left: 20 }}
          >
            <XAxis type="number" tickFormatter={(value) => `${value}h`} />
            <YAxis type="category" dataKey="employee" width={60} />
            <Tooltip 
              formatter={(value: number) => [`${value.toFixed(1)} hours`, 'Duration']}
            />
            <Legend />
            {activities.map((activity, index) => (
              <Bar
                key={activity}
                dataKey={activity}
                stackId="stack"
                fill={colors[index % colors.length]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </VisualizationWrapper>
  );
};

export default EmployeeActivity;