import PropertiesPage from "@/app/properties/page";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ city: string; locality: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const city = resolvedParams.city.replace(/-/g, ' ');
  const locality = resolvedParams.locality.replace(/-/g, ' ');
  const capitalizedCity = city.charAt(0).toUpperCase() + city.slice(1);
  const capitalizedLocality = locality.charAt(0).toUpperCase() + locality.slice(1);
  
  return {
    title: `Properties for Sale in ${capitalizedLocality}, ${capitalizedCity} | NivasaHQ`,
    description: `Find the best properties for sale and rent in ${capitalizedLocality}, ${capitalizedCity}. Explore verified listings, photos, and prices.`,
  };
}

export default async function LocalityPropertiesPage({
  params,
  searchParams,
}: {
  params: Promise<{ city: string; locality: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return <PropertiesPage searchParams={searchParams} params={params} />;
}
