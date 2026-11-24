export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  APARTMENT: "Apartment",
  VILLA: "Villa",
  PLOT: "Plot",
  INDEPENDENT_HOUSE: "Independent House",
  PENTHOUSE: "Penthouse",
  STUDIO: "Studio",
  COMMERCIAL_OFFICE: "Commercial Office",
  COMMERCIAL_SHOP: "Shop",
  WAREHOUSE: "Warehouse",
  FARM_HOUSE: "Farm House",
  PG: "PG/Co-living",
  BUILDER_FLOOR: "Builder Floor",
};

export const LISTING_TYPE_LABELS: Record<string, string> = {
  SALE: "Buy",
  RENT: "Rent",
  LEASE: "Lease",
};

export const FURNISHING_LABELS: Record<string, string> = {
  UNFURNISHED: "Unfurnished",
  SEMI_FURNISHED: "Semi Furnished",
  FULLY_FURNISHED: "Fully Furnished",
};

export const FACING_LABELS: Record<string, string> = {
  NORTH: "North",
  SOUTH: "South",
  EAST: "East",
  WEST: "West",
  NORTH_EAST: "North-East",
  NORTH_WEST: "North-West",
  SOUTH_EAST: "South-East",
  SOUTH_WEST: "South-West",
};

export const POSSESSION_LABELS: Record<string, string> = {
  READY_TO_MOVE: "Ready to Move",
  UNDER_CONSTRUCTION: "Under Construction",
  UPCOMING: "Upcoming",
};

export const CONSTRUCTION_STATUS_LABELS: Record<string, string> = {
  NEW_LAUNCH: "New Launch",
  UNDER_CONSTRUCTION: "Under Construction",
  READY_TO_MOVE: "Ready to Move",
};

export const PROPERTY_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  PENDING_REVIEW: "Pending Review",
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  EXPIRED: "Expired",
  SOLD: "Sold",
  RENTED: "Rented",
};

export const VERIFICATION_STATUS_LABELS: Record<string, string> = {
  UNVERIFIED: "Unverified",
  PENDING: "Verification Pending",
  VERIFIED: "Verified",
  REJECTED: "Rejected",
};

export const VERIFICATION_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  VERIFIED: { bg: "bg-emerald-50", text: "text-emerald-700", icon: "text-emerald-500" },
  PENDING: { bg: "bg-amber-50", text: "text-amber-700", icon: "text-amber-500" },
  UNVERIFIED: { bg: "bg-gray-50", text: "text-gray-600", icon: "text-gray-400" },
  REJECTED: { bg: "bg-red-50", text: "text-red-700", icon: "text-red-500" },
};

export const BHK_OPTIONS = [1, 2, 3, 4, 5] as const;

export const BUDGET_RANGES_SALE = [
  { min: 0, max: 2000000, label: "Under ₹20 L" },
  { min: 2000000, max: 3000000, label: "₹20-30 L" },
  { min: 3000000, max: 5000000, label: "₹30-50 L" },
  { min: 5000000, max: 7500000, label: "₹50-75 L" },
  { min: 7500000, max: 10000000, label: "₹75 L - ₹1 Cr" },
  { min: 10000000, max: 15000000, label: "₹1-1.5 Cr" },
  { min: 15000000, max: 20000000, label: "₹1.5-2 Cr" },
  { min: 20000000, max: 30000000, label: "₹2-3 Cr" },
  { min: 30000000, max: 50000000, label: "₹3-5 Cr" },
  { min: 50000000, max: 100000000, label: "₹5-10 Cr" },
  { min: 100000000, max: Infinity, label: "₹10 Cr+" },
] as const;

export const BUDGET_RANGES_RENT = [
  { min: 0, max: 10000, label: "Under ₹10K" },
  { min: 10000, max: 15000, label: "₹10-15K" },
  { min: 15000, max: 20000, label: "₹15-20K" },
  { min: 20000, max: 30000, label: "₹20-30K" },
  { min: 30000, max: 50000, label: "₹30-50K" },
  { min: 50000, max: 75000, label: "₹50-75K" },
  { min: 75000, max: 100000, label: "₹75K-1L" },
  { min: 100000, max: 200000, label: "₹1-2 L" },
  { min: 200000, max: Infinity, label: "₹2 L+" },
] as const;

export const AREA_RANGES = [
  { min: 0, max: 500, label: "Under 500 sq.ft" },
  { min: 500, max: 1000, label: "500-1000 sq.ft" },
  { min: 1000, max: 1500, label: "1000-1500 sq.ft" },
  { min: 1500, max: 2000, label: "1500-2000 sq.ft" },
  { min: 2000, max: 3000, label: "2000-3000 sq.ft" },
  { min: 3000, max: 5000, label: "3000-5000 sq.ft" },
  { min: 5000, max: Infinity, label: "5000+ sq.ft" },
] as const;

export const AMENITY_CATEGORIES = {
  basic: "Basic",
  lifestyle: "Lifestyle",
  safety: "Safety & Security",
  sports: "Sports & Recreation",
  convenience: "Convenience",
} as const;

export const DEFAULT_AMENITIES = [
  { name: "Parking", slug: "parking", icon: "car", category: "basic" },
  { name: "Power Backup", slug: "power-backup", icon: "zap", category: "basic" },
  { name: "Lift", slug: "lift", icon: "arrow-up-down", category: "basic" },
  { name: "Water Supply", slug: "water-supply", icon: "droplets", category: "basic" },
  { name: "Gas Pipeline", slug: "gas-pipeline", icon: "flame", category: "basic" },
  { name: "Swimming Pool", slug: "swimming-pool", icon: "waves", category: "lifestyle" },
  { name: "Gym", slug: "gym", icon: "dumbbell", category: "lifestyle" },
  { name: "Clubhouse", slug: "clubhouse", icon: "home", category: "lifestyle" },
  { name: "Garden", slug: "garden", icon: "trees", category: "lifestyle" },
  { name: "Children Play Area", slug: "children-play-area", icon: "baby", category: "lifestyle" },
  { name: "Jogging Track", slug: "jogging-track", icon: "footprints", category: "sports" },
  { name: "Indoor Games", slug: "indoor-games", icon: "gamepad-2", category: "sports" },
  { name: "Tennis Court", slug: "tennis-court", icon: "circle-dot", category: "sports" },
  { name: "Basketball Court", slug: "basketball-court", icon: "circle", category: "sports" },
  { name: "CCTV", slug: "cctv", icon: "camera", category: "safety" },
  { name: "Security", slug: "security", icon: "shield-check", category: "safety" },
  { name: "Gated Community", slug: "gated-community", icon: "lock", category: "safety" },
  { name: "Fire Safety", slug: "fire-safety", icon: "flame-kindling", category: "safety" },
  { name: "Intercom", slug: "intercom", icon: "phone", category: "safety" },
  { name: "Visitor Parking", slug: "visitor-parking", icon: "parking-circle", category: "convenience" },
  { name: "Maintenance Staff", slug: "maintenance-staff", icon: "wrench", category: "convenience" },
  { name: "Rain Water Harvesting", slug: "rain-water-harvesting", icon: "cloud-rain", category: "convenience" },
  { name: "Waste Management", slug: "waste-management", icon: "trash-2", category: "convenience" },
  { name: "EV Charging", slug: "ev-charging", icon: "plug-zap", category: "convenience" },
] as const;

export const LEAD_STATUS_LABELS: Record<string, string> = {
  NEW: "New",
  ASSIGNED: "Assigned",
  CONTACTED: "Contacted",
  SITE_VISIT_SCHEDULED: "Site Visit Scheduled",
  SITE_VISIT_DONE: "Site Visit Done",
  NEGOTIATION: "Negotiation",
  CLOSED_WON: "Closed Won",
  CLOSED_LOST: "Closed Lost",
  SPAM: "Spam",
};

export const LEAD_STATUS_COLORS: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-800",
  ASSIGNED: "bg-purple-100 text-purple-800",
  CONTACTED: "bg-yellow-100 text-yellow-800",
  SITE_VISIT_SCHEDULED: "bg-indigo-100 text-indigo-800",
  SITE_VISIT_DONE: "bg-cyan-100 text-cyan-800",
  NEGOTIATION: "bg-orange-100 text-orange-800",
  CLOSED_WON: "bg-green-100 text-green-800",
  CLOSED_LOST: "bg-red-100 text-red-800",
  SPAM: "bg-gray-100 text-gray-800",
};

export const TIMELINE_OPTIONS = [
  { value: "immediate", label: "Immediately" },
  { value: "1_month", label: "Within 1 month" },
  { value: "3_months", label: "Within 3 months" },
  { value: "6_months", label: "Within 6 months" },
  { value: "1_year", label: "Within 1 year" },
  { value: "no_rush", label: "No rush" },
] as const;

export const PROPERTY_LISTING_TABS = [
  { value: "SALE", label: "Buy", icon: "home" },
  { value: "RENT", label: "Rent", icon: "key" },
  { value: "PLOT", label: "Plots", icon: "map" },
  { value: "VILLA", label: "Villas", icon: "castle" },
  { value: "COMMERCIAL", label: "Commercial", icon: "building-2" },
] as const;

export const PAGE_SIZE = 20;
export const MAX_COMPARE_PROPERTIES = 4;
export const MAX_IMAGES_PER_PROPERTY = 20;
export const MAX_IMAGE_SIZE_MB = 10;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
export const PROPERTY_EXPIRY_DAYS = 90;
export const SEARCH_DEBOUNCE_MS = 300;
