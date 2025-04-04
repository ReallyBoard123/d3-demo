import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Settings } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateSelection } from '@/components/DateSelection';
import ColorSettingsTab from './common/ColorSettingsTab';
import { ChartId, SettingsSidebarProps } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
  metadata,
  dateMetrics,
  filterSettings,
  onFilterChange,
  availableCharts,
}) => {
  const { t } = useTranslation();

  const toggleActivity = (activity: string) => {
    const newHiddenActivities = new Set(filterSettings.hiddenActivities);
    if (newHiddenActivities.has(activity)) {
      newHiddenActivities.delete(activity);
    } else {
      newHiddenActivities.add(activity);
    }
    onFilterChange({
      ...filterSettings,
      hiddenActivities: newHiddenActivities,
    });
  };

  const toggleChart = (chartId: ChartId) => {
    const newVisibleCharts = new Set(filterSettings.visibleCharts);
    if (newVisibleCharts.has(chartId)) {
      newVisibleCharts.delete(chartId);
    } else {
      newVisibleCharts.add(chartId);
    }
    onFilterChange({
      ...filterSettings,
      visibleCharts: newVisibleCharts,
    });
  };

  const availableDates = React.useMemo(() => {
    const dates: string[] = [];
    const start = new Date(metadata.dateRange.start);
    const end = new Date(metadata.dateRange.end);
    
    for (let date = start; date <= end; date.setDate(date.getDate() + 1)) {
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates.sort();
  }, [metadata.dateRange]);

  const handleDateToggle = (date: string, isComparison: boolean) => {
    const targetSet = isComparison ? 'comparisonDates' : 'selectedDates';
    const newDates = new Set(filterSettings[targetSet]);
    
    if (newDates.has(date)) {
      newDates.delete(date);
    } else {
      newDates.add(date);
    }

    onFilterChange({
      ...filterSettings,
      [targetSet]: newDates,
    });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px]">
        <SheetHeader>
          <SheetTitle>{t('settings.title')}</SheetTitle>
        </SheetHeader>
        
        <Tabs defaultValue="activities" className="w-full mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="activities">{t('settings.tabs.activities')}</TabsTrigger>
            <TabsTrigger value="dates">{t('settings.tabs.dates')}</TabsTrigger>
            <TabsTrigger value="charts">{t('settings.tabs.charts')}</TabsTrigger>
            <TabsTrigger value="colors">{t('settings.tabs.colors')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="activities">
            <div className="py-4">
              <h3 className="mb-2 text-sm font-medium">{t('settings.activities.visibleActivities')}</h3>
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-2">
                  {metadata.uniqueActivities.map((activity) => (
                    <div key={activity} className="flex items-center justify-between">
                      <span className="text-sm">{activity}</span>
                      <Switch
                        checked={!filterSettings.hiddenActivities.has(activity)}
                        onCheckedChange={() => toggleActivity(activity)}
                      />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
          
          <TabsContent value="dates">
            <div className="py-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium">{t('settings.dates.dateSelection')}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{t('settings.dates.compareMode')}</span>
                  <Switch
                    checked={filterSettings.isComparisonEnabled}
                    onCheckedChange={(checked) => 
                      onFilterChange({
                        ...filterSettings,
                        isComparisonEnabled: checked,
                        comparisonDates: checked ? filterSettings.comparisonDates : new Set()
                      })
                    }
                  />
                </div>
              </div>
              
              <DateSelection
                dates={availableDates}
                dateMetrics={dateMetrics}
                selectedDates={filterSettings.selectedDates}
                comparisonDates={filterSettings.comparisonDates}
                isComparisonEnabled={filterSettings.isComparisonEnabled}
                expectedEmployeeCount={metadata.expectedEmployeeCount}
                onDateToggle={handleDateToggle}
              />
              
              {filterSettings.isComparisonEnabled && (
                <div className="mt-4">
                  <p className="text-xs text-muted-foreground">
                    {t('settings.dates.compareModeHelp')}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="charts">
            <div className="py-4">
              <h3 className="mb-2 text-sm font-medium">{t('settings.charts.visibleCharts')}</h3>
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-2">
                  {availableCharts.map((chart) => (
                    <div key={chart.id} className="flex items-center justify-between">
                      <span className="text-sm">{chart.title}</span>
                      <Switch
                        checked={filterSettings.visibleCharts.has(chart.id)}
                        onCheckedChange={() => toggleChart(chart.id)}
                      />
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <p className="text-xs text-muted-foreground mt-4">
                {t('settings.charts.customizeHelp')}
              </p>
            </div>
          </TabsContent>
          
          <ColorSettingsTab />
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default SettingsSidebar;