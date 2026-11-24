"use client";

import { useCompareStore } from "@/store/compareStore";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, X } from "lucide-react";
import { getPropertiesForCompareAction } from "@/actions/compare.actions";

export default function ComparePage() {
  const { properties, removeProperty } = useCompareStore();
  const [mounted, setMounted] = useState(false);
  const [fullData, setFullData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || properties.length === 0) {
      setIsLoading(false);
      return;
    }

    // Mock fetching full details for the compared properties
    // In a real app, you'd fetch this from a Server Action using the IDs
    const fetchFullData = async () => {
      setIsLoading(true);
      try {
        const ids = properties.map(p => p.id);
        const res = await getPropertiesForCompareAction(ids);
        if (res.success && res.data) {
          setFullData(res.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFullData();
  }, [mounted, properties]);

  if (!mounted) return null;

  if (properties.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32 pb-12 text-center">
        <h1 className="text-3xl font-bold text-[#0f172a] mb-4">Compare Properties</h1>
        <p className="text-gray-500 mb-8">You haven't selected any properties to compare.</p>
        <Link href="/buy">
          <Button className="bg-[#0f172a] text-white">Explore Properties</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Link href="/buy" className="text-sm font-medium text-[#0f172a] flex items-center gap-1 hover:underline mb-4">
            <ArrowLeft size={16} /> Back to Search
          </Link>
          <h1 className="text-3xl font-bold text-[#0f172a]">Compare Properties</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0f172a]"></div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr>
                  <th className="p-6 border-b border-r border-gray-200 bg-gray-50 w-1/4">
                    <span className="font-semibold text-gray-500">Property Details</span>
                  </th>
                  {fullData.map((p) => (
                    <th key={p.id} className="p-6 border-b border-gray-200 w-1/4 relative align-top">
                      <button 
                        onClick={() => removeProperty(p.id)}
                        className="absolute top-4 right-4 bg-gray-100 rounded-full p-1 text-gray-500 hover:text-red-500 hover:bg-red-50 transition"
                      >
                        <X size={16} />
                      </button>
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-4">
                        <Image src={p.imageUrl} alt={p.title} fill className="object-cover" />
                      </div>
                      <h3 className="font-bold text-lg text-gray-800 mb-1">{p.title}</h3>
                      <p className="text-[#d4a853] font-bold text-xl">{p.price}</p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "BHK", key: "bhk" },
                  { label: "Area", key: "area" },
                  { label: "Bathrooms", key: "bathrooms" },
                  { label: "Facing", key: "facing" },
                  { label: "Furnishing", key: "furnishing" },
                  { label: "Parking", key: "parking" },
                ].map((spec, i) => (
                  <tr key={i} className="hover:bg-gray-50/50">
                    <td className="p-4 border-b border-r border-gray-200 font-medium text-gray-600 bg-gray-50/50">
                      {spec.label}
                    </td>
                    {fullData.map((p) => (
                      <td key={p.id} className="p-4 border-b border-gray-200 text-gray-800 font-medium">
                        {p[spec.key]}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td className="p-4 border-r border-gray-200 font-medium text-gray-600 bg-gray-50/50">
                    Amenities
                  </td>
                  {fullData.map((p) => (
                    <td key={p.id} className="p-4 border-gray-200 text-gray-800">
                      <ul className="space-y-2">
                        {p.amenities.map((amenity: string, idx: number) => (
                          <li key={idx} className="flex items-center gap-2 text-sm">
                            <Check size={14} className="text-green-500" /> {amenity}
                          </li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
