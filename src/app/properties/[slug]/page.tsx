import { Metadata } from "next";
import { PropertyService } from "@/services/property.service";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { 
  MapPin, BedDouble, Bath, Square, Compass, 
  Calendar, CheckCircle, Share2, Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import VerificationBadge from "@/components/shared/VerificationBadge";
import PropertyCard from "@/components/property/PropertyCard";
import EmiCalculator from "@/components/property/EmiCalculator";
import PropertyMap from "@/components/property/PropertyMap";
import FavoriteButton from "@/components/property/FavoriteButton";
import ContactSellerModal from "@/components/property/ContactSellerModal";
import SiteVisitModal from "@/components/property/SiteVisitModal";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const dbProperty = await PropertyService.getPropertyBySlug(resolvedParams.slug);
  if (!dbProperty) return { title: "Property Not Found" };

  const formatPriceStr = (priceBigInt: any) => {
    const price = Number(priceBigInt);
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(2)} Lacs`;
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const title = `${dbProperty.bedrooms ? dbProperty.bedrooms + ' BHK ' : ''}${dbProperty.propertyType} for ${dbProperty.listingType === 'SALE' ? 'Sale' : 'Rent'} in ${dbProperty.locality?.name}, ${dbProperty.city?.name}`;
  const description = `${title} priced at ${formatPriceStr(dbProperty.price)}. ${dbProperty.carpetArea ? dbProperty.carpetArea + ' sqft.' : ''} ${dbProperty.description?.substring(0, 100)}...`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: dbProperty.images?.[0] ? [{ url: dbProperty.images[0].url }] : [],
    },
    alternates: {
      canonical: `https://nivasahq.com/properties/${dbProperty.slug}`
    }
  };
}
const formatPrice = (priceBigInt: any) => {
  const price = Number(priceBigInt);
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} Lacs`;
  return `₹${price.toLocaleString('en-IN')}`;
}

export default async function PropertyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const dbProperty = await PropertyService.getPropertyBySlug(resolvedParams.slug);

  if (!dbProperty) {
    return notFound();
  }

  const similarDbProperties = await PropertyService.getSimilarProperties(dbProperty.id, 3);
  
  const sortedImages = dbProperty.images && dbProperty.images.length > 0 
    ? [...dbProperty.images].sort((a, b) => a.sortOrder - b.sortOrder).map(img => img.url)
    : [
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
      ];

  const agentData = dbProperty.agent ? {
    name: dbProperty.agent.user?.name || "Verified Agent",
    company: dbProperty.agent.companyName || "Nivasa Premium Realty",
    experience: dbProperty.agent.experienceYears ? `${dbProperty.agent.experienceYears} Years` : "5+ Years",
    avatar: dbProperty.agent.user?.avatarUrl || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80"
  } : dbProperty.builder ? {
    name: dbProperty.builder.user?.name || dbProperty.builder.companyName || "Verified Builder",
    company: dbProperty.builder.companyName || "Nivasa Premium Builder",
    experience: dbProperty.builder.establishedYear ? `Since ${dbProperty.builder.establishedYear}` : "Trusted Builder",
    avatar: dbProperty.builder.user?.avatarUrl || dbProperty.builder.logoUrl || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80"
  } : {
    name: "Verified Owner",
    company: "Direct Owner",
    experience: "Property Owner",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80"
  };

  const property = {
    id: dbProperty.id,
    title: dbProperty.title,
    price: formatPrice(dbProperty.price),
    pricePerSqft: dbProperty.pricePerSqft ? `₹${dbProperty.pricePerSqft}/sq.ft` : 'Price on Request',
    location: [dbProperty.locality?.name, dbProperty.city?.name].filter(Boolean).join(', '),
    type: dbProperty.propertyType?.replace(/_/g, ' ') || 'Property',
    status: dbProperty.possessionStatus?.replace(/_/g, ' ') || 'Ready to Move',
    verified: dbProperty.verificationStatus === 'VERIFIED',
    featured: dbProperty.isFeatured,
    bhk: dbProperty.bedrooms || 0,
    bathrooms: dbProperty.bathrooms || 0,
    area: `${dbProperty.carpetArea || dbProperty.builtUpArea || 0} ${dbProperty.areaUnit || 'SQFT'}`,
    facing: dbProperty.facing || 'East',
    age: dbProperty.ageYears ? `${dbProperty.ageYears} Years` : 'New Construction',
    floor: dbProperty.floor ? `${dbProperty.floor} of ${dbProperty.totalFloors || dbProperty.floor}` : 'Ground',
    furnishing: dbProperty.furnishing?.replace(/_/g, ' ') || 'Semi-Furnished',
    description: dbProperty.description || 'A premium property listed on NivasaHQ.',
    images: sortedImages,
    floorPlans: dbProperty.floorPlans || [],
    reraNumber: dbProperty.reraNumber,
    reraApproved: dbProperty.reraApproved,
    amenities: dbProperty.amenities?.map((a: any) => a.amenity?.name || a.name) || [],
    agent: agentData,
    similarProperties: similarDbProperties.map((p: any) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      price: formatPrice(p.price),
      type: p.propertyType?.replace(/_/g, ' ') || 'Property',
      bhk: p.bedrooms || 0,
      area: `${p.carpetArea || p.builtUpArea || 0} ${p.areaUnit || 'SQFT'}`,
      location: p.locality?.name || '',
      imageUrl: (p.images && p.images.length > 0) ? p.images[0].url : "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
      verified: p.verificationStatus === 'VERIFIED'
    })),
    lat: dbProperty.latitude ? parseFloat(dbProperty.latitude.toString()) : 19.0760,
    lng: dbProperty.longitude ? parseFloat(dbProperty.longitude.toString()) : 72.8777,
    rawPrice: Number(dbProperty.price)
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": property.title,
    "description": property.description,
    "url": `https://nivasahq.com/properties/${resolvedParams.slug}`,
    "image": property.images?.[0],
    "offers": {
      "@type": "Offer",
      "price": property.rawPrice,
      "priceCurrency": "INR"
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* Property Gallery */}
      <div className="container mx-auto px-4 mb-8 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 rounded-2xl overflow-hidden h-[400px] md:h-[500px]">
          <div className="md:col-span-2 relative h-full">
            <Image 
              src={property.images[0] || property.images[property.images.length - 1]} 
              alt="Primary Image" 
              fill 
              className="object-cover hover:scale-105 transition-transform duration-700" 
              priority
            />
          </div>
          <div className="hidden md:grid grid-rows-2 gap-2">
            <div className="relative h-full">
              <Image src={property.images[1] || property.images[0]} alt="Image 2" fill className="object-cover" />
            </div>
            <div className="relative h-full">
              <Image src={property.images[2] || property.images[0]} alt="Image 3" fill className="object-cover" />
            </div>
          </div>
          <div className="hidden md:block relative h-full">
            <Image src={property.images[3] || property.images[0]} alt="Image 4" fill className="object-cover" />
            {property.images.length > 4 && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer hover:bg-black/50 transition">
                <span className="text-white font-bold text-lg">+{property.images.length - 4} Photos</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="w-full lg:w-2/3 space-y-8">
            
            {/* Header */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-[#0f172a] text-white px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                      {property.status}
                    </span>
                    {property.verified && <VerificationBadge size="md" />}
                    {property.reraApproved && property.reraNumber && (
                      <span className="bg-green-100 text-green-800 border border-green-200 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle size={14} /> RERA: {property.reraNumber}
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl md:text-4xl font-bold text-[#0f172a] mb-2">
                    {property.title}
                  </h1>
                  <p className="text-gray-600 flex items-center gap-1.5 text-lg">
                    <MapPin size={18} /> {property.location}
                  </p>
                </div>
                <div className="text-left md:text-right">
                  <div className="text-3xl md:text-4xl font-bold text-[#d4a853]">{property.price}</div>
                  <div className="text-gray-500 text-sm mt-1">{property.pricePerSqft}</div>
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <Button variant="outline" className="flex-1 md:flex-none flex items-center gap-2">
                  <Share2 size={16} /> Share
                </Button>
                <FavoriteButton 
                  propertyId={dbProperty.id} 
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md"
                  iconClassName="h-4 w-4"
                >
                  Save
                </FavoriteButton>
              </div>
            </div>

            {/* Key Details Grid */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-[#0f172a] mb-6">Key Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex flex-col">
                  <span className="text-gray-500 text-sm mb-1 flex items-center gap-1.5"><BedDouble size={16} /> Bedrooms</span>
                  <span className="font-semibold text-lg text-gray-800">{property.bhk} BHK</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 text-sm mb-1 flex items-center gap-1.5"><Bath size={16} /> Bathrooms</span>
                  <span className="font-semibold text-lg text-gray-800">{property.bathrooms}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 text-sm mb-1 flex items-center gap-1.5"><Square size={16} /> Area</span>
                  <span className="font-semibold text-lg text-gray-800">{property.area}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 text-sm mb-1 flex items-center gap-1.5"><Compass size={16} /> Facing</span>
                  <span className="font-semibold text-lg text-gray-800">{property.facing}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 text-sm mb-1 flex items-center gap-1.5"><Calendar size={16} /> Age</span>
                  <span className="font-semibold text-lg text-gray-800">{property.age}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 text-sm mb-1">Floor</span>
                  <span className="font-semibold text-lg text-gray-800">{property.floor}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 text-sm mb-1">Furnishing</span>
                  <span className="font-semibold text-lg text-gray-800">{property.furnishing}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 text-sm mb-1">Property Type</span>
                  <span className="font-semibold text-lg text-gray-800">{property.type}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-[#0f172a] mb-4">Description</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {property.description}
              </p>
            </div>

            {/* Amenities */}
            {property.amenities.length > 0 && (
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-[#0f172a] mb-6">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.amenities.map((amenity: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 text-gray-700">
                      <CheckCircle size={18} className="text-green-500" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Floor Plans */}
            {property.floorPlans.length > 0 && (
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-[#0f172a] mb-6">Floor Plans</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {property.floorPlans.map((plan: any) => (
                    <div key={plan.id} className="border border-gray-100 rounded-xl overflow-hidden group">
                      <div className="relative h-64 bg-slate-50 p-4 flex items-center justify-center">
                        <Image 
                          src={plan.imageUrl} 
                          alt={plan.title} 
                          fill 
                          className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-4 bg-white border-t border-gray-100">
                        <h4 className="font-bold text-slate-800">{plan.title}</h4>
                        <p className="text-sm text-slate-500 mt-1">
                          {plan.bedrooms && `${plan.bedrooms} BHK • `}
                          {plan.area && `${plan.area} ${plan.areaUnit}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location Map */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-[#0f172a] mb-4">Location</h2>
              <PropertyMap lat={property.lat} lng={property.lng} address={property.location} />
            </div>
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-1/3 space-y-6">
            
            {/* Contact Agent Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <h3 className="text-lg font-bold text-[#0f172a] mb-6">Contact Seller</h3>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100">
                  <Image src={property.agent.avatar} alt={property.agent.name} fill className="object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-lg">{property.agent.name}</h4>
                  <p className="text-gray-500 text-sm">{property.agent.company}</p>
                  <p className="text-[#d4a853] text-sm font-medium mt-1">{property.agent.experience}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <ContactSellerModal 
                  propertyId={dbProperty.id} 
                  triggerClassName="w-full bg-[#0f172a] hover:bg-[#0f172a]/90 text-white font-semibold py-6" 
                />
                <SiteVisitModal 
                  propertyId={dbProperty.id} 
                  agentId={"dummy-agent-id"} 
                  triggerClassName="w-full font-semibold py-6 border-[#0f172a] text-[#0f172a] hover:bg-gray-50" 
                />
              </div>
            </div>

            {/* EMI Calculator */}
            <EmiCalculator propertyPrice={property.rawPrice} />

          </aside>
        </div>

        {/* Similar Properties */}
        {property.similarProperties.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-[#0f172a] mb-8">Similar Properties</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {property.similarProperties.map((prop: any) => (
                <PropertyCard key={prop.id} {...prop} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
