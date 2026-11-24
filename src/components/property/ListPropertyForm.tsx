"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { createPropertyAction } from "@/actions/property.actions";
import { generateImageUploadSignature } from "@/actions/image.actions";

interface ListPropertyFormProps {
  cities: { id: string; name: string }[];
  localities: { id: string; name: string; parentId: string | null }[];
}

export default function ListPropertyForm({ cities, localities }: ListPropertyFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedCityId, setSelectedCityId] = useState<string>(cities[0]?.id || "");

  const filteredLocalities = localities.filter(loc => loc.parentId === selectedCityId);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const imageFiles = formData.getAll("images") as File[];
      
      // Upload images to Cloudinary first
      if (imageFiles.length > 0 && imageFiles[0].size > 0) {
        const { timestamp, signature, cloudName, apiKey } = await generateImageUploadSignature('properties');
        
        for (const file of imageFiles) {
          if (file.size === 0) continue;
          
          const cloudinaryData = new FormData();
          cloudinaryData.append('file', file);
          cloudinaryData.append('api_key', apiKey || '');
          cloudinaryData.append('timestamp', timestamp.toString());
          cloudinaryData.append('signature', signature);
          cloudinaryData.append('folder', 'properties');

          const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: cloudinaryData,
          });

          if (!res.ok) {
            throw new Error(`Failed to upload image: ${file.name}`);
          }

          const data = await res.json();
          formData.append('imageUrls', data.secure_url);
        }
      }
      
      // Remove original file objects to avoid sending them to the server action
      formData.delete("images");

      const result = await createPropertyAction(formData);

      if (result.success) {
        router.push(`/properties/${result.slug}`);
      } else {
        setError(result.error || "Something went wrong.");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">List Your Property</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Basic Details</h3>
          
          <div className="space-y-2">
            <Label htmlFor="title">Property Title</Label>
            <Input id="title" name="title" placeholder="e.g., Luxury 3BHK in Gachibowli" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" placeholder="Describe the key features of your property..." rows={4} required />
          </div>
        </div>

        {/* Property Type & Status */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Type & Classification</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="listingType">Listing Type</Label>
              <select id="listingType" name="listingType" className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" required>
                <option value="SALE">For Sale</option>
                <option value="RENT">For Rent</option>
                <option value="LEASE">For Lease</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="propertyType">Property Type</Label>
              <select id="propertyType" name="propertyType" className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" required>
                <option value="APARTMENT">Apartment</option>
                <option value="VILLA">Villa</option>
                <option value="INDEPENDENT_HOUSE">Independent House</option>
                <option value="PLOT">Plot/Land</option>
                <option value="COMMERCIAL_OFFICE">Commercial Office</option>
              </select>
            </div>
          </div>
        </div>

        {/* Features & Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Features</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input id="bedrooms" name="bedrooms" type="number" min="0" placeholder="e.g. 3" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input id="bathrooms" name="bathrooms" type="number" min="0" placeholder="e.g. 2" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="furnishing">Furnishing</Label>
              <select id="furnishing" name="furnishing" className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400">
                <option value="UNFURNISHED">Unfurnished</option>
                <option value="SEMI_FURNISHED">Semi-Furnished</option>
                <option value="FULLY_FURNISHED">Fully Furnished</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pricing & Area */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Pricing & Area</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹)</Label>
              <Input id="price" name="price" type="number" min="0" placeholder="e.g., 25000000" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="carpetArea">Carpet Area (sq.ft)</Label>
              <Input id="carpetArea" name="carpetArea" type="number" min="0" placeholder="e.g., 1800" required />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Location</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cityId">City</Label>
              <select 
                id="cityId" 
                name="cityId" 
                value={selectedCityId}
                onChange={(e) => setSelectedCityId(e.target.value)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" 
                required
              >
                {cities.map(city => (
                  <option key={city.id} value={city.id}>{city.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="localityId">Locality</Label>
              <select id="localityId" name="localityId" className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" required>
                {filteredLocalities.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Images</h3>
          
          <div className="space-y-2">
            <Label htmlFor="images">Upload Property Images (Optional)</Label>
            <Input id="images" name="images" type="file" accept="image/*" multiple className="cursor-pointer" />
            <p className="text-xs text-slate-500 mt-1">Select one or multiple files. The first image will be used as the primary cover.</p>
          </div>
        </div>

        <Button type="submit" className="w-full h-12 text-lg bg-[#0f172a] hover:bg-[#0f172a]/90" disabled={isLoading}>
          {isLoading ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Submitting Listing...</>
          ) : (
            "List Property Now"
          )}
        </Button>
      </form>
    </div>
  );
}
