import React from 'react';
import { useTranslation } from '@/hooks/useTranslation'

export interface ActivityEntry {
  dataKey: string;
  value: number;
  color: string;
  name?: string;
}

export interface DateRangeDisplay {
  selected: string;
  comparison: string | null
}

interface ActivityTooltipProps {
  active?: boolean;
  payload?: ActivityEntry[];
  label?: string;
  dateDisplay: DateRangeDisplay;
  isComparisonEnabled: boolean;
  valueFormatter?: (value: number) => string;
  labelKey?: string;
}

export const ActivityTooltip: React.FC<ActivityTooltipProps> = ({
  active,
  payload,
  label,
  dateDisplay,
  isComparisonEnabled,
  valueFormatter = (value) => `${value}`,
  labelKey = 'activity'
}) => {
  const { t, translateActivity } = useTranslation();
  
  if (!active || !payload) return null;

  const selectedActivities = payload.filter(p => p.dataKey.includes('selected'));
  const comparisonActivities = payload.filter(p => p.dataKey.includes('comparison'));

  const formatActivityName = (dataKey: string): string => {
    const name = dataKey
      .replace('_selected', '')
      .replace('_comparison', '')
      .replace(labelKey, '');
      
    if (name === 'selected') {
      return t('activityTooltip.selected');
    }
    if (name === 'comparison') {
      return t('activityTooltip.comparison');
    }
  
    return translateActivity(name);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
      <p className="font-medium mb-2">{translateActivity(label || '')}</p>
      
      <div className="mb-3">
        <p className="text-sm text-gray-600 mb-1">
          {dateDisplay.selected}
        </p>
        {selectedActivities.map((entry) => (
          <div key={entry.dataKey} className="flex justify-between text-sm">
            <span style={{ color: entry.color }}>
              {formatActivityName(entry.dataKey)}:
            </span>
            <span className="ml-4 font-medium">
              {valueFormatter(entry.value)}
            </span>
          </div>
        ))}
      </div>

      {isComparisonEnabled && comparisonActivities.length > 0 && dateDisplay.comparison && (
        <div>
          <p className="text-sm text-gray-600 mb-1">
            {dateDisplay.comparison}
          </p>
          {comparisonActivities.map((entry) => (
            <div key={entry.dataKey} className="flex justify-between text-sm">
              <span style={{ color: entry.color }}>
                {formatActivityName(entry.dataKey)}:
              </span>
              <span className="ml-4 font-medium">
                {valueFormatter(entry.value)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};