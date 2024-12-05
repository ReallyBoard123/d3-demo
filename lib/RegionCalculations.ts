import type { ProcessMetadata, HumanActivity, RegionDefinition, RegionLabel } from '@/types';
import type { RegionCombination } from '@/stores/useRegionStore';

export interface RegionDimensions {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RegionMetadata extends RegionDefinition {
  exclude_from_eval: boolean;
  special_activities: HumanActivity[];
  regionId: number;
  uuid: string;
}

export interface ExtendedBeacon {
  uuid: string;
  id: number;
  position_x: number;
  position_y: number;
  region_uuid: string;
  comment: string | null;
}

export interface DynamicBeacon {
  uuid: string;
  id: number;
  comment: string;
  distance_threshold_rssi: number;
}

export interface ExtendedLayoutMetadata {
  regions: RegionMetadata[];
  region_labels: RegionLabel[];
  beacons: ExtendedBeacon[];
  dynamic_beacons: DynamicBeacon[];
  width_pixel: number;
  height_pixel: number;
}

export interface ExtendedProcessMetadata extends Omit<ProcessMetadata, 'layout'> {
  layout: ExtendedLayoutMetadata;
}

export interface CombinedRegionMetadata extends RegionMetadata {
  originalRegions: string[];
}

export function getRegionsFromMetadata(
  metadata: ExtendedProcessMetadata, 
  regionNames: string[]
): RegionMetadata[] {
  return metadata.layout.regions.filter(region => 
    regionNames.includes(region.name)
  );
}

export function calculateRegionDimensions(
  region: RegionMetadata,
  canvasWidth: number,
  canvasHeight: number
): RegionDimensions {
  return {
    x: region.position_top_left_x * canvasWidth,
    y: region.position_top_left_y * canvasHeight,
    width: (region.position_bottom_right_x - region.position_top_left_x) * canvasWidth,
    height: (region.position_bottom_right_y - region.position_top_left_y) * canvasHeight
  };
}

export function calculateCombinedRegionDimensions(
  regions: RegionMetadata[],
  combinationName: string
): CombinedRegionMetadata {
  if (regions.length === 0) {
    throw new Error('No regions provided for combination');
  }

  const position_top_left_x = Math.min(...regions.map(r => r.position_top_left_x));
  const position_top_left_y = Math.min(...regions.map(r => r.position_top_left_y));
  const position_bottom_right_x = Math.max(...regions.map(r => r.position_bottom_right_x));
  const position_bottom_right_y = Math.max(...regions.map(r => r.position_bottom_right_y));

  const baseRegion = regions[0];

  return {
    name: combinationName,
    position_top_left_x,
    position_top_left_y,
    position_bottom_right_x,
    position_bottom_right_y,
    region_label_uuid: baseRegion.region_label_uuid,
    regionId: -1,
    exclude_from_eval: baseRegion.exclude_from_eval,
    special_activities: [...baseRegion.special_activities],
    uuid: crypto.randomUUID(),
    originalRegions: regions.map(r => r.name)
  };
}

export function updateMetadataWithCombinedRegions(
  metadata: ExtendedProcessMetadata,
  combinations: RegionCombination[]
): ExtendedProcessMetadata {
  const updatedMetadata: ExtendedProcessMetadata = {
    ...metadata,
    layout: {
      ...metadata.layout,
      regions: [...metadata.layout.regions],
      region_labels: [...metadata.layout.region_labels],
      beacons: [...metadata.layout.beacons],
      dynamic_beacons: [...metadata.layout.dynamic_beacons],
      width_pixel: metadata.layout.width_pixel,
      height_pixel: metadata.layout.height_pixel
    }
  };
  
  combinations.forEach(combination => {
    const regionsToMerge = getRegionsFromMetadata(metadata, combination.regions);
    if (regionsToMerge.length > 0) {
      const combinedRegion = calculateCombinedRegionDimensions(
        regionsToMerge, 
        combination.name
      );
      
      updatedMetadata.layout.regions = updatedMetadata.layout.regions.filter(
        region => !combination.regions.includes(region.name)
      );

      const maxId = Math.max(...updatedMetadata.layout.regions.map(r => r.regionId));
      combinedRegion.regionId = maxId + 1;

      updatedMetadata.layout.regions.push(combinedRegion);
    }
  });

  return updatedMetadata;
}

export function getOriginalRegions(
  combinedRegionName: string,
  metadata: ExtendedProcessMetadata,
  combinations: RegionCombination[]
): string[] {
  const combination = combinations.find(c => c.name === combinedRegionName);
  return combination?.regions || [];
}

export function isCombinedRegion(
  region: RegionMetadata,
  combinations: RegionCombination[]
): boolean {
  return combinations.some(c => c.name === region.name);
}

export function getCombinationByRegionName(
  regionName: string,
  combinations: RegionCombination[]
): RegionCombination | undefined {
  return combinations.find(c => 
    c.name === regionName || c.regions.includes(regionName)
  );
}