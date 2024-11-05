import React from 'react';
import { format, parse } from 'date-fns';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Settings } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useColorStore, COLOR_SCHEMES } from '@/stores/useColorStore';
import type { FilterSettings, Metadata } from '@/types/warehouse';
import ColorSettingsTab from './common/ColorSettingsTab';

interface SettingsSidebarProps {
  metadata: Metadata;
  filterSettings: FilterSettings;
  onFilterChange: (newSettings: FilterSettings) => void;
}

const formatDisplayDate = (date: string): string => {
  const parsedDate = parse(date, 'yyyy-MM-dd', new Date());
  return format(parsedDate, 'EEE, MMM d');
};

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
  metadata,
  filterSettings,
  onFilterChange,
}) => {
  const { globalScheme, setGlobalScheme } = useColorStore();
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

  const toggleDate = (date: string) => {
    const newSelectedDates = new Set(filterSettings.selectedDates);
    if (newSelectedDates.has(date)) {
      newSelectedDates.delete(date);
    } else {
      newSelectedDates.add(date);
    }
    onFilterChange({
      ...filterSettings,
      selectedDates: newSelectedDates,
    });
  };

  const toggleComparisonDate = (date: string) => {
    const newComparisonDates = new Set(filterSettings.comparisonDates);
    if (newComparisonDates.has(date)) {
      newComparisonDates.delete(date);
    } else {
      newComparisonDates.add(date);
    }
    onFilterChange({
      ...filterSettings,
      comparisonDates: newComparisonDates,
    });
  };

  // Get all available dates from the metadata date range
  const availableDates = React.useMemo(() => {
    const dates: string[] = [];
    const start = new Date(metadata.dateRange.start);
    const end = new Date(metadata.dateRange.end);
    
    for (let date = start; date <= end; date.setDate(date.getDate() + 1)) {
      dates.push(format(date, 'yyyy-MM-dd'));
    }
    
    return dates;
  }, [metadata.dateRange]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px]">
        <SheetHeader>
          <SheetTitle>Dashboard Settings</SheetTitle>
        </SheetHeader>
        
        <Tabs defaultValue="activities" className="w-full mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="dates">Dates</TabsTrigger>
            <TabsTrigger value="colors">Colors</TabsTrigger>
          </TabsList>
          
          <TabsContent value="activities">
            <div className="py-4">
              <h3 className="mb-2 text-sm font-medium">Visible Activities</h3>
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
                <h3 className="text-sm font-medium">Date Selection</h3>
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
                <span className="text-sm">Enable Comparison</span>
              </div>
              
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-2">
                  {availableDates.map((date) => (
                    <div key={date} className="flex items-center justify-between">
                      <span className="text-sm">{formatDisplayDate(date)}</span>
                      <div className="flex gap-2">
                        <Switch
                          checked={filterSettings.selectedDates.has(date)}
                          onCheckedChange={() => toggleDate(date)}
                        />
                        {filterSettings.isComparisonEnabled && (
                          <Switch
                            checked={filterSettings.comparisonDates.has(date)}
                            onCheckedChange={() => toggleComparisonDate(date)}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              {filterSettings.isComparisonEnabled && (
                <div className="mt-4">
                  <p className="text-xs text-muted-foreground">
                    Select dates to compare. The charts will show data from selected dates
                    compared with comparison dates.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          <ColorSettingsTab />
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default SettingsSidebar;