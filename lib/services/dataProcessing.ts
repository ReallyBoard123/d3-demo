import { ActivityRecord, ChartConfig } from '@/types';
import { TimelineVisualization } from '@/components/visualizations/timeline';
import { ActivityHeatmap } from '@/components/visualizations/activity-heatmap';
import { ActivityDistribution } from '@/components/visualizations/activity-distribution';
import { EmployeeActivity } from '@/components/visualizations/employee-activity';
import { PeakActivityTimes } from '@/components/visualizations/peak-activity';
import { RegionHeatmap } from '@/components/visualizations/region-heatmap';
import { TranslationPath } from '@/config/translations/translations';

export interface ProcessedMetadata {
  totalRecords: number;
  dateRange: {
    start: string;
    end: string;
  };
  uniqueEmployees: number;
  uniqueRegions: number;
  uniqueActivities: string[];
  expectedEmployeeCount: number;
}

export interface DateMetrics {
  employeeCount: number;
  totalDuration: number;
  missingEmployees: string[];
}

export const createChartConfigs = (t: (key: TranslationPath) => string): readonly ChartConfig[] => [
  { 
    id: 'activity-timeline',
    title: t('dashboard.activityTimeline'), 
    component: TimelineVisualization,
    fullWidth: true, 
    defaultVisible: true  
  },
  {
    id: 'activity-heatmap',
    title: t('dashboard.regionHeatmap'),
    component: ActivityHeatmap,
    fullWidth: true,
    defaultVisible: true
  },
  { 
    id: 'activity-distribution', 
    title: t('dashboard.activityDistribution'), 
    component: ActivityDistribution,
    defaultVisible: true
  },
  { 
    id: 'employee-activity', 
    title: t('dashboard.employeeActivity'), 
    component: EmployeeActivity,
    defaultVisible: true
  },
  { 
    id: 'peak-activity', 
    title: t('dashboard.peakActivityTimes'), 
    component: PeakActivityTimes,
    defaultVisible: true
  },
  { 
    id: 'region-heatmap', 
    title: t('dashboard.regionHeatmap'), 
    component: RegionHeatmap,
    defaultVisible: true
  },
] as const;

export const processBasicMetadata = (data: ActivityRecord[]) => {
  const uniqueEmployees = new Set<string>();
  const uniqueActivities = new Set<string>();
  const uniqueRegions = new Set<string>();
  const uniqueDates = new Set<string>();
  
  data.forEach(record => {
    uniqueEmployees.add(record.id);
    uniqueActivities.add(record.activity);
    uniqueRegions.add(record.region);
    uniqueDates.add(record.date);
  });

  return {
    employeeCount: uniqueEmployees.size,
    activities: Array.from(uniqueActivities),
    regions: Array.from(uniqueRegions),
    dates: Array.from(uniqueDates).sort(),
  };
};

export const processDateMetrics = (data: ActivityRecord[], dates: string[], allEmployees: Set<string>): Record<string, DateMetrics> => {
  const metrics: Record<string, DateMetrics> = {};
  
  dates.forEach(date => {
    metrics[date] = {
      employeeCount: 0,
      totalDuration: 0,
      missingEmployees: []
    };
  });

  const dateEmployees = new Map<string, Set<string>>();
  
  data.forEach(record => {
    const dateKey = record.date;
    if (!dateEmployees.has(dateKey)) {
      dateEmployees.set(dateKey, new Set());
    }
    dateEmployees.get(dateKey)!.add(record.id);
    metrics[dateKey].totalDuration += record.duration;
  });

  dateEmployees.forEach((presentEmployees, date) => {
    metrics[date].employeeCount = presentEmployees.size;
    metrics[date].missingEmployees = Array.from(allEmployees)
      .filter(id => !presentEmployees.has(id));
  });

  return metrics;
};

export const createMetadata = (data: ActivityRecord[], basicMetadata: ReturnType<typeof processBasicMetadata>): ProcessedMetadata => ({
  totalRecords: data.length,
  dateRange: {
    start: basicMetadata.dates[0],
    end: basicMetadata.dates[basicMetadata.dates.length - 1]
  },
  uniqueEmployees: basicMetadata.employeeCount,
  uniqueRegions: basicMetadata.regions.length,
  uniqueActivities: basicMetadata.activities,
  expectedEmployeeCount: basicMetadata.employeeCount
});

export const filterData = (data: ActivityRecord[], hiddenActivities: Set<string>) => {
  const hiddenActivitiesArray = Array.from(hiddenActivities);
  return data.filter(record => !hiddenActivitiesArray.includes(record.activity));
}; 