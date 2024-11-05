import React from 'react';
import { HexColorPicker } from "react-colorful";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Wand2 } from "lucide-react";
import type { ColorPalette } from '@/stores/useColorStore';

interface ColorPaletteGeneratorProps {
  onSave: (name: string, palette: ColorPalette) => void;
  onCancel: () => void;
}

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label?: string;
}

const ColorPickerButton: React.FC<ColorPickerProps> = ({ color, onChange, label }) => (
  <Popover>
    <PopoverTrigger asChild>
      <button
        className="w-full h-8 rounded border border-slate-200 transition-all hover:scale-105"
        style={{ backgroundColor: color }}
        title={label}
      />
    </PopoverTrigger>
    <PopoverContent className="w-auto p-3">
      <HexColorPicker color={color} onChange={onChange} />
    </PopoverContent>
  </Popover>
);

export const ColorPaletteGenerator: React.FC<ColorPaletteGeneratorProps> = ({
  onSave,
  onCancel,
}) => {
  const [name, setName] = React.useState('');
  const [useGradient, setUseGradient] = React.useState(false);
  const [hue, setHue] = React.useState(210);
  const [saturation, setSaturation] = React.useState(70);
  const [lightness, setLightness] = React.useState(50);
  
  const [primaryColors, setPrimaryColors] = React.useState<string[]>([
    '#4f46e5', '#2563eb', '#7c3aed', '#db2777', '#059669', '#d97706'
  ]);
  const [comparisonColors, setComparisonColors] = React.useState<string[]>([
    '#9333ea', '#4f46e5', '#ec4899', '#f97316', '#84cc16', '#06b6d4'
  ]);

  const generateGradient = () => {
    const generateHslPalette = (baseHue: number, count: number): string[] => {
      return Array.from({ length: count }, (_, i) => {
        const h = (baseHue + (i * 20)) % 360;
        const s = Math.min(100, Math.max(20, saturation - (i * 5)));
        const l = Math.min(90, Math.max(20, lightness + (i * 5)));
        return `hsl(${h}, ${s}%, ${l}%)`;
      });
    };

    const primary = generateHslPalette(hue, 6);
    const comparison = generateHslPalette((hue + 180) % 360, 6);

    setPrimaryColors(primary);
    setComparisonColors(comparison);
  };

  const updatePrimaryColor = (index: number, color: string) => {
    setPrimaryColors(prev => {
      const next = [...prev];
      next[index] = color;
      return next;
    });
  };

  const updateComparisonColor = (index: number, color: string) => {
    setComparisonColors(prev => {
      const next = [...prev];
      next[index] = color;
      return next;
    });
  };

  const handleSave = () => {
    if (name.trim()) {
      onSave(name, {
        primary: primaryColors,
        comparison: comparisonColors,
      });
    }
  };

  return (
    <div className="space-y-6 p-4 bg-secondary/10 rounded-lg">
      {useGradient && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Base Hue</label>
            <Slider
              value={[hue]}
              min={0}
              max={360}
              step={1}
              onValueChange={([value]) => setHue(value)}
              className="mt-2"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Saturation</label>
            <Slider
              value={[saturation]}
              min={0}
              max={100}
              step={1}
              onValueChange={([value]) => setSaturation(value)}
              className="mt-2"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Lightness</label>
            <Slider
              value={[lightness]}
              min={20}
              max={80}
              step={1}
              onValueChange={([value]) => setLightness(value)}
              className="mt-2"
            />
          </div>

          <Button onClick={generateGradient} className="w-full">
            <Wand2 className="mr-2 h-4 w-4" />
            Generate Gradient
          </Button>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Use Gradient Generator</span>
          <Switch
            checked={useGradient}
            onCheckedChange={setUseGradient}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Primary Colors</label>
          <div className="grid grid-cols-6 gap-2">
            {primaryColors.map((color, i) => (
              <ColorPickerButton
                key={i}
                color={color}
                onChange={(newColor) => updatePrimaryColor(i, newColor)}
                label={`Primary Color ${i + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Comparison Colors</label>
          <div className="grid grid-cols-6 gap-2">
            {comparisonColors.map((color, i) => (
              <ColorPickerButton
                key={i}
                color={color}
                onChange={(newColor) => updateComparisonColor(i, newColor)}
                label={`Comparison Color ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Theme name"
        />
        <Button onClick={handleSave} disabled={!name.trim()}>
          Save
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
};