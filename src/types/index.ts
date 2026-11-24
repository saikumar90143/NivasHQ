import type {
  ListingType,
  PropertyType,
  PropertyStatus,
  VerificationStatus,
  Furnishing,
  Facing,
  PossessionStatus,
  ConstructionStatus,
  LeadStatus,
  LeadSource,
  Role,
} from "@prisma/client";

// ===================================
// Pagination
// ===================================
export interface CursorPaginationParams {
  cursor?: string;
  pageSize?: number;
  direction?: "forward" | "backward";
}

export interface CursorPaginatedResult<T> {
  data: T[];
  nextCursor: string | null;
  prevCursor: string | null;
  hasMore: boolean;
  totalCount?: number;
}

export interface OffsetPaginationParams {
  page?: number;
  pageSize?: number;
}

export interface OffsetPaginatedResult<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ===================================
// Property Search
// ===================================
export interface PropertySearchParams {
  city?: string;
  locality?: string;
  localityId?: string;
  listingType?: ListingType;
  propertyType?: PropertyType | PropertyType[];
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number | number[];
  bathrooms?: number;
  minArea?: number;
  maxArea?: number;
  furnishing?: Furnishing;
  possessionStatus?: PossessionStatus;
  constructionStatus?: ConstructionStatus;
  facing?: Facing;
  parking?: number;
  reraApproved?: boolean;
  verifiedOnly?: boolean;
  amenities?: string[];
  sortBy?: PropertySortOption;
  cursor?: string;
  pageSize?: number;
  query?: string;
}

export type PropertySortOption =
  | "relevance"
  | "price_asc"
  | "price_desc"
  | "newest"
  | "oldest"
  | "area_asc"
  | "area_desc"
  | "popularity";

// ===================================
// Property Data (Lightweight for cards)
// ===================================
export interface PropertyCardData {
  id: string;
  slug: string;
  title: string;
  listingType: ListingType;
  propertyType: PropertyType;
  status: PropertyStatus;
  verificationStatus: VerificationStatus;
  price: bigint;
  pricePerSqft: number | null;
  isNegotiable: boolean;
  carpetArea: number | null;
  builtUpArea: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  parking: number | null;
  floor: number | null;
  totalFloors: number | null;
  furnishing: Furnishing | null;
  possessionStatus: PossessionStatus | null;
  localityName: string;
  cityName: string;
  localitySlug: string;
  citySlug: string;
  primaryImage: {
    url: string;
    thumbnailUrl: string | null;
    blurDataUrl: string | null;
    altText: string | null;
  } | null;
  imageCount: number;
  isFeatured: boolean;
  isPremium: boolean;
  agentName: string | null;
  agentAvatar: string | null;
  publishedAt: Date | null;
  createdAt: Date;
}

// ===================================
// Property Detail Data (Full)
// ===================================
export interface PropertyDetailData extends PropertyCardData {
  description: string | null;
  subType: string | null;
  verificationDate: Date | null;
  priceOnRequest: boolean;
  superBuiltUpArea: number | null;
  plotArea: number | null;
  areaUnit: string;
  balconies: number | null;
  facing: Facing | null;
  constructionStatus: ConstructionStatus | null;
  ageYears: number | null;
  address: string | null;
  pincode: string | null;
  latitude: number | null;
  longitude: number | null;
  reraNumber: string | null;
  reraApproved: boolean;
  viewCount: number;
  enquiryCount: number;
  favoriteCount: number;
  images: PropertyImageData[];
  videos: PropertyVideoData[];
  floorPlans: FloorPlanData[];
  amenities: AmenityData[];
  nearbyPlaces: NearbyPlaceData[];
  agent: AgentCardData | null;
  builder: BuilderCardData | null;
  project: ProjectCardData | null;
  expiresAt: Date | null;
}

export interface PropertyImageData {
  id: string;
  url: string;
  thumbnailUrl: string | null;
  blurDataUrl: string | null;
  altText: string | null;
  width: number | null;
  height: number | null;
  isPrimary: boolean;
}

export interface PropertyVideoData {
  id: string;
  url: string;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
}

export interface FloorPlanData {
  id: string;
  title: string | null;
  imageUrl: string;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  areaUnit: string;
}

export interface AmenityData {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  category: string | null;
}

export interface NearbyPlaceData {
  id: string;
  name: string;
  category: string;
  distanceKm?: number;
}

// ===================================
// Agent
// ===================================
export interface AgentCardData {
  id: string;
  userId: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  companyName: string | null;
  experienceYears: number | null;
  verificationStatus: VerificationStatus;
  rating: number | null;
  totalReviews: number;
  totalListings: number;
  totalDeals: number;
  responseRate: number | null;
  avgResponseTimeMinutes: number | null;
  areasServed: string[];
}

// ===================================
// Builder
// ===================================
export interface BuilderCardData {
  id: string;
  companyName: string;
  slug: string;
  logoUrl: string | null;
  description: string | null;
  website: string | null;
  verificationStatus: VerificationStatus;
  totalProjects: number;
  establishedYear: number | null;
}

// ===================================
// Project
// ===================================
export interface ProjectCardData {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  builderName: string;
  builderSlug: string;
  localityName: string;
  cityName: string;
  startingPrice: bigint | null;
  maxPrice: bigint | null;
  totalUnits: number | null;
  availableUnits: number | null;
  possessionStatus: PossessionStatus | null;
  completionDate: Date | null;
  reraNumber: string | null;
  reraApproved: boolean;
  isFeatured: boolean;
  primaryImage: string | null;
  imageCount: number;
}

// ===================================
// Location
// ===================================
export interface LocationData {
  id: string;
  name: string;
  slug: string;
  level: string;
  parentId: string | null;
  parentName: string | null;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  propertyCount: number;
  avgPricePerSqft: number | null;
  isPopular: boolean;
  imageUrl: string | null;
}

export interface LocationHierarchy {
  state: LocationData | null;
  city: LocationData | null;
  locality: LocationData | null;
}

// ===================================
// Lead
// ===================================
export interface LeadFormData {
  name: string;
  phone: string;
  email?: string;
  message?: string;
  preferredContact?: string;
  propertyId?: string;
  projectId?: string;
  source: LeadSource;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referrer?: string;
  landingPage?: string;
  device?: string;
}

export interface LeadTableData {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  status: LeadStatus;
  source: LeadSource;
  qualityScore: number | null;
  propertyTitle: string | null;
  propertySlug: string | null;
  contactedAt: Date | null;
  createdAt: Date;
}

// ===================================
// Buyer Requirement
// ===================================
export interface BuyerRequirementFormData {
  listingType: ListingType;
  propertyTypes: PropertyType[];
  cityId: string;
  localityIds?: string[];
  minBudget?: number;
  maxBudget?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  minArea?: number;
  maxArea?: number;
  possessionStatus?: PossessionStatus;
  furnishing?: Furnishing;
  amenityIds?: string[];
  name: string;
  phone: string;
  whatsapp?: string;
  description?: string;
  timeline?: string;
}

// ===================================
// Search
// ===================================
export interface SearchSuggestion {
  type: "locality" | "city" | "project" | "builder";
  id: string;
  text: string;
  subText?: string;
  slug?: string;
}

// ===================================
// Matching
// ===================================
export interface MatchScore {
  propertyId: string;
  totalScore: number;
  locationScore: number;
  budgetScore: number;
  bedroomScore: number;
  possessionScore: number;
  parkingScore: number;
  amenityScore: number;
}

// ===================================
// Ranking
// ===================================
export interface RankingFactors {
  relevance: number;
  verification: number;
  freshness: number;
  engagement: number;
  quality: number;
  sponsored: number;
  total: number;
}

// ===================================
// Analytics
// ===================================
export interface AnalyticsEventData {
  eventType: string;
  userId?: string;
  sessionId?: string;
  propertyId?: string;
  projectId?: string;
  data?: Record<string, unknown>;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referrer?: string;
  landingPage?: string;
  device?: string;
  browser?: string;
  os?: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalProperties: number;
  verifiedProperties: number;
  totalAgents: number;
  totalBuilders: number;
  totalLeads: number;
  totalSiteVisits: number;
  totalConversions: number;
  totalRevenue: number;
  mrr: number;
  activeSubscriptions: number;
}

// ===================================
// API
// ===================================
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

// ===================================
// EMI Calculator
// ===================================
export interface EMIResult {
  monthlyEMI: number;
  totalInterest: number;
  totalPayment: number;
  loanAmount: number;
}

export interface InvestmentResult {
  monthlyEMI: number;
  totalInterest: number;
  totalPayment: number;
  expectedRent: number;
  rentalYield: number;
  annualAppreciation: number;
  futureValue: number;
  estimatedROI: number;
}

// ===================================
// Map
// ===================================
export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapMarkerData {
  id: string;
  latitude: number;
  longitude: number;
  price: bigint;
  propertyType: PropertyType;
  bedrooms: number | null;
  slug: string;
  title: string;
}

export interface GeoSearchParams {
  latitude: number;
  longitude: number;
  radiusKm: number;
  filters?: PropertySearchParams;
}

// ===================================
// Session / Auth
// ===================================
export interface SessionUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: Role;
  phone: string | null;
}
