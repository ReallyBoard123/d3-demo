import { create } from 'zustand';
import type { ProcessMetadata } from '@/types/warehouse';

interface ProcessMetadataStore {
  processMetadata: ProcessMetadata | null;
  layoutImage: File | null;
  setProcessMetadata: (metadata: ProcessMetadata) => void;
  setLayoutImage: (image: File) => void;
}

export const useProcessMetadataStore = create<ProcessMetadataStore>((set) => ({
  processMetadata: null,
  layoutImage: null,
  setProcessMetadata: (metadata) => set({ processMetadata: metadata }),
  setLayoutImage: (image) => set({ layoutImage: image })
}));

export const useProcessMetadata = () => {
  const store = useProcessMetadataStore();
  return {
    processMetadata: store.processMetadata,
    layoutImage: store.layoutImage,
    setProcessMetadata: store.setProcessMetadata,
    setLayoutImage: store.setLayoutImage
  };
};