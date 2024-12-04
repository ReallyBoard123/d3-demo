import React from 'react';
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import type { ColorPalette } from '@/config/color';
import { useTranslation } from '@/hooks/useTranslation';

interface ColorSchemeOptionProps {
  name: string;
  colors: ColorPalette;
  isSelected: boolean;
  isCustom?: boolean;
  onSelect: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const ColorSchemeOption: React.FC<ColorSchemeOptionProps> = ({
  name,
  colors,
  isSelected,
  isCustom,
  onSelect,
  onEdit,
  onDelete
}) => {
  const { t } = useTranslation();

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
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {onEdit && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            title={t('settings.colors.buttons.editTheme')}
          >
            <Edit className="h-4 w-4" />
          </Button>
        )}
        {isCustom && onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title={t('settings.colors.buttons.deleteTheme')}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};