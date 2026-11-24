import { Metadata } from "next";
import { Suspense } from "react";
import { db } from "@/lib/db";
import Link from "next/link";
import PropertyCard from "@/components/property/PropertyCard";
import SearchFilters from "@/components/search/SearchFilters";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import { buildPropertyWhereClause } from "@/lib/filters";

export const metadata: Metadata = {
  title: "Rent Properties | NivasaHQ",
  description: "Search premium properties for rent across India.",
};

export default async function RentPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  let properties: any[] = [];
  
  try {
    const whereClause = buildPropertyWhereClause(searchParams, 'RENT');
    
    properties = await db.property.findMany({
      where: whereClause,
      include: {
        locality: true,
        city: true,
      },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.warn("Database connection failed", error);
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="container mx-auto px-4">
        {/* Rent Hero Header */}
        <div className="bg-emerald-800 rounded-3xl p-8 md:p-12 mb-8 text-white flex flex-col justify-center items-start shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <pattern id="grid-pattern-rent" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
              <rect width="100" height="100" fill="url(#grid-pattern-rent)" />
            </svg>
          </div>
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Properties for Rent</h1>
            <p className="text-emerald-100 text-lg max-w-2xl">Find the perfect rental property. Browse our curated selection of verified apartments, villas, and commercial spaces.</p>
          </div>
        </div>

        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-gray-600 font-medium">Showing {properties.length} properties for rent</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="md:hidden flex items-center gap-2">
              <SlidersHorizontal size={16} /> Filters
            </Button>
            <select className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#d4a853]">
              <option>Relevance</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest First</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="hidden lg:block w-full lg:w-1/4">
            <div className="sticky top-24">
              <Suspense fallback={<div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm animate-pulse">Loading filters...</div>}>
                <SearchFilters />
              </Suspense>
            </div>
          </aside>

          <main className="w-full lg:w-3/4">
            {properties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {properties.map((prop) => (
                  <Link href={`/properties/${prop.slug}`} key={prop.id}>
                    <PropertyCard 
                      id={prop.id}
                      title={prop.title}
                      price={`₹${prop.price.toLocaleString()}/month`}
                      type={prop.propertyType.replace(/_/g, ' ')}
                      bhk={prop.bedrooms || 0}
                      area={`${prop.carpetArea} sq.ft`}
                      location={`${prop.locality?.name}, ${prop.city?.name}`}
                      imageUrl="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80"
                      verified={prop.verificationStatus === 'VERIFIED'}
                      featured={prop.isFeatured}
                    />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-dashed p-12 text-center">
                <h3 className="text-lg font-bold text-slate-900 mb-2">No properties found</h3>
                <p className="text-slate-500">There are currently no active rental listings matching your criteria.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
