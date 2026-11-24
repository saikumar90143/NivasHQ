import { Metadata } from "next";
import { db } from "@/lib/db";
import MapSearchClient from "@/components/map/MapSearchClient";

export const metadata: Metadata = {
  title: "Map Search | NivasaHQ",
  description: "Search properties geospatially across the city.",
};

// Mock fallback data
const mockProperties = [
  {
    id: "map-1",
    title: "Skyline Apartment",
    price: "85000000",
    propertyType: "APARTMENT",
    bedrooms: 4,
    carpetArea: "3450",
    locality: { name: "Worli" },
    city: { name: "Mumbai" },
    verificationStatus: "VERIFIED",
    isFeatured: true,
  },
  {
    id: "map-2",
    title: "Sea View Penthouse",
    price: "120000000",
    propertyType: "PENTHOUSE",
    bedrooms: 5,
    carpetArea: "4500",
    locality: { name: "Bandra" },
    city: { name: "Mumbai" },
    verificationStatus: "VERIFIED",
    isFeatured: true,
  }
];

export default async function MapSearchPage() {
  let properties: any[] = [];
  
  try {
    properties = await db.property.findMany({
      where: {
        status: 'ACTIVE'
      },
      include: {
        locality: true,
        city: true,
      },
      take: 20, // Limit for map view performance
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.warn("Database connection failed, using mock properties for Map.", error);
    properties = mockProperties;
  }

  return <MapSearchClient properties={properties} />;
}
