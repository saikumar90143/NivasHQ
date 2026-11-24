/**
 * JSON-LD Structured Data component for SEO.
 * Renders schema.org data as a <script type="application/ld+json"> tag.
 * All schema types for the real estate domain are supported.
 * This is a SERVER component — never add 'use client'.
 */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://nivasahq.com';

// ============================================
// SCHEMA TYPES
// ============================================

interface OrganizationSchema {
  type: 'Organization';
}

interface WebSiteSchema {
  type: 'WebSite';
}

interface BreadcrumbSchema {
  type: 'BreadcrumbList';
  items: Array<{ name: string; href: string }>;
}

interface RealEstateListingSchema {
  type: 'RealEstateListing';
  name: string;
  description?: string;
  url: string;
  price: number;
  priceCurrency?: string;
  address: {
    streetAddress?: string;
    addressLocality: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
  numberOfRooms?: number;
  floorSize?: number;
  floorSizeUnit?: string;
  image?: string[];
  latitude?: number;
  longitude?: number;
}

interface RealEstateAgentSchema {
  type: 'RealEstateAgent';
  name: string;
  url?: string;
  telephone?: string;
  email?: string;
  image?: string;
  address?: {
    addressLocality: string;
    addressRegion?: string;
  };
}

interface FAQSchema {
  type: 'FAQPage';
  items: Array<{ question: string; answer: string }>;
}

export type StructuredDataInput =
  | OrganizationSchema
  | WebSiteSchema
  | BreadcrumbSchema
  | RealEstateListingSchema
  | RealEstateAgentSchema
  | FAQSchema;

// ============================================
// SCHEMA BUILDERS
// ============================================

function buildOrganization() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'NivasaHQ',
    url: APP_URL,
    logo: `${APP_URL}/logo.png`,
    description:
      'Premium real estate marketplace in Hyderabad. Find verified properties for sale and rent across 100+ localities.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Hyderabad',
      addressRegion: 'Telangana',
      addressCountry: 'IN',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      availableLanguage: ['English', 'Hindi', 'Telugu'],
    },
    sameAs: [
      'https://www.instagram.com/nivasahq',
      'https://twitter.com/nivasahq',
      'https://www.linkedin.com/company/nivasahq',
    ],
  };
}

function buildWebSite() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'NivasaHQ',
    url: APP_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${APP_URL}/properties?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

function buildBreadcrumb(items: Array<{ name: string; href: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${APP_URL}${item.href}`,
    })),
  };
}

function buildRealEstateListing(data: RealEstateListingSchema) {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: data.name,
    description: data.description,
    url: data.url,
    offers: {
      '@type': 'Offer',
      price: data.price,
      priceCurrency: data.priceCurrency || 'INR',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: data.address.streetAddress,
      addressLocality: data.address.addressLocality,
      addressRegion: data.address.addressRegion || 'Telangana',
      postalCode: data.address.postalCode,
      addressCountry: data.address.addressCountry || 'IN',
    },
    ...(data.numberOfRooms ? { numberOfRooms: data.numberOfRooms } : {}),
    ...(data.floorSize
      ? {
          floorSize: {
            '@type': 'QuantitativeValue',
            value: data.floorSize,
            unitCode: data.floorSizeUnit || 'FTK', // Square feet
          },
        }
      : {}),
    ...(data.image?.length ? { image: data.image } : {}),
    ...(data.latitude && data.longitude
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: data.latitude,
            longitude: data.longitude,
          },
        }
      : {}),
  };
}

function buildRealEstateAgent(data: RealEstateAgentSchema) {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: data.name,
    ...(data.url ? { url: data.url } : {}),
    ...(data.telephone ? { telephone: data.telephone } : {}),
    ...(data.email ? { email: data.email } : {}),
    ...(data.image ? { image: data.image } : {}),
    ...(data.address
      ? {
          address: {
            '@type': 'PostalAddress',
            addressLocality: data.address.addressLocality,
            addressRegion: data.address.addressRegion || 'Telangana',
            addressCountry: 'IN',
          },
        }
      : {}),
  };
}

function buildFAQ(items: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

// ============================================
// COMPONENT
// ============================================

interface StructuredDataProps {
  data: StructuredDataInput | StructuredDataInput[];
}

export default function StructuredData({ data }: StructuredDataProps) {
  const schemas = Array.isArray(data) ? data : [data];

  const jsonLds = schemas.map((schema) => {
    switch (schema.type) {
      case 'Organization':
        return buildOrganization();
      case 'WebSite':
        return buildWebSite();
      case 'BreadcrumbList':
        return buildBreadcrumb(schema.items);
      case 'RealEstateListing':
        return buildRealEstateListing(schema);
      case 'RealEstateAgent':
        return buildRealEstateAgent(schema);
      case 'FAQPage':
        return buildFAQ(schema.items);
      default:
        return null;
    }
  }).filter(Boolean);

  return (
    <>
      {jsonLds.map((jsonLd, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ))}
    </>
  );
}
