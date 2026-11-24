"use client";

import { useCompareStore, CompareProperty } from "@/store/compareStore";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function CompareCheckbox({ property }: { property: CompareProperty }) {
  const { properties, addProperty, removeProperty } = useCompareStore();
  
  const isCompared = properties.some((p) => p.id === property.id);

  const handleToggle = (checked: boolean) => {
    if (checked) {
      addProperty(property);
    } else {
      removeProperty(property.id);
    }
  };

  return (
    <div className="flex items-center space-x-2 bg-white/90 backdrop-blur px-2 py-1.5 rounded-md shadow-sm border border-gray-100" onClick={(e) => e.stopPropagation()}>
      <Checkbox 
        id={`compare-${property.id}`} 
        checked={isCompared}
        onCheckedChange={handleToggle}
      />
      <Label 
        htmlFor={`compare-${property.id}`}
        className="text-xs font-medium text-gray-700 cursor-pointer"
      >
        Compare
      </Label>
    </div>
  );
}
