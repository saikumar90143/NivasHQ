import { RankingFactors } from '@/types';
import { getAgentPlan, FEATURES } from '@/lib/entitlements';

export class RankingService {
  static get AGENT_WEIGHTS() {
    return {
      verification: Number(process.env.RANKING_WEIGHT_VERIFICATION || 20),
      responseRate: Number(process.env.RANKING_WEIGHT_RESPONSE_RATE || 15),
      responseTime: Number(process.env.RANKING_WEIGHT_RESPONSE_TIME || 10),
      rating: Number(process.env.RANKING_WEIGHT_RATING || 20),
      conversion: Number(process.env.RANKING_WEIGHT_CONVERSION || 15),
      activeListings: Number(process.env.RANKING_WEIGHT_ACTIVE_LISTINGS || 10),
      premiumPlan: Number(process.env.RANKING_WEIGHT_PREMIUM_PLAN || 10),
      locationMatch: Number(process.env.RANKING_WEIGHT_LOCATION_MATCH || 30)
    };
  }
  static rankProperties(properties: any[], query?: string) {
    return properties.map(property => {
      const score = this.calculateRankScore(property, query);
      return { ...property, rankScore: score };
    }).sort((a, b) => b.rankScore - a.rankScore);
  }

  static calculateRankScore(property: any, query?: string): number {
    let factors: RankingFactors = {
      relevance: 0,
      verification: 0,
      freshness: 0,
      engagement: 0,
      quality: 0,
      sponsored: 0,
      total: 0
    };

    // Relevance (30%)
    if (query) {
      const lowerQuery = query.toLowerCase();
      if (property.title?.toLowerCase().includes(lowerQuery)) factors.relevance += 20;
      if (property.description?.toLowerCase().includes(lowerQuery)) factors.relevance += 10;
    } else {
      factors.relevance = 30; // default if no query
    }

    // Verification (20%)
    if (property.agent?.verified) factors.verification = 20;
    else if (property.verificationStatus === 'VERIFIED') factors.verification = 20;
    else if (property.verificationStatus === 'PENDING') factors.verification = 10;

    // Freshness (15%)
    const daysOld = (Date.now() - new Date(property.createdAt).getTime()) / (1000 * 3600 * 24);
    if (daysOld < 7) factors.freshness = 15;
    else if (daysOld < 30) factors.freshness = 10;
    else if (daysOld < 90) factors.freshness = 5;

    // Engagement (15%)
    const viewCount = property.viewCount || 0;
    if (viewCount > 1000) factors.engagement = 15;
    else if (viewCount > 100) factors.engagement = 10;
    else if (viewCount > 10) factors.engagement = 5;

    // Quality (10%)
    if (property.images?.length >= 5) factors.quality += 5;
    if (property.description?.length > 200) factors.quality += 5;

    // Sponsored (10%)
    if (property.isFeatured) factors.sponsored = 10;

    return Object.values(factors).reduce((sum, val) => sum + val, 0);
  }

  static async rankAgents(agents: any[], property?: any) {
    const ranked = await Promise.all(agents.map(async (agent) => {
      const score = await this.calculateAgentScore(agent, property);
      return { ...agent, rankScore: score };
    }));
    return ranked.sort((a, b) => b.rankScore - a.rankScore);
  }

  static async calculateAgentScore(agent: any, property?: any): Promise<number> {
    let score = 0;
    
    if (agent.verificationStatus === 'VERIFIED') {
      score += this.AGENT_WEIGHTS.verification;
    }

    if (property?.localityId && agent.areasServed?.some((a: any) => a.localityId === property.localityId)) {
      score += this.AGENT_WEIGHTS.locationMatch;
    }
    
    if (agent.responseRate) {
      score += (Number(agent.responseRate) / 100) * this.AGENT_WEIGHTS.responseRate;
    }

    if (agent.avgResponseTimeMinutes) {
      // Faster is better. Less than 15 mins = max score. Cap at 120 mins.
      const time = Number(agent.avgResponseTimeMinutes);
      if (time <= 15) {
        score += this.AGENT_WEIGHTS.responseTime;
      } else if (time < 120) {
        score += this.AGENT_WEIGHTS.responseTime * (1 - (time / 120));
      }
    }

    if (agent.rating) {
      score += (Number(agent.rating) / 5) * this.AGENT_WEIGHTS.rating;
    }
    
    if (agent.totalDeals && agent.totalDeals > 0) {
      score += Math.min((agent.totalDeals / 10) * this.AGENT_WEIGHTS.conversion, this.AGENT_WEIGHTS.conversion);
    }
    
    if (agent.totalListings && agent.totalListings > 0) {
      score += Math.min((agent.totalListings / 50) * this.AGENT_WEIGHTS.activeListings, this.AGENT_WEIGHTS.activeListings);
    }
    
    const plan = await getAgentPlan(agent.id);
    const features = plan?.features as any;
    if (features && features[FEATURES.LEAD_PRIORITY]) {
      score += this.AGENT_WEIGHTS.premiumPlan;
    }
    
    return score;
  }
}
