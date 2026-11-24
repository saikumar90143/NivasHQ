import { db } from '@/lib/db';

export class MatchingService {
  static async matchRequirementToProperties(requirementId: string) {
    const req = await db.buyerRequirement.findUnique({ where: { id: requirementId } });
    if (!req) throw new Error('Requirement not found');

    // 1. FILTER -> CANDIDATES
    const candidates = await this.getCandidates(req);

    // 2. RANK
    const matches = this.rankCandidates(candidates, req);

    // 3. TOP K
    return matches.slice(0, 20);
  }

  static async getCandidates(req: any) {
    const candidateWhere: any = { status: 'ACTIVE', cityId: req.cityId };
    
    if (req.listingType) {
      candidateWhere.listingType = req.listingType;
    }
    
    if (req.minBudget || req.maxBudget) {
      candidateWhere.price = {};
      if (req.minBudget) candidateWhere.price.gte = BigInt(Math.floor(Number(req.minBudget) * 0.9));
      if (req.maxBudget) candidateWhere.price.lte = BigInt(Math.floor(Number(req.maxBudget) * 1.1));
    }

    return db.property.findMany({
      where: candidateWhere,
      take: 100,
      include: { locality: true, city: true, amenities: { include: { amenity: true } } }
    });
  }

  static rankCandidates(candidates: any[], requirement: any) {
    return candidates.map(prop => {
      return this.calculateMatchScore(prop, requirement);
    }).sort((a, b) => b.score - a.score);
  }

  static calculateMatchScore(property: any, requirement: any) {
    let score = 0;
    const reasons: string[] = [];

    const weightLocation = Number(process.env.MATCH_WEIGHT_LOCATION || 30);
    const weightBudgetExact = Number(process.env.MATCH_WEIGHT_BUDGET_EXACT || 25);
    const weightBudgetNear = Number(process.env.MATCH_WEIGHT_BUDGET_NEAR || 15);
    const weightBedrooms = Number(process.env.MATCH_WEIGHT_BEDROOMS || 20);
    const weightPropertyType = Number(process.env.MATCH_WEIGHT_PROPERTY_TYPE || 15);
    const weightAmenities = Number(process.env.MATCH_WEIGHT_AMENITIES || 10);

    // Location
    if (property.cityId === requirement.cityId) {
      score += weightLocation;
      reasons.push('Location matches preference');
    }

    // Budget
    const propPrice = Number(property.price);
    if (requirement.minBudget && requirement.maxBudget) {
      if (propPrice >= Number(requirement.minBudget) && propPrice <= Number(requirement.maxBudget)) {
        score += weightBudgetExact;
        reasons.push('Within exact budget range');
      } else if (propPrice >= Number(requirement.minBudget) * 0.9 && propPrice <= Number(requirement.maxBudget) * 1.1) {
        score += weightBudgetNear;
        reasons.push('Slightly outside preferred budget');
      }
    }

    // Bedrooms
    if (requirement.minBedrooms && property.bedrooms) {
      if (property.bedrooms >= requirement.minBedrooms) {
        score += weightBedrooms;
        reasons.push('Meets bedroom requirements');
      }
    }

    // Property Types
    if (requirement.propertyTypes && requirement.propertyTypes.length > 0) {
      if (requirement.propertyTypes.includes(property.propertyType)) {
        score += weightPropertyType;
        reasons.push('Property type matches preference');
      }
    }

    // Amenities
    if (requirement.amenities && requirement.amenities.length > 0 && property.amenities) {
      const propertyAmenityNames = property.amenities.map((pa: any) => pa.amenity?.name);
      const matchedAmenities = requirement.amenities.filter((reqAmenity: string) => 
        propertyAmenityNames.includes(reqAmenity)
      );
      if (matchedAmenities.length > 0) {
        score += Math.min(weightAmenities, matchedAmenities.length * 2);
        reasons.push(`Matches ${matchedAmenities.length} amenities`);
      }
    } else if (property.amenities?.length > 0) {
      score += 5; // Legacy default
    }
    
    score += 20; // default points for active listing matching base filters

    return {
      propertyId: property.id,
      property,
      score: Math.min(score, 100),
      reasons
    };
  }
}
