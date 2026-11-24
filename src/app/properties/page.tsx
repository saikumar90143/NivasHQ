import { Metadata } from "next";
import { Suspense } from "react";
import { db } from "@/lib/db";
import { PropertyService } from "@/services/property.service";
import Link from "next/link";
import PropertyCard from "@/components/property/PropertyCard";
import SearchFilters from "@/components/search/SearchFilters";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";

export const metadata: Metadata = {
  title: "Properties for Sale & Rent | NivasaHQ",
  description: "Search premium properties for sale and rent across India.",
};

// Mock fallback data
const mockProperties = Array.from({ length: 9 }).map((_, i) => ({
  id: `prop-${i}`,
  title: [
    "Luxury Skyline Apartment",
    "Serene Valley Villa",
    "Modern Downtown Loft",
    "Golf Course Facing Penthouse",
    "Seaside Premium Residency"
  ][i % 5],
  slug: `mock-property-${i}`,
  price: ["25000000", "58000000", "12000000", "85000000", "42000000"][i % 5],
  propertyType: ["APARTMENT", "VILLA", "APARTMENT", "PENTHOUSE", "VILLA"][i % 5],
  bedrooms: (i % 4) + 2,
  carpetArea: ["1850", "4200", "1200", "5500", "3800"][i % 5],
  locality: { name: ["Bandra West", "Whitefield", "Gachibowli", "Golf Course Road", "ECR"][i % 5] },
  city: { name: ["Mumbai", "Bangalore", "Hyderabad", "Gurgaon", "Chennai"][i % 5] },
  verificationStatus: i % 2 === 0 ? "VERIFIED" : "UNVERIFIED",
  isFeatured: i % 3 === 0,
}));

export default async function PropertiesPage({
  searchParams,
  params,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  params?: Promise<{ city?: string; locality?: string }>;
}) {
  const resolvedParams = await searchParams;
  const resolvedRouteParams = params ? await params : {};
  let properties: any[] = [];
  let nextCursor: string | null = null;
  
  try {
    const result = await PropertyService.searchProperties({
      cursor: typeof resolvedParams.cursor === 'string' ? resolvedParams.cursor : undefined,
      city: resolvedRouteParams.city || (typeof resolvedParams.city === 'string' ? resolvedParams.city : undefined),
      locality: resolvedRouteParams.locality || (typeof resolvedParams.locality === 'string' ? resolvedParams.locality : undefined),
      listingType: typeof resolvedParams.listingType === 'string' ? (resolvedParams.listingType as any) : undefined,
      propertyType: typeof resolvedParams.propertyType === 'string' ? (resolvedParams.propertyType as any) : undefined,
      bedrooms: typeof resolvedParams.bedrooms === 'string' ? parseInt(resolvedParams.bedrooms) : undefined,
      bathrooms: typeof resolvedParams.bathrooms === 'string' ? parseInt(resolvedParams.bathrooms) : undefined,
      minPrice: typeof resolvedParams.minPrice === 'string' ? parseInt(resolvedParams.minPrice) : undefined,
      maxPrice: typeof resolvedParams.maxPrice === 'string' ? parseInt(resolvedParams.maxPrice) : undefined,
      minArea: typeof resolvedParams.minArea === 'string' ? parseInt(resolvedParams.minArea) : undefined,
      maxArea: typeof resolvedParams.maxArea === 'string' ? parseInt(resolvedParams.maxArea) : undefined,
      sortBy: typeof resolvedParams.sortBy === 'string' ? (resolvedParams.sortBy as any) : undefined,
      pageSize: 12
    });
    properties = result.data;
    nextCursor = result.nextCursor;
  } catch (error) {
    console.warn("Database connection failed, using mock properties.", error);
    properties = mockProperties;
  }


  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#0f172a] mb-2">Properties for Sale & Rent</h1>
            <p className="text-gray-600">Showing {properties.length} results based on your search</p>
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
          {/* Sidebar Filters */}
          <aside className="hidden lg:block w-full lg:w-1/4">
            <div className="sticky top-24">
              <Suspense fallback={<div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm animate-pulse">Loading filters...</div>}>
                <SearchFilters />
              </Suspense>
            </div>
          </aside>

          {/* Property Grid */}
          <main className="w-full lg:w-3/4">
            {properties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {properties.map((prop) => (
                  <Link href={`/properties/${prop.slug}`} key={prop.id}>
                    <PropertyCard 
                      id={prop.id}
                      title={prop.title}
                      price={`₹${(Number(prop.price) / 100000).toFixed(2)} Lacs`}
                      type={prop.propertyType.replace(/_/g, ' ')}
                      bhk={prop.bedrooms || 0}
                      area={`${prop.carpetArea} sq.ft`}
                      location={`${prop.locality?.name}, ${prop.city?.name}`}
                      imageUrl="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80"
                      verified={prop.verificationStatus === 'VERIFIED'}
                      featured={prop.isFeatured}
                      listedBy={prop.ownerId ? 'Owner' : prop.agentId ? 'Agent' : prop.builderId ? 'Builder' : undefined}
                    />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-dashed p-12 text-center">
                <h3 className="text-lg font-bold text-slate-900 mb-2">No properties found</h3>
                <p className="text-slate-500">There are currently no active listings matching your criteria.</p>
              </div>
            )}

            {/* Pagination Controls */}
            {properties.length > 0 && (
              <div className="mt-12 flex justify-center items-center gap-2">
                <Link href={nextCursor ? `/properties?cursor=${nextCursor}` : "#"}>
                  <Button variant="outline" className="px-8" disabled={!nextCursor}>
                    {nextCursor ? "Load Next Page" : "No More Properties"}
                  </Button>
                </Link>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
