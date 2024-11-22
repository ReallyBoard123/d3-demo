import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

export const getNextBusinessDay = (date: Date): Date => {
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  while (isWeekend(nextDay)) {
    nextDay.setDate(nextDay.getDate() + 1);
  }
  return nextDay;
};

interface DateGroup {
  start: Date;
  end: Date;
}

export const groupContinuousDates = (dates: Date[]): DateGroup[] => {
  if (dates.length === 0) return [];
  if (dates.length === 1) return [{ start: dates[0], end: dates[0] }];

  const sortedDates = [...dates].sort((a, b) => a.getTime() - b.getTime());
  const groups: DateGroup[] = [];
  let currentGroup: DateGroup = { start: sortedDates[0], end: sortedDates[0] };

  for (let i = 1; i < sortedDates.length; i++) {
    const currentDate = sortedDates[i];
    const prevDate = sortedDates[i - 1];
    const dayDiff = (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);

    if (dayDiff <= 1 || (dayDiff <= 3 && isWeekend(new Date(prevDate.getTime() + 24 * 60 * 60 * 1000)))) {
      currentGroup.end = currentDate;
    } else {
      groups.push(currentGroup);
      currentGroup = { start: currentDate, end: currentDate };
    }
  }
  
  groups.push(currentGroup);
  return groups;
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateGroup = (group: DateGroup): string => {
  if (group.start.getTime() === group.end.getTime()) {
    return formatDate(group.start);
  }
  return `${formatDate(group.start)} - ${formatDate(group.end)}`;
};

export const formatDateRange = (dates: Set<string>): string => {
  if (dates.size === 0) return '';
  
  const dateObjects = Array.from(dates).map(d => new Date(d));
  const groups = groupContinuousDates(dateObjects);
  
  return groups
    .map(group => formatDateGroup(group))
    .join(', ');
};

export const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${Math.round(seconds)}sec`;
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours === 0) {
    const remainingSeconds = Math.round(seconds % 60);
    return remainingSeconds > 0 ? `${minutes}min ${remainingSeconds}sec` : `${minutes}min`;
  } 
  
  return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
};