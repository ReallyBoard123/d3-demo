import React from 'react';
import { useColorStore } from '@/stores/useColorStore';
import { TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ColorPaletteGenerator } from '../ColorPalleteGenerator';
import { ColorSchemeOption } from './ColorSchemeOption';
import { 
  COLOR_SCHEMES,
  type ColorPalette,
} from '@/config/color';

interface EditingState {
  originalName: string;
  palette: ColorPalette;
  isPreset: boolean;
}

const ColorSettingsTab: React.FC = () => {
  const { 
    globalScheme,   
    setGlobalScheme, 
    saveCustomPalette,
    deleteCustomPalette,
    customPalettes 
  } = useColorStore();

  const [showGenerator, setShowGenerator] = React.useState(false);
  const [editingState, setEditingState] = React.useState<EditingState | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleSave = (name: string, palette: ColorPalette) => {
    // If we're editing a preset, force a new name
    if (editingState?.isPreset && name === editingState.originalName) {
      setError("Please provide a new name when saving modified preset theme");
      return;
    }

    // Check for name conflicts with presets
    if (COLOR_SCHEMES.some(scheme => scheme.name === name) && 
        (!editingState || editingState.originalName !== name)) {
      setError("Cannot use a preset theme name. Please choose a different name.");
      return;
    }

    if (name.trim()) {
      saveCustomPalette(name, palette);
      setGlobalScheme(name); // Automatically switch to the new/edited theme
      setShowGenerator(false);
      setEditingState(null);
      setError(null);
    }
  };

  const handleEdit = (name: string) => {
    // Find the palette in either presets or custom palettes
    const presetScheme = COLOR_SCHEMES.find(scheme => scheme.name === name);
    const isPreset = !!presetScheme;
    
    let palette: ColorPalette;
    if (isPreset && presetScheme) {
      palette = {
        primary: [...presetScheme.colors.primary],
        comparison: [...presetScheme.colors.comparison]
      };
    } else {
      const customPalette = customPalettes[name];
      if (!customPalette) {
        console.error('Palette not found:', name);
        return;
      }
      palette = {
        primary: [...customPalette.primary],
        comparison: [...customPalette.comparison]
      };
    }

    setEditingState({
      originalName: name,
      palette,
      isPreset
    });
    setShowGenerator(true);
  };

  const handleCancel = () => {
    setShowGenerator(false);
    setEditingState(null);
    setError(null);
  };

  const handleCreate = () => {
    setEditingState(null);
    setShowGenerator(true);
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
                  onEdit={() => handleEdit(scheme.name)}
                />
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">Custom Themes</h3>
              {!showGenerator && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCreate}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create New
                </Button>
              )}
            </div>

            {Object.entries(customPalettes).length > 0 && !showGenerator && (
              <div className="space-y-4 mb-6">
                {Object.entries(customPalettes).map(([name, palette]) => (
                  <ColorSchemeOption
                    key={name}
                    name={name}
                    colors={palette}
                    isSelected={globalScheme === name}
                    isCustom
                    onSelect={() => setGlobalScheme(name)}
                    onEdit={() => handleEdit(name)}
                    onDelete={() => deleteCustomPalette(name)}
                  />
                ))}
              </div>
            )}

            {showGenerator && (
              <ColorPaletteGenerator
                onSave={handleSave}
                onCancel={handleCancel}
                initialPalette={editingState?.palette}
                initialName={editingState?.originalName || ''}
                isEditing={!!editingState}
                isPresetEdit={editingState?.isPreset}
              />
            )}
          </div>
        </div>
      </ScrollArea>
    </TabsContent>
  );
};

export default ColorSettingsTab;