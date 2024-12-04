import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Trash2, Plus, X, Pencil, EyeOff, Eye } from 'lucide-react';
import { useRegionStore } from '@/stores/useRegionStore';
import { useTranslation } from '@/hooks/useTranslation';

interface RegionManagementProps {
  regions: string[];
  onRegionUpdate?: () => void;
}

interface FuzzyMatch {
  region: string;
  score: number;
  matchType: 'exact-pattern' | 'related-pattern';
}

const RegionManagement: React.FC<RegionManagementProps> = ({ 
  regions,
  onRegionUpdate 
}) => {
  const { t } = useTranslation();
  const [selectedRegions, setSelectedRegions] = React.useState<Set<string>>(new Set());
  const [newName, setNewName] = React.useState('');
  const [fuzzyMatches, setFuzzyMatches] = React.useState<FuzzyMatch[]>([]);
  const [activeRegion, setActiveRegion] = React.useState<string | null>(null);
  const [editingCombination, setEditingCombination] = React.useState<string | null>(null);
  const { 
    combinations, 
    excludedRegions,
    addCombination, 
    removeCombination, 
    updateCombination,
    toggleExclusion
  } = useRegionStore();

  const findMatches = (region: string): FuzzyMatch[] => {
    const matches: FuzzyMatch[] = [];
    const parts = region.toLowerCase().split('_');
    const basePattern = parts.slice(0, -1).join('_');
    
    regions.forEach(r => {
      if (r === region) return;
      
      const rParts = r.toLowerCase().split('_');
      const rBasePattern = rParts.slice(0, -1).join('_');
      
      if (basePattern === rBasePattern) {
        matches.push({
          region: r,
          score: 0,
          matchType: 'exact-pattern'
        });
      }
    });

    if (matches.length === 0) {
      const firstPart = parts[0];
      regions.forEach(r => {
        if (r === region) return;
        
        const rFirstPart = r.toLowerCase().split('_')[0];
        if (firstPart === rFirstPart) {
          matches.push({
            region: r,
            score: 0.5,
            matchType: 'related-pattern'
          });
        }
      });
    }

    return matches;
  };

  const handleRegionClick = (region: string) => {
    if (activeRegion === region) {
      setActiveRegion(null);
      setFuzzyMatches([]);
    } else {
      setActiveRegion(region);
      setFuzzyMatches(findMatches(region));
    }

    const newSelected = new Set(selectedRegions);
    if (newSelected.has(region)) {
      newSelected.delete(region);
      if (newSelected.size === 1) {
        newSelected.clear();
      }
    } else {
      newSelected.add(region);
    }
    setSelectedRegions(newSelected);
  };

  const removeSelectedRegion = (region: string) => {
    const newSelected = new Set(selectedRegions);
    newSelected.delete(region);
    if (newSelected.size === 1) {
      newSelected.clear();
    }
    setSelectedRegions(newSelected);
  };

  const handleEditCombination = (name: string) => {
    const combination = combinations.find(c => c.name === name);
    if (combination) {
      setEditingCombination(name);
      setNewName(name);
      setSelectedRegions(new Set(combination.regions));
    }
  };

  const handleCombine = () => {
    if (newName && selectedRegions.size >= 2) {
      if (editingCombination) {
        updateCombination(editingCombination, newName, Array.from(selectedRegions));
      } else {
        addCombination(newName, Array.from(selectedRegions));
      }
      setNewName('');
      setSelectedRegions(new Set());
      setEditingCombination(null);
      onRegionUpdate?.();
    }
  };

  const handleDelete = (name: string) => {
    removeCombination(name);
    onRegionUpdate?.();
  };

  const handleExclude = (region: string) => {
    toggleExclusion(region);
    onRegionUpdate?.();
  };

  const availableRegions = React.useMemo(() => {
    const combinedRegions = new Set(combinations.flatMap(c => c.regions));
    if (editingCombination) {
      const currentCombination = combinations.find(c => c.name === editingCombination);
      if (currentCombination) {
        currentCombination.regions.forEach(r => combinedRegions.delete(r));
      }
    }
    return regions
      .filter(region => !combinedRegions.has(region))
      .filter(region => !excludedRegions.has(region));
  }, [regions, combinations, editingCombination, excludedRegions]);

  return (
    <Tabs defaultValue="regions" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="regions">{t('regionManagement.tabs.regions')}</TabsTrigger>
        <TabsTrigger value="combinations">{t('regionManagement.tabs.combinations')}</TabsTrigger>
        <TabsTrigger value="excluded">{t('regionManagement.tabs.excluded')}</TabsTrigger>
      </TabsList>

      <TabsContent value="regions">
        <div className="h-[60vh] flex flex-col">
          <ScrollArea className="flex-1">
            <div className="grid grid-cols-4 gap-2 p-2">
              {availableRegions.map(region => (
                <Card 
                  key={region}
                  className={`
                    cursor-pointer transition-all hover:bg-secondary
                    ${selectedRegions.has(region) ? 'border-primary bg-secondary/50' : ''}
                    ${activeRegion === region ? 'ring-2 ring-primary' : ''}
                    ${fuzzyMatches.find(m => m.region === region) ? 'ring-2 ring-primary/60 scale-[0.98]' : ''}
                  `}
                  onClick={() => handleRegionClick(region)}
                >
                  <CardContent className="p-3">
                    <p className="text-sm font-medium truncate">{region}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>

          {selectedRegions.size >= 2 && (
            <div className="mt-4 p-2 border-t">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder={t('regionManagement.combine.namePlaceholder')}
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>
                <Button onClick={handleCombine} disabled={!newName}>
                  <Plus className="w-4 h-4 mr-2" /> 
                  {editingCombination 
                    ? t('regionManagement.combine.buttonUpdate') 
                    : t('regionManagement.combine.buttonCombine')
                  } ({selectedRegions.size})
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {Array.from(selectedRegions).map(region => (
                  <Badge key={region} variant="secondary" className="flex items-center gap-1">
                    {region}
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSelectedRegion(region);
                      }}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="combinations">
        <ScrollArea className="h-[60vh]">
          <div className="space-y-2 p-2">
            {combinations.map(({ name, regions: combinedRegions }) => (
              <div key={name} className="flex items-center justify-between p-2 border rounded">
                <div className="flex-1">
                  <p className="font-medium">{name}</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {combinedRegions.map(region => (
                      <Badge key={region} variant="secondary">{region}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEditCombination(name)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {t('settings.colors.buttons.editTheme')}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {t('regionManagement.combinations.deleteConfirm')}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {t('regionManagement.combinations.deleteWarning')}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>
                          {t('common.cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDelete(name)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          {t('common.delete')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}

            {combinations.length === 0 && (
              <div className="text-center text-muted-foreground p-4">
                {t('regionManagement.combinations.notFound')}
              </div>
            )}
          </div>
        </ScrollArea>
      </TabsContent>

      <TabsContent value="excluded">
        <ScrollArea className="h-[60vh]">
          <div className="grid grid-cols-4 gap-2 p-2">
            {regions.map(region => (
              <Card 
                key={region}
                className={`
                  cursor-pointer transition-all hover:bg-secondary
                  ${excludedRegions.has(region) ? 'border-destructive bg-destructive/10' : ''}
                `}
                onClick={() => handleExclude(region)}
              >
                <CardContent className="p-3 flex justify-between items-center">
                  <p className="text-sm font-medium truncate">{region}</p>
                  {excludedRegions.has(region) ? (
                    <EyeOff className="h-4 w-4 text-destructive" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
};

export default RegionManagement;