"use client";

import { useState } from "react";
import { Search, MapPin, List, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PropertyCard from "@/components/property/PropertyCard";
import SearchFilters from "@/components/search/SearchFilters";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import dynamic from 'next/dynamic';
import { searchPropertiesByBoundsAction } from "@/actions/map.actions";

const Map = dynamic(() => import('./Map'), { 
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-gray-100">Loading map...</div>
});

interface MapSearchClientProps {
  properties: any[];
}

export default function MapSearchClient({ properties: initialProperties }: MapSearchClientProps) {
  const [showList, setShowList] = useState(true);
  const [properties, setProperties] = useState(initialProperties);

  const handleBoundsChanged = async (bounds: { minLat: number; minLng: number; maxLat: number; maxLng: number }) => {
    const res = await searchPropertiesByBoundsAction(bounds.minLat, bounds.minLng, bounds.maxLat, bounds.maxLng);
    if (res.success && res.data) {
      setProperties(res.data);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col pt-16 overflow-hidden bg-gray-50">
      
      {/* Top Search Bar */}
      <div className="bg-white border-b border-gray-200 p-4 z-10 shadow-sm flex items-center justify-between gap-4">
        <div className="flex-1 max-w-2xl relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <Input 
            placeholder="Search by city, locality, or landmark..." 
            className="w-full pl-10 bg-gray-50 border-gray-200 focus-visible:ring-[#d4a853]"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Sheet>
            {/* @ts-ignore */}
            <SheetTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <SlidersHorizontal size={16} /> Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto">
              <div className="mt-6">
                <SearchFilters />
              </div>
            </SheetContent>
          </Sheet>

          <Button 
            variant="default" 
            className="bg-[#0f172a] md:hidden"
            onClick={() => setShowList(!showList)}
          >
            {showList ? <MapPin size={16} className="mr-2" /> : <List size={16} className="mr-2" />}
            {showList ? 'Map' : 'List'}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Sidebar - Property List */}
        <div className={`
          absolute md:relative z-20 md:z-auto h-full w-full md:w-[450px] lg:w-[500px] 
          bg-gray-50 border-r border-gray-200 overflow-y-auto transition-transform duration-300
          ${showList ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="p-4">
            <h2 className="font-bold text-lg text-gray-800 mb-4">{properties.length} Properties Found in View</h2>
            <div className="space-y-4">
              {properties.map(prop => (
                <PropertyCard 
                  key={prop.id} 
                  id={prop.id}
                  title={prop.title}
                  price={`₹${(Number(prop.price) / 100000).toFixed(2)} Lacs`}
                  type={prop.propertyType.replace(/_/g, ' ')}
                  bhk={prop.bedrooms || 0}
                  area={`${prop.carpetArea} sq.ft`}
                  location={`${prop.locality?.name || ''}, ${prop.city?.name || ''}`}
                  imageUrl="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80"
                  verified={prop.verificationStatus === 'VERIFIED'}
                  featured={prop.isFeatured}
                />
              ))}
              {properties.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                  No properties found in this area.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Area - Map View */}
        <div className="flex-1 relative bg-[#e5e7eb] z-0">
          <Map properties={properties} onBoundsChanged={handleBoundsChanged} />
        </div>
      </div>
    </div>
  );
}
