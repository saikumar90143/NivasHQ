export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterOption {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';
  value: any;
}

export interface SearchResults<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface PropertyFilters {
  propertyType?: string[];
  listingType?: string;
  bedrooms?: number[];
  budget?: { min: number; max: number };
  area?: { min: number; max: number };
  furnishing?: string[];
  possession?: string[];
  amenities?: string[];
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface GeoSearchParams {
  bounds?: MapBounds;
  center?: { lat: number; lng: number };
  radiusKm?: number;
  zoom?: number;
}
