import { Metadata } from "next";
import { db } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { MapPin, TrendingUp, Home } from "lucide-react";

export const metadata: Metadata = {
  title: "Locations Guide | NivasaHQ",
  description: "Explore detailed guides for top localities, neighborhood insights, and property trends.",
};

export default async function LocationsPage() {
  let localities: any[] = [];
  
  try {
    localities = await db.location.findMany({
      where: {
        level: 'LOCALITY',
      },
      orderBy: { propertyCount: 'desc' },
      take: 20
    });
  } catch (error) {
    console.warn("Database connection failed", error);
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="container mx-auto px-4">
        {/* Locations Hero Header */}
        <div className="bg-fuchsia-900 rounded-3xl p-8 md:p-12 mb-12 text-white flex flex-col justify-center items-center text-center shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <pattern id="grid-pattern-loc" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="white" opacity="0.5" />
              </pattern>
              <rect width="100" height="100" fill="url(#grid-pattern-loc)" />
            </svg>
          </div>
          <div className="relative z-10 max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Locations Guide</h1>
            <p className="text-fuchsia-100 text-lg">
              Explore our comprehensive neighborhood guides. Get insights into local amenities, average property prices, and real estate trends to make an informed decision.
            </p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Popular Localities</h2>
          
          {localities.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {localities.map((loc) => (
                <Link href={`/locality/${loc.slug}`} key={loc.id} className="group block">
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100">
                    <div className="relative h-48 w-full overflow-hidden">
                      <Image
                        src={loc.imageUrl || "https://images.unsplash.com/photo-1519999482648-25049ddd37b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}
                        alt={loc.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <h3 className="text-xl font-bold mb-1 group-hover:text-fuchsia-300 transition-colors">
                          {loc.name}
                        </h3>
                        <p className="text-sm text-slate-200 line-clamp-1">{loc.metaDescription || "Premium residential neighborhood"}</p>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-white flex justify-between items-center text-sm border-t border-slate-50">
                      <div className="flex items-center text-slate-600 font-medium">
                        <Home size={16} className="mr-1.5 text-indigo-500" />
                        {loc.propertyCount} Properties
                      </div>
                      {loc.avgPricePerSqft && (
                        <div className="flex items-center text-emerald-600 font-semibold bg-emerald-50 px-2 py-1 rounded-md">
                          <TrendingUp size={14} className="mr-1" />
                          ₹{Number(loc.avgPricePerSqft).toLocaleString()}/sqft
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-dashed p-12 text-center max-w-2xl mx-auto mt-8">
              <MapPin size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">No locations found</h3>
              <p className="text-slate-500">Check back later for updated neighborhood guides.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
