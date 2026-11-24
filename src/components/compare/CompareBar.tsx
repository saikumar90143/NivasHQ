"use client";

import { useCompareStore } from "@/store/compareStore";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CompareBar() {
  const { properties, removeProperty, clearCompare } = useCompareStore();

  if (properties.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] border-t border-gray-200 z-50 p-4 transform transition-transform">
      <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex gap-4 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {properties.map((p) => (
            <div key={p.id} className="relative flex items-center gap-3 bg-gray-50 border border-gray-200 p-2 rounded-lg min-w-[200px]">
              <div className="relative w-12 h-12 rounded-md overflow-hidden shrink-0">
                <Image src={p.imageUrl} alt={p.title} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate">{p.title}</p>
                <p className="text-xs text-gray-500 font-medium">{p.price}</p>
              </div>
              <button 
                onClick={() => removeProperty(p.id)}
                className="absolute -top-2 -right-2 bg-white rounded-full p-0.5 border border-gray-200 text-gray-500 hover:text-red-500 hover:bg-red-50 transition"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          {Array.from({ length: 3 - properties.length }).map((_, i) => (
            <div key={i} className="flex items-center justify-center gap-3 bg-gray-50 border border-gray-200 border-dashed p-2 rounded-lg min-w-[200px] text-gray-400 text-xs font-medium">
              Add Property
            </div>
          ))}
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button variant="ghost" onClick={clearCompare} className="text-gray-500">
            Clear All
          </Button>
          <Link href="/compare" className="flex-1 md:flex-none">
            <Button disabled={properties.length < 2} className="w-full bg-[#0f172a] hover:bg-[#0f172a]/90 text-white">
              Compare ({properties.length}/3)
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
