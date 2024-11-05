import React from 'react';
import { useColorStore, COLOR_SCHEMES, type ColorPalette } from '@/stores/useColorStore';
import { Label } from "@/components/ui/label";
import { TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { ColorPaletteGenerator } from '../ColorPalleteGenerator';

interface ColorSchemeOptionProps {
  name: string;
  colors: ColorPalette;
  isSelected: boolean;
  isCustom?: boolean;
  onSelect: () => void;
  onDelete?: () => void;
}

const ColorSchemeOption: React.FC<ColorSchemeOptionProps> = ({
  name,
  colors,
  isSelected,
  isCustom,
  onSelect,
  onDelete
}) => {
  const renderColorStrip = (colors: string[]) => (
    <div className="flex gap-0.5 rounded-sm overflow-hidden">
      {colors.slice(0, 4).map((color, i) => (
        <div
          key={i}
          className="h-5 w-5"
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );

  return (
    <div className="flex items-center justify-between group">
      <div 
        className="flex items-center space-x-2 cursor-pointer flex-1"
        onClick={onSelect}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => e.key === 'Enter' && onSelect()}
      >
        <div className={`
          p-0.5 rounded-md border-2 transition-colors
          ${isSelected ? 'border-primary' : 'border-transparent'}
        `}>
          <div className="space-y-0.5">
            {renderColorStrip(colors.primary)}
            {renderColorStrip(colors.comparison)}
          </div>
        </div>
        <Label className="text-sm font-normal">
          {name}
        </Label>
      </div>
      {isCustom && onDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          title="Delete theme"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

const ColorSettingsTab: React.FC = () => {
  const { 
    globalScheme,   
    setGlobalScheme, 
    saveCustomPalette,
    deleteCustomPalette,
    customPalettes 
  } = useColorStore();

  const [showGenerator, setShowGenerator] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSave = (name: string, palette: ColorPalette) => {
    if (COLOR_SCHEMES.some(scheme => scheme.name === name)) {
      setError("Cannot use a preset theme name. Please choose a different name.");
      return;
    }
    if (name.trim()) {
      saveCustomPalette(name, palette);
      setShowGenerator(false);
      setError(null);
    }
  };

  return (
    <TabsContent value="colors">
      <ScrollArea className="h-[400px] pr-4">
        <div className="py-4 space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">Preset Themes</h3>
            </div>
            <div className="space-y-4">
              {COLOR_SCHEMES.map((scheme) => (
                <ColorSchemeOption
                  key={scheme.name}
                  name={scheme.name}
                  colors={scheme.colors}
                  isSelected={globalScheme === scheme.name}
                  onSelect={() => setGlobalScheme(scheme.name)}
                />
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">Custom Themes</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowGenerator(!showGenerator)}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                {showGenerator ? 'Cancel' : 'Create New'}
              </Button>
            </div>

            {Object.entries(customPalettes).length > 0 && (
              <div className="space-y-4 mb-6">
                {Object.entries(customPalettes).map(([name, palette]) => (
                  <ColorSchemeOption
                    key={name}
                    name={name}
                    colors={palette}
                    isSelected={globalScheme === name}
                    isCustom
                    onSelect={() => setGlobalScheme(name)}
                    onDelete={() => deleteCustomPalette(name)}
                  />
                ))}
              </div>
            )}

            {showGenerator && (
              <ColorPaletteGenerator
                onSave={handleSave}
                onCancel={() => {
                  setShowGenerator(false);
                  setError(null);
                }}
              />
            )}
          </div>
        </div>
      </ScrollArea>
    </TabsContent>
  );
};

export default ColorSettingsTab;