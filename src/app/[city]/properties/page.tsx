import PropertiesPage from "@/app/properties/page";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const city = resolvedParams.city.replace(/-/g, ' ');
  const capitalizedCity = city.charAt(0).toUpperCase() + city.slice(1);
  return {
    title: `Properties for Sale in ${capitalizedCity} | NivasaHQ`,
    description: `Find the best properties for sale and rent in ${capitalizedCity}. Explore verified listings, photos, and prices.`,
    alternates: {
      canonical: `https://nivasahq.com/${resolvedParams.city}/properties`
    }
  };
}

export default async function CityPropertiesPage({
  params,
  searchParams,
}: {
  params: Promise<{ city: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return <PropertiesPage searchParams={searchParams} params={params} />;
}
