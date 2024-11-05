import React from 'react';
import { useColorStore, COLOR_SCHEMES } from '@/stores/useColorStore';
import { Label } from "@/components/ui/label";
import { TabsContent } from "@/components/ui/tabs";

const ColorSettingsTab = () => {
  const { globalScheme, setGlobalScheme } = useColorStore();

  const handleSchemeChange = (value: string) => {
    setGlobalScheme(value);
  };

  return (
    <TabsContent value="colors">
      <div className="py-4">
        <h3 className="mb-4 text-sm font-medium">Color Theme</h3>
        <div className="space-y-4">
          {COLOR_SCHEMES.map((scheme) => (
            <div 
              key={scheme.name}
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => handleSchemeChange(scheme.name)}
            >
              <div className={`
                p-0.5 rounded-md border-2 transition-colors
                ${globalScheme === scheme.name ? 'border-primary' : 'border-transparent'}
              `}>
                <div className="flex gap-0.5 rounded-sm overflow-hidden">
                  {scheme.colors.slice(0, 4).map((color, i) => (
                    <div
                      key={i}
                      className="h-5 w-5"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <Label className="text-sm font-normal">
                {scheme.name}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </TabsContent>
  );
};

export default ColorSettingsTab;