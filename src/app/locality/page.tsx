import { Metadata } from "next";
import { db } from "@/lib/db";
import Link from "next/link";
import { MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Explore Localities | NivasaHQ",
  description: "Browse premium real estate across top localities in Hyderabad.",
};

// Mock data
const mockLocalities = [
  { id: "1", name: "Gachibowli", slug: "gachibowli", propertyCount: 142, avgPricePerSqft: 12500, imageUrl: "https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=600&q=80" },
  { id: "2", name: "Jubilee Hills", slug: "jubilee-hills", propertyCount: 86, avgPricePerSqft: 25000, imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80" },
  { id: "3", name: "Banjara Hills", slug: "banjara-hills", propertyCount: 114, avgPricePerSqft: 22000, imageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80" },
  { id: "4", name: "HITEC City", slug: "hitec-city", propertyCount: 215, avgPricePerSqft: 14000, imageUrl: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=600&q=80" },
  { id: "5", name: "Kokapet", slug: "kokapet", propertyCount: 95, avgPricePerSqft: 11500, imageUrl: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=600&q=80" },
  { id: "6", name: "Kondapur", slug: "kondapur", propertyCount: 178, avgPricePerSqft: 10500, imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80" },
];

export default async function LocalitiesIndexPage() {
  let localities: any[] = [];

  try {
    localities = await db.location.findMany({
      where: { level: 'LOCALITY', isPopular: true },
      take: 20,
      orderBy: { propertyCount: 'desc' }
    });
  } catch (error) {
    console.warn("Database connection failed, using mock localities.", error);
  }

  if (!localities || localities.length === 0) {
    localities = mockLocalities;
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#0f172a] mb-4">Explore Top Localities</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Discover the most sought-after neighborhoods in Hyderabad. From bustling tech hubs to serene residential enclaves, find the perfect area that fits your lifestyle.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {localities.map((loc) => (
            <Link 
              key={loc.id} 
              href={`/locality/${loc.slug}`}
              className="group relative h-72 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url(${loc.imageUrl || 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=600&q=80'})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="text-2xl font-bold mb-1 group-hover:text-yellow-400 transition-colors">{loc.name}</h3>
                    <p className="text-slate-200 text-sm flex items-center gap-1.5">
                      <MapPin size={14} /> Hyderabad
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">{loc.propertyCount || Math.floor(Math.random() * 100) + 50}</p>
                    <p className="text-xs text-slate-300 uppercase tracking-wider">Properties</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
