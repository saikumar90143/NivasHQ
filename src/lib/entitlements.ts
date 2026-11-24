import { db } from '@/lib/db';

export const FEATURES = {
  LISTING_LIMIT: 'LISTING_LIMIT',
  FEATURED_LISTINGS: 'FEATURED_LISTINGS',
  LEAD_ACCESS: 'LEAD_ACCESS',
  LEAD_PRIORITY: 'LEAD_PRIORITY',
  ANALYTICS: 'ANALYTICS',
  VERIFIED_BADGE: 'VERIFIED_BADGE',
  PROJECT_LISTING: 'PROJECT_LISTING',
  CONTACT_LIMIT: 'CONTACT_LIMIT',
} as const;

export async function getAgentPlan(agentId: string) {
  const subscription = await db.subscription.findFirst({
    where: {
      agentId,
      status: 'ACTIVE',
      currentPeriodEnd: {
        gte: new Date(),
      },
    },
    include: {
      plan: true,
    },
  });

  return subscription?.plan || null;
}

export async function getListingLimit(agentId: string): Promise<number> {
  const plan = await getAgentPlan(agentId);
  if (!plan) return 5;
  
  const features = (plan.features as Record<string, any>) || {};
  return features[FEATURES.LISTING_LIMIT] ?? 5;
}

export async function canCreateListing(agentId: string): Promise<{ allowed: boolean; reason?: string }> {
  const limit = await getListingLimit(agentId);
  const currentCount = await db.property.count({
    where: { agentId },
  });

  if (currentCount >= limit) {
    return { allowed: false, reason: 'Listing limit reached for current plan.' };
  }
  return { allowed: true };
}

export async function canFeatureProperty(agentId: string): Promise<{ allowed: boolean; reason?: string }> {
  const plan = await getAgentPlan(agentId);
  const limit = plan ? (((plan.features as Record<string, any>) || {})[FEATURES.FEATURED_LISTINGS] ?? 0) : 0;
  
  const currentFeatured = await db.property.count({
    where: { agentId, isFeatured: true },
  });

  if (currentFeatured >= limit) {
    return { allowed: false, reason: 'Featured listing limit reached for current plan.' };
  }
  return { allowed: true };
}

export async function canAccessLead(agentId: string): Promise<{ allowed: boolean; reason?: string }> {
  const plan = await getAgentPlan(agentId);
  const allowed = plan ? (((plan.features as Record<string, any>) || {})[FEATURES.LEAD_ACCESS] ?? false) : false;
  
  if (!allowed) {
    return { allowed: false, reason: 'Lead access is not available on your current plan.' };
  }
  return { allowed: true };
}

export async function canViewAnalytics(agentId: string): Promise<{ allowed: boolean; reason?: string }> {
  const plan = await getAgentPlan(agentId);
  const allowed = plan ? (((plan.features as Record<string, any>) || {})[FEATURES.ANALYTICS] ?? false) : false;
  
  if (!allowed) {
    return { allowed: false, reason: 'Analytics are not available on your current plan.' };
  }
  return { allowed: true };
}
