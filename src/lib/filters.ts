import { Prisma } from "@prisma/client";

export function buildPropertyWhereClause(searchParams: { [key: string]: string | string[] | undefined }, listingType: 'SALE' | 'RENT'): Prisma.PropertyWhereInput {
  const where: Prisma.PropertyWhereInput = {
    status: 'ACTIVE',
    listingType: listingType,
  };

  // 1. Location (City or Locality name match)
  const location = searchParams.location as string | undefined;
  if (location) {
    where.OR = [
      { locality: { name: { contains: location, mode: 'insensitive' } } },
      { city: { name: { contains: location, mode: 'insensitive' } } },
    ];
  }

  // 2. Price Range
  const minPrice = searchParams.minPrice ? Number(searchParams.minPrice) : undefined;
  const maxPrice = searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined;
  
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = BigInt(minPrice);
    if (maxPrice !== undefined) where.price.lte = BigInt(maxPrice);
  }

  // 3. Property Type
  let types = searchParams.type;
  if (types) {
    if (!Array.isArray(types)) types = [types];
    const mappedTypes: any[] = [];
    
    types.forEach(t => {
      switch (t) {
        case "Apartment": mappedTypes.push("APARTMENT"); break;
        case "Villa": mappedTypes.push("VILLA"); break;
        case "Independent House": mappedTypes.push("INDEPENDENT_HOUSE"); break;
        case "Plot": mappedTypes.push("PLOT"); break;
        case "Commercial": 
          mappedTypes.push("COMMERCIAL_OFFICE");
          mappedTypes.push("COMMERCIAL_SHOP");
          break;
      }
    });
    
    if (mappedTypes.length > 0) {
      where.propertyType = { in: mappedTypes };
    }
  }

  // 4. BHK (Bedrooms)
  let bhks = searchParams.bhk;
  if (bhks) {
    if (!Array.isArray(bhks)) bhks = [bhks];
    const exactBhks: number[] = [];
    let hasFourPlus = false;

    bhks.forEach(b => {
      if (b === "4+") hasFourPlus = true;
      else exactBhks.push(parseInt(b, 10));
    });

    if (exactBhks.length > 0 && hasFourPlus) {
      const bhkOr: Prisma.PropertyWhereInput[] = [
        { bedrooms: { in: exactBhks } },
        { bedrooms: { gte: 4 } }
      ];
      if (where.OR) {
        where.AND = [{ OR: where.OR }, { OR: bhkOr }];
        delete where.OR;
      } else {
        where.OR = bhkOr;
      }
    } else if (exactBhks.length > 0) {
      where.bedrooms = { in: exactBhks };
    } else if (hasFourPlus) {
      where.bedrooms = { gte: 4 };
    }
  }

  // 5. Furnishing
  const furnishing = searchParams.furnishing as string | undefined;
  if (furnishing && furnishing !== "all") {
    switch (furnishing) {
      case "Unfurnished": where.furnishing = "UNFURNISHED"; break;
      case "Semi-Furnished": where.furnishing = "SEMI_FURNISHED"; break;
      case "Fully-Furnished": where.furnishing = "FULLY_FURNISHED"; break;
    }
  }

  // 6. Possession Status
  const possession = searchParams.possession as string | undefined;
  if (possession && possession !== "all") {
    switch (possession) {
      case "Under Construction": where.possessionStatus = "UNDER_CONSTRUCTION"; break;
      case "Ready to Move": where.possessionStatus = "READY_TO_MOVE"; break;
    }
  }

  return where;
}
