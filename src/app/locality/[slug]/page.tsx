import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import PropertyCard from "@/components/property/PropertyCard";
import SearchFilters from "@/components/search/SearchFilters";
import Link from "next/link";
import { MapPin } from "lucide-react";

interface LocalityPageProps {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

// Mock data for fallback
const mockLocality = {
  id: "loc-mock",
  name: "Gachibowli",
  slug: "gachibowli",
  description: "A major IT suburb of Hyderabad, known for its premium tech parks and upscale residential communities.",
  parent: { name: "Hyderabad" }
};

const mockProperties = [
  {
    id: "prop-mock-1",
    title: "Luxury Skyline Apartment",
    slug: "luxury-skyline-apartment",
    price: "85000000",
    propertyType: "APARTMENT",
    bedrooms: 4,
    carpetArea: "3450",
    locality: { name: "Gachibowli" },
    city: { name: "Hyderabad" },
    verificationStatus: "VERIFIED",
    isFeatured: true,
  },
  {
    id: "prop-mock-2",
    title: "Serene Valley Villa",
    slug: "serene-valley-villa",
    price: "58000000",
    propertyType: "VILLA",
    bedrooms: 5,
    carpetArea: "4200",
    locality: { name: "Gachibowli" },
    city: { name: "Hyderabad" },
    verificationStatus: "VERIFIED",
    isFeatured: false,
  }
];

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  let locality: any = null;
  const resolvedParams = await params;
  
  try {
    locality = await db.location.findFirst({
      where: { slug: resolvedParams.slug, level: 'LOCALITY' }
    });
  } catch (error) {
    console.warn("Database connection failed in metadata, using mock locality.", error);
    locality = { ...mockLocality, name: resolvedParams.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) };
  }

  if (!locality) return { title: 'Locality Not Found' };

  return {
    title: `Properties in ${locality.name} | NivasaHQ`,
    description: locality.description || `Find the best properties for sale and rent in ${locality.name}, Hyderabad.`,
  };
}

export default async function LocalityPage({ params, searchParams }: { params: Promise<{ slug: string }>, searchParams: any }) {
  let locality: any = null;
  let properties: any[] = [];
  const resolvedParams = await params;

  try {
    locality = await db.location.findFirst({
      where: { slug: resolvedParams.slug, level: 'LOCALITY' },
      include: { parent: true } // to get city
    });

    if (locality) {
      properties = await db.property.findMany({
        where: {
          localityId: locality.id,
          status: 'ACTIVE'
        },
        include: {
          locality: true,
          city: true,
        },
        orderBy: { createdAt: 'desc' }
      });
    }
  } catch (error) {
    console.warn("Database connection failed, using mock locality and properties.", error);
    locality = { ...mockLocality, name: resolvedParams.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) };
    properties = mockProperties;
  }

  if (!locality) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Hero Section */}
      <div className="relative pt-24 pb-16 bg-[#0f172a] text-white">
        <div className="absolute inset-0 z-0 overflow-hidden">
           <img 
              src="https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=1600&q=80" 
              alt={locality.name} 
              className="w-full h-full object-cover opacity-30" 
           />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center gap-2 text-yellow-500 mb-4 text-sm font-semibold uppercase tracking-wider">
            <MapPin size={16} /> 
            <span>{locality.parent?.name || 'Hyderabad'}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Properties in {locality.name}</h1>
          <p className="text-lg text-slate-300 max-w-2xl leading-relaxed">
            {locality.description || `Explore premium real estate listings in ${locality.name}. Find your dream home or next investment property in this highly sought-after neighborhood.`}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 flex-1">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar */}
          <aside className="w-full lg:w-1/4">
            <div className="sticky top-24">
              <SearchFilters />
            </div>
          </aside>

          {/* Main Content */}
          <main className="w-full lg:w-3/4">
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">{properties.length} Properties Found</h2>
              <select className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500">
                <option>Relevance</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest First</option>
              </select>
            </div>

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
                  />
                </Link>
              ))}
            </div>

            {properties.length === 0 && (
              <div className="bg-white rounded-xl border border-dashed p-12 text-center">
                <h3 className="text-lg font-bold text-slate-900 mb-2">No properties found</h3>
                <p className="text-slate-500">There are currently no active listings in this locality matching your criteria.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
