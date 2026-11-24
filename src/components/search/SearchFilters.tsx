"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const propertyTypes = ["Apartment", "Villa", "Independent House", "Plot", "Commercial"];
const bhkOptions = ["1", "2", "3", "4", "4+"];
const furnishingOptions = ["Unfurnished", "Semi-Furnished", "Fully-Furnished"];
const possessionOptions = ["Under Construction", "Ready to Move"];

export default function SearchFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Parse existing params
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [priceRange, setPriceRange] = useState([
    Number(searchParams.get("minPrice")) || 0,
    Number(searchParams.get("maxPrice")) || 100000000,
  ]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(searchParams.getAll("type") || []);
  const [selectedBhk, setSelectedBhk] = useState<string[]>(searchParams.getAll("bhk") || []);
  const [furnishing, setFurnishing] = useState(searchParams.get("furnishing") || "all");
  const [possession, setPossession] = useState(searchParams.get("possession") || "all");

  const createQueryString = useCallback(() => {
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (priceRange[0] > 0) params.set("minPrice", priceRange[0].toString());
    if (priceRange[1] < 100000000) params.set("maxPrice", priceRange[1].toString());
    selectedTypes.forEach(t => params.append("type", t));
    selectedBhk.forEach(b => params.append("bhk", b));
    if (furnishing && furnishing !== "all") params.set("furnishing", furnishing);
    if (possession && possession !== "all") params.set("possession", possession);
    return params.toString();
  }, [location, priceRange, selectedTypes, selectedBhk, furnishing, possession]);

  const applyFilters = () => {
    const queryString = createQueryString();
    router.push(`${pathname}?${queryString}`);
  };

  const resetFilters = () => {
    setLocation("");
    setPriceRange([0, 100000000]);
    setSelectedTypes([]);
    setSelectedBhk([]);
    setFurnishing("all");
    setPossession("all");
    router.push(pathname);
  };

  const handleCheckboxChange = (
    value: string,
    state: string[],
    setState: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (state.includes(value)) {
      setState(state.filter(item => item !== value));
    } else {
      setState([...state, value]);
    }
  };

  const formatPrice = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)} Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)} L`;
    return `₹${value.toLocaleString()}`;
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-[#0f172a]">Filters</h2>
        <Button variant="ghost" size="sm" onClick={resetFilters} className="text-sm text-gray-500 hover:text-[#0f172a]">
          Reset All
        </Button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="location" className="text-sm font-semibold text-gray-700">Location</Label>
          <Input 
            id="location" 
            placeholder="Search city or locality..." 
            value={location}
            onChange={(e: any) => setLocation(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-semibold text-gray-700">Budget</Label>
            <span className="text-xs font-medium text-gray-500">
              {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
            </span>
          </div>
          <Slider
            defaultValue={[0, 100000000]}
            max={100000000}
            step={100000}
            value={priceRange}
            onValueChange={setPriceRange as any}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-700">Property Type</Label>
          <div className="grid grid-cols-2 gap-2">
            {propertyTypes.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox 
                  id={`type-${type}`} 
                  checked={selectedTypes.includes(type)}
                  onCheckedChange={() => handleCheckboxChange(type, selectedTypes, setSelectedTypes)}
                />
                <label htmlFor={`type-${type}`} className="text-sm text-gray-600 cursor-pointer">
                  {type}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-700">BHK</Label>
          <div className="flex flex-wrap gap-2">
            {bhkOptions.map((bhk) => (
              <button
                key={bhk}
                onClick={() => handleCheckboxChange(bhk, selectedBhk, setSelectedBhk)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-colors border",
                  selectedBhk.includes(bhk)
                    ? "bg-[#0f172a] text-white border-[#0f172a]"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                )}
              >
                {bhk}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-700">Furnishing</Label>
          <Select value={furnishing} onValueChange={setFurnishing as any}>
            <SelectTrigger>
              <SelectValue placeholder="Any Furnishing" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any</SelectItem>
              {furnishingOptions.map(opt => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-700">Possession Status</Label>
          <Select value={possession} onValueChange={setPossession as any}>
            <SelectTrigger>
              <SelectValue placeholder="Any Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any</SelectItem>
              {possessionOptions.map(opt => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button className="w-full bg-[#d4a853] hover:bg-[#c29845] text-[#0f172a] font-bold" onClick={applyFilters}>
        Apply Filters
      </Button>
    </div>
  );
}
