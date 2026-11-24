import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import PropertyCard from "@/components/property/PropertyCard";
import SearchBar from "@/components/search/SearchBar";
import { ArrowRight, MapPin, Building2, UserPlus } from "lucide-react";
import { auth } from "@/lib/auth";

async function getFeaturedProperties() {
  try {
    const properties = await db.property.findMany({
      where: { 
        status: 'ACTIVE',
        isFeatured: true 
      },
      include: {
        locality: true,
        city: true,
      },
      take: 6,
      orderBy: { createdAt: 'desc' }
    });
    return properties;
  } catch (error) {
    console.warn("Failed to fetch properties from DB, falling back to mock data:", error);
    // Return mock data for UI testing if DB is down
    return [
      {
        id: "mock-1",
        title: "Luxury 3BHK in Gachibowli",
        slug: "luxury-3bhk-gachibowli",
        propertyType: "APARTMENT",
        bedrooms: 3,
        carpetArea: 1800,
        price: 25000000,
        verificationStatus: "VERIFIED",
        isFeatured: true,
        locality: { name: "Gachibowli" },
        city: { name: "Hyderabad" }
      },
      {
        id: "mock-2",
        title: "Modern Villa in Jubilee Hills",
        slug: "modern-villa-jubilee-hills",
        propertyType: "VILLA",
        bedrooms: 4,
        carpetArea: 3200,
        price: 85000000,
        verificationStatus: "VERIFIED",
        isFeatured: true,
        locality: { name: "Jubilee Hills" },
        city: { name: "Hyderabad" }
      }
    ] as any;
  }
}

async function getTopLocalities() {
  try {
    const localities = await db.location.findMany({
      where: {
        level: 'LOCALITY',
        isPopular: true
      },
      take: 8,
      orderBy: { propertyCount: 'desc' }
    });
    return localities;
  } catch (error) {
    return [
      { id: "loc-1", name: "Gachibowli", slug: "gachibowli", propertyCount: 145 },
      { id: "loc-2", name: "Jubilee Hills", slug: "jubilee-hills", propertyCount: 89 },
      { id: "loc-3", name: "Kondapur", slug: "kondapur", propertyCount: 210 },
      { id: "loc-4", name: "HITEC City", slug: "hitec-city", propertyCount: 320 },
    ] as any;
  }
}

export default async function Home() {
  const featuredProperties = await getFeaturedProperties();
  const topLocalities = await getTopLocalities();
  const session = await auth();
  const userRole = (session?.user as any)?.role || "BUYER";
  const showAgentCTA = userRole !== "AGENT" && userRole !== "BUILDER";

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2075&q=80" 
            alt="Modern home exterior" 
            fill 
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-slate-900/60 mix-blend-multiply"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-6">
            Find Your Dream Home in <span className="text-yellow-500">Hyderabad</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-200 mb-10 max-w-2xl">
            Discover verified properties, connect with trusted agents, and explore the best real estate options in the city.
          </p>

          <div className="w-full max-w-4xl bg-white p-4 rounded-xl shadow-2xl">
            {/* The SearchBar component handles the actual search logic and routing */}
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="py-20 container mx-auto px-4">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Featured Properties</h2>
            <p className="text-slate-600 mt-2">Handpicked premium properties for you.</p>
          </div>
          <Link href="/properties" className="hidden md:flex items-center text-indigo-600 font-medium hover:text-indigo-700">
            View All <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProperties.map((property: any) => (
            <Link href={`/properties/${property.slug}`} key={property.id}>
              <PropertyCard
                id={property.id}
                title={property.title}
                price={`₹${(Number(property.price) / 100000).toFixed(2)} Lacs`}
                type={property.propertyType.replace(/_/g, ' ')}
                bhk={property.bedrooms || 0}
                area={`${property.carpetArea} sqft`}
                location={`${property.locality?.name}, ${property.city?.name}`}
                imageUrl="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80"
                verified={property.verificationStatus === 'VERIFIED'}
                featured={property.isFeatured}
                listedBy={property.ownerId ? 'Owner' : property.agentId ? 'Agent' : property.builderId ? 'Builder' : undefined}
              />
            </Link>
          ))}
          {featuredProperties.length === 0 && (
            <div className="col-span-3 text-center py-12 text-slate-500 bg-white rounded-xl border border-dashed">
              No featured properties found. Run the seed script to populate data.
            </div>
          )}
        </div>
        <div className="mt-8 text-center md:hidden">
          <Link href="/properties" className="inline-flex items-center text-indigo-600 font-medium hover:text-indigo-700">
            View All Properties <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Top Localities Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Top Localities in Hyderabad</h2>
            <p className="text-slate-600 mt-2">Explore the most sought-after neighborhoods.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {topLocalities.map((locality: any) => (
              <Link 
                key={locality.id} 
                href={`/locality/${locality.slug}`}
                className="group relative h-48 rounded-xl overflow-hidden shadow-sm"
              >
                <Image
                  src={`https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop`}
                  alt={locality.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-lg font-bold flex items-center">
                    <MapPin className="h-4 w-4 mr-1" /> {locality.name}
                  </h3>
                  <p className="text-sm text-slate-200">{locality.propertyCount} Properties</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section for Agents/Builders */}
      {showAgentCTA && (
        <section className="py-24 bg-indigo-900 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <pattern id="grid-pattern" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
              <rect width="100" height="100" fill="url(#grid-pattern)" />
            </svg>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="bg-indigo-800/50 backdrop-blur-md border border-indigo-700/50 rounded-2xl p-8 md:p-12 max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-white max-w-xl">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Are you a Real Estate Professional?</h2>
                <p className="text-indigo-200 text-lg mb-0">
                  Join NivasaHQ to list your properties, manage leads, and grow your business with our premium tools.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 shrink-0">
                <Link href="/register" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-900 bg-white hover:bg-indigo-50 transition-colors shadow-lg">
                  <UserPlus className="h-5 w-5 mr-2" />
                  Register as Agent
                </Link>
                <Link href="/pricing" className="inline-flex items-center justify-center px-6 py-3 border border-indigo-400 text-base font-medium rounded-md text-white hover:bg-indigo-700 transition-colors">
                  <Building2 className="h-5 w-5 mr-2" />
                  View Plans
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
