import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';

export interface CompareProperty {
  id: string;
  title: string;
  price: string;
  imageUrl: string;
}

interface CompareStore {
  properties: CompareProperty[];
  addProperty: (property: CompareProperty) => void;
  removeProperty: (id: string) => void;
  clearCompare: () => void;
}

export const useCompareStore = create<CompareStore>()(
  persist(
    (set, get) => ({
      properties: [],
      addProperty: (property) => {
        const current = get().properties;
        if (current.find((p) => p.id === property.id)) {
          toast("Property is already in compare list.");
          return;
        }
        if (current.length >= 3) {
          toast.error("You can only compare up to 3 properties.");
          return;
        }
        set({ properties: [...current, property] });
        toast.success("Added to comparison.");
      },
      removeProperty: (id) => {
        set({ properties: get().properties.filter((p) => p.id !== id) });
      },
      clearCompare: () => {
        set({ properties: [] });
      },
    }),
    {
      name: 'compare-storage',
    }
  )
);
