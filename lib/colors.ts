export type ColorScheme = {
    name: string;
    colors: string[];
    background?: string;
    foreground?: string;
  };
  
  export const COLOR_SCHEMES: ColorScheme[] = [
    {
      name: 'Default',
      colors: ['#4f46e5', '#2563eb', '#7c3aed', '#db2777', '#059669', '#d97706'],
    },
    {
      name: 'Blues',
      colors: ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'],
    },
    {
      name: 'Greens',
      colors: ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'],
    },
    {
      name: 'Warm',
      colors: ['#dc2626', '#f59e0b', '#d97706', '#ea580c', '#db2777', '#e11d48'],
    },
    {
      name: 'Cool',
      colors: ['#2dd4bf', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6'],
    },
    {
      name: 'Gray',
      colors: ['#111827', '#374151', '#4b5563', '#6b7280', '#9ca3af', '#d1d5db'],
    },
  ];
  
  export const getColorScheme = (name: string): ColorScheme => {
    return COLOR_SCHEMES.find(scheme => scheme.name === name) || COLOR_SCHEMES[0];
  };
  
  export const getChartColors = (scheme: ColorScheme, count: number): string[] => {
    const colors = [...scheme.colors];
    while (colors.length < count) {
      colors.push(...scheme.colors);
    }
    return colors.slice(0, count);
  };