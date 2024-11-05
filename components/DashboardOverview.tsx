import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Users,  
  Clock, 
  Building2,
  TrendingUp,
  Timer
} from 'lucide-react';
import type { Metadata } from '@/types/warehouse';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  comparisonValue?: string | number;
  icon: React.ReactNode;
  trend?: number;
  helpText?: string;
  isComparable?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ 
  label, 
  value, 
  comparisonValue, 
  icon, 
  trend,
  helpText,
  isComparable = true
}) => (
  <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-100 relative group">
    <div className="p-2 bg-primary/10 rounded-lg">
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
        {label}
        {helpText && (
          <span className="invisible group-hover:visible absolute -top-1 right-2 text-xs bg-gray-800 text-white p-1 rounded">
            {helpText}
          </span>
        )}
      </p>
      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-semibold">{value}</p>
        {isComparable && comparisonValue && (
          <>
            <span className="text-gray-400">vs</span>
            <p className="text-lg text-gray-500">{comparisonValue}</p>
          </>
        )}
      </div>
      {isComparable && trend !== undefined && (
        <div className={cn(
          "text-sm flex items-center gap-1",
          trend > 0 ? "text-green-500" : trend < 0 ? "text-red-500" : "text-gray-500"
        )}>
          <TrendingUp className={cn(
            "h-4 w-4",
            trend < 0 && "rotate-180"
          )} />
          {Math.abs(trend)}%
        </div>
      )}
    </div>
  </div>
);

interface DashboardOverviewProps {
  metadata: Metadata;
  selectedDates: Set<string>;
  comparisonDates: Set<string>;
  isComparisonEnabled: boolean;
  data: Array<{ 
    duration: number;
    date: string;
    id: string;
    region: string;
  }>;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  metadata,
  selectedDates,
  comparisonDates,
  isComparisonEnabled,
  data,
}) => {
  const stats = React.useMemo(() => {
    // Helper function to calculate period stats
    const calculatePeriodStats = (dates: Set<string>) => {
      const periodData = data.filter(record => dates.has(record.date));
      const totalHours = periodData.reduce((sum, record) => sum + record.duration / 3600, 0);
      
      // Calculate average shift duration
      const shifts = periodData.reduce((acc, record) => {
        const key = `${record.date}-${record.id}`;
        if (!acc[key]) {
          acc[key] = { duration: 0, count: 0 };
        }
        acc[key].duration += record.duration / 3600;
        acc[key].count++;
        return acc;
      }, {} as Record<string, { duration: number; count: number; }>);
      
      const avgShiftDuration = Object.values(shifts).reduce((sum, shift) => 
        sum + shift.duration, 0) / Object.keys(shifts).length;

      // Find most occupied region
      const regionStats = periodData.reduce((acc, record) => {
        if (!acc[record.region]) {
          acc[record.region] = 0;
        }
        acc[record.region] += record.duration / 3600;
        return acc;
      }, {} as Record<string, number>);

      const mostOccupiedRegion = Object.entries(regionStats)
        .reduce((max, [region, hours]) => 
          hours > max.hours ? { region, hours } : max
        , { region: '', hours: 0 });

      return {
        totalHours,
        avgShiftDuration,
        mostOccupiedRegion,
      };
    };

    const selectedStats = calculatePeriodStats(selectedDates);
    const comparisonStats = isComparisonEnabled 
      ? calculatePeriodStats(comparisonDates)
      : null;

    // Calculate trends if comparison is enabled
    const trends = comparisonStats ? {
      hours: ((selectedStats.totalHours / comparisonStats.totalHours - 1) * 100).toFixed(1),
      shiftDuration: ((selectedStats.avgShiftDuration / comparisonStats.avgShiftDuration - 1) * 100).toFixed(1),
      regionOccupancy: selectedStats.mostOccupiedRegion.region === comparisonStats.mostOccupiedRegion.region
        ? ((selectedStats.mostOccupiedRegion.hours / comparisonStats.mostOccupiedRegion.hours - 1) * 100).toFixed(1)
        : undefined
    } : null;

    return {
      selected: selectedStats,
      comparison: comparisonStats,
      trends,
      totalEmployees: metadata.uniqueEmployees,
    };
  }, [data, selectedDates, comparisonDates, isComparisonEnabled, metadata.uniqueEmployees]);

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total Time"
            value={`${stats.selected.totalHours.toFixed(1)}h`}
            comparisonValue={stats.comparison ? `${stats.comparison.totalHours.toFixed(1)}h` : undefined}
            icon={<Clock className="h-5 w-5 text-primary" />}
            trend={stats.trends ? Number(stats.trends.hours) : undefined}
            helpText="Total hours across all activities and employees"
          />
          <StatCard
            label="Avg Active Duration"
            value={`${stats.selected.avgShiftDuration.toFixed(1)}h`}
            comparisonValue={stats.comparison ? `${stats.comparison.avgShiftDuration.toFixed(1)}h` : undefined}
            icon={<Timer className="h-5 w-5 text-primary" />}
            trend={stats.trends ? Number(stats.trends.shiftDuration) : undefined}
            helpText="Average duration of activity for employee shifts"
          />
          <StatCard
            label="Total Employees"
            value={stats.totalEmployees}
            icon={<Users className="h-5 w-5 text-primary" />}
            helpText="Total number of unique employees"
            isComparable={false}
          />
          <StatCard
            label="Busiest Region"
            value={`${stats.selected.mostOccupiedRegion.region} (${stats.selected.mostOccupiedRegion.hours.toFixed(1)}h)`}
            comparisonValue={stats.comparison 
              ? `${stats.comparison.mostOccupiedRegion.region} (${stats.comparison.mostOccupiedRegion.hours.toFixed(1)}h)`
              : undefined}
            icon={<Building2 className="h-5 w-5 text-primary" />}
            trend={stats.trends?.regionOccupancy ? Number(stats.trends.regionOccupancy) : undefined}
            helpText="Region with the most activity hours"
          />
        </div>
      </CardContent>
    </Card>
  );
};