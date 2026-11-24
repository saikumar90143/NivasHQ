import type { Metadata } from 'next';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://nivasahq.com';
const APP_NAME = 'NivasaHQ';

export const DEFAULT_METADATA: Metadata = {
  metadataBase: new URL(APP_URL),
  applicationName: APP_NAME,
  title: {
    default: 'NivasaHQ — Premium Real Estate in Hyderabad',
    template: '%s | NivasaHQ',
  },
  description:
    'Search verified properties for sale and rent in Hyderabad. Browse apartments, villas, plots, and commercial spaces in Gachibowli, Banjara Hills, Jubilee Hills, Kokapet, and 100+ localities.',
  keywords: [
    'real estate hyderabad',
    'property for sale hyderabad',
    'flats for rent hyderabad',
    'apartments gachibowli',
    'villas banjara hills',
    'plots for sale hyderabad',
    'commercial property hyderabad',
    'nivasahq',
    '2bhk hyderabad',
    '3bhk hyderabad',
    'property dealers hyderabad',
  ],
  authors: [{ name: APP_NAME }],
  creator: APP_NAME,
  publisher: APP_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: APP_URL,
    siteName: APP_NAME,
    title: 'NivasaHQ — Premium Real Estate in Hyderabad',
    description:
      'Find verified apartments, villas, plots & commercial properties across Hyderabad. Connect with trusted agents & builders.',
    images: [{
      url: `${APP_URL}/og-image.jpg`,
      width: 1200,
      height: 630,
      alt: 'NivasaHQ — Real Estate Hyderabad',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NivasaHQ — Premium Real Estate in Hyderabad',
    description: 'Search verified properties for sale & rent in Hyderabad.',
    images: [`${APP_URL}/og-image.jpg`],
  },
  alternates: {
    canonical: APP_URL,
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  verification: {
    google: '',
  },
};

export const APP_URL_STRING = APP_URL;
export { APP_NAME };

// Helper to build page-specific metadata
export function buildMetadata(overrides: Partial<Metadata>): Metadata {
  return {
    ...DEFAULT_METADATA,
    ...overrides,
  };
}

// City-specific metadata templates
export const CITY_META = {
  hyderabad: {
    name: 'Hyderabad',
    state: 'Telangana',
    description: 'Premium real estate marketplace for Hyderabad, Telangana. Verified properties in 100+ localities.',
  },
} as const;
