import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Settings } from "lucide-react";
import type { FilterSettings, Metadata } from '@/types/warehouse';

interface SettingsSidebarProps {
  metadata: Metadata;
  filterSettings: FilterSettings;
  onFilterChange: (newSettings: FilterSettings) => void;
}

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
  metadata,
  filterSettings,
  onFilterChange,
}) => {
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

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Dashboard Settings</SheetTitle>
        </SheetHeader>
        
        <div className="py-4">
          <h3 className="mb-2 text-sm font-medium">Visible Activities</h3>
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
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SettingsSidebar;