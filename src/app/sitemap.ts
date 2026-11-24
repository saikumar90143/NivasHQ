import { MetadataRoute } from 'next';
import { db } from '@/lib/db';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://nivasahq.com';

export const revalidate = 3600; // Regenerate hourly

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: APP_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${APP_URL}/properties`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${APP_URL}/buy`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${APP_URL}/rent`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${APP_URL}/projects`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${APP_URL}/locations`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${APP_URL}/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${APP_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${APP_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${APP_URL}/guides`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
  ];

  // Dynamic property pages
  let propertyPages: MetadataRoute.Sitemap = [];
  let locationPages: MetadataRoute.Sitemap = [];

  try {
    const properties = await db.property.findMany({
      where: { status: 'ACTIVE' },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      take: 5000, // Limit for sitemap size
    });

    propertyPages = properties.map((p) => ({
      url: `${APP_URL}/properties/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    // Location pages
    const localities = await db.location.findMany({
      where: { level: 'LOCALITY', isPopular: true },
      select: { slug: true, updatedAt: true, parent: { select: { slug: true } } },
    });

    const cities = await db.location.findMany({
      where: { level: 'CITY' },
      select: { slug: true, updatedAt: true },
    });

    locationPages = [
      ...cities.map((city) => ({
        url: `${APP_URL}/${city.slug}/properties`,
        lastModified: city.updatedAt,
        changeFrequency: 'daily' as const,
        priority: 0.8,
      })),
      ...localities.map((loc) => ({
        url: `${APP_URL}/${loc.parent?.slug || 'india'}/${loc.slug}/properties`,
        lastModified: loc.updatedAt,
        changeFrequency: 'daily' as const,
        priority: 0.75,
      }))
    ];
  } catch {
    // DB not available during static build — return static pages only
  }

  return [...staticPages, ...locationPages, ...propertyPages];
}
