export interface HyderabadLocality {
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  zone: string;
  description: string;
  popularFor: string[];
}

export const HYDERABAD_LOCALITIES: HyderabadLocality[] = [
  {
    name: "Kokapet",
    slug: "kokapet",
    latitude: 17.4062,
    longitude: 78.3485,
    zone: "West",
    description: "Premium residential hub near Financial District with rapid infrastructure development",
    popularFor: ["Luxury Apartments", "Gated Communities", "Investment"],
  },
  {
    name: "Gachibowli",
    slug: "gachibowli",
    latitude: 17.4401,
    longitude: 78.3489,
    zone: "West",
    description: "IT corridor and educational hub with excellent connectivity",
    popularFor: ["IT Professionals", "Apartments", "Commercial"],
  },
  {
    name: "Financial District",
    slug: "financial-district",
    latitude: 17.4126,
    longitude: 78.3340,
    zone: "West",
    description: "Hyderabad's premier business district with high-rise apartments and offices",
    popularFor: ["Premium Apartments", "Office Space", "IT Companies"],
  },
  {
    name: "Narsingi",
    slug: "narsingi",
    latitude: 17.3948,
    longitude: 78.3571,
    zone: "West",
    description: "Rapidly developing residential area with good value properties",
    popularFor: ["Affordable Housing", "Villas", "Plots"],
  },
  {
    name: "Tellapur",
    slug: "tellapur",
    latitude: 17.4489,
    longitude: 78.3148,
    zone: "West",
    description: "Emerging residential destination with excellent connectivity to IT hubs",
    popularFor: ["New Projects", "Villas", "Gated Communities"],
  },
  {
    name: "Kondapur",
    slug: "kondapur",
    latitude: 17.4600,
    longitude: 78.3532,
    zone: "West",
    description: "Well-established residential area close to HITEC City",
    popularFor: ["Apartments", "IT Professionals", "Rental Market"],
  },
  {
    name: "Madhapur",
    slug: "madhapur",
    latitude: 17.4484,
    longitude: 78.3908,
    zone: "West",
    description: "Heart of HITEC City with premium commercial and residential properties",
    popularFor: ["Premium Apartments", "Commercial", "IT Hub"],
  },
  {
    name: "Manikonda",
    slug: "manikonda",
    latitude: 17.4045,
    longitude: 78.3856,
    zone: "West",
    description: "Affordable residential area with good connectivity to IT corridor",
    popularFor: ["Budget Apartments", "Rental", "Working Professionals"],
  },
  {
    name: "Banjara Hills",
    slug: "banjara-hills",
    latitude: 17.4138,
    longitude: 78.4488,
    zone: "Central",
    description: "Hyderabad's most prestigious address with luxury villas and premium apartments",
    popularFor: ["Luxury Villas", "Premium Living", "High-end Retail"],
  },
  {
    name: "Jubilee Hills",
    slug: "jubilee-hills",
    latitude: 17.4318,
    longitude: 78.4073,
    zone: "Central",
    description: "Elite residential area known for celebrity homes and upscale living",
    popularFor: ["Luxury Properties", "Villas", "Premium Apartments"],
  },
  {
    name: "Shamshabad",
    slug: "shamshabad",
    latitude: 17.2543,
    longitude: 78.4266,
    zone: "South",
    description: "Airport area with upcoming commercial and residential developments",
    popularFor: ["Plots", "Warehouses", "Investment", "Airport Proximity"],
  },
  {
    name: "Kompally",
    slug: "kompally",
    latitude: 17.5430,
    longitude: 78.4846,
    zone: "North",
    description: "Emerging northern corridor with affordable housing options",
    popularFor: ["Affordable Apartments", "Plots", "Villas"],
  },
];

export const HYDERABAD_ZONES = ["West", "East", "North", "South", "Central"] as const;

export const HYDERABAD_COORDINATES = {
  latitude: 17.385,
  longitude: 78.4867,
  zoom: 11,
} as const;

export const NEARBY_PLACE_CATEGORIES = [
  { value: "it_hub", label: "IT Hubs", icon: "building-2" },
  { value: "school", label: "Schools", icon: "graduation-cap" },
  { value: "hospital", label: "Hospitals", icon: "heart-pulse" },
  { value: "metro", label: "Metro Stations", icon: "train-front" },
  { value: "airport", label: "Airport", icon: "plane" },
  { value: "shopping", label: "Shopping", icon: "shopping-bag" },
  { value: "highway", label: "Major Roads", icon: "route" },
  { value: "park", label: "Parks", icon: "trees" },
] as const;

export const STATES = [
  { name: "Telangana", slug: "telangana" },
] as const;

export const CITIES = [
  { name: "Hyderabad", slug: "hyderabad", stateSlug: "telangana" },
] as const;
