import { Metadata } from "next";
import { Suspense } from "react";
import { db } from "@/lib/db";
import Link from "next/link";
import PropertyCard from "@/components/property/PropertyCard";
import SearchFilters from "@/components/search/SearchFilters";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, Sparkles } from "lucide-react";
import { buildPropertyWhereClause } from "@/lib/filters";
import * as motion from "motion/react-client";

export const metadata: Metadata = {
  title: "Buy Properties | NivasaHQ",
  description: "Search premium properties for sale across India.",
};

export default async function BuyPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  let properties: any[] = [];
  
  try {
    const whereClause = buildPropertyWhereClause(searchParams, 'SALE');
    
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
        {/* Buy Hero Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-slate-950 rounded-3xl p-8 md:p-14 mb-10 text-white flex flex-col justify-center items-start shadow-2xl relative overflow-hidden"
        >
          {/* Animated Gradients */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-[50%] -left-[10%] w-[70%] h-[150%] bg-indigo-500/20 blur-[100px] rounded-full mix-blend-screen" />
            <div className="absolute top-[20%] -right-[20%] w-[60%] h-[120%] bg-purple-500/20 blur-[100px] rounded-full mix-blend-screen" />
          </div>
          <div className="absolute inset-0 opacity-[0.03]">
            <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <pattern id="grid-pattern-buy" width="4" height="4" patternUnits="userSpaceOnUse">
                <path d="M 4 0 L 0 0 0 4" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
              <rect width="100" height="100" fill="url(#grid-pattern-buy)" />
            </svg>
          </div>
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-sm font-semibold mb-6">
              <Sparkles size={14} /> Premium Listings
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Discover Your Next <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Masterpiece</span></h1>
            <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed">Curated luxury estates, urban apartments, and investment properties verified for your peace of mind.</p>
          </div>
        </motion.div>

        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-gray-600 font-medium">Showing {properties.length} properties for sale</p>
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
              <motion.div 
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1
                    }
                  }
                }}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                {properties.map((prop) => (
                  <motion.div key={prop.id} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                    <Link href={`/properties/${prop.slug}`}>
                      <PropertyCard 
                        id={prop.id}
                        title={prop.title}
                        price={`₹${(Number(prop.price) / 100000).toFixed(2)} Lacs`}
                        type={prop.propertyType.replace(/_/g, ' ')}
                        bhk={prop.bedrooms || 0}
                        area={`${prop.carpetArea} sq.ft`}
                        location={`${prop.locality?.name}, ${prop.city?.name}`}
                        imageUrl="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80"
                        verified={prop.verificationStatus === 'VERIFIED'}
                        featured={prop.isFeatured}
                      />
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="bg-white rounded-xl border border-dashed p-12 text-center">
                <h3 className="text-lg font-bold text-slate-900 mb-2">No properties found</h3>
                <p className="text-slate-500">There are currently no active sale listings matching your criteria.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
