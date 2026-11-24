import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export class SubscriptionService {
  static async getActivePlan(userId: string, entityType: 'AGENT' | 'BUILDER' = 'AGENT') {
    return db.subscription.findFirst({
      where: {
        ...(entityType === 'AGENT' ? { agentId: userId } : { builderId: userId }),
        status: 'ACTIVE',
        currentPeriodEnd: { gt: new Date() }
      },
      include: { plan: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async getAvailablePlans() {
    return db.plan.findMany({
      where: { isActive: true },
      orderBy: { priceMonthly: 'asc' }
    });
  }

  static async subscribeToPlan(
    userId: string, 
    planId: string, 
    entityType: 'AGENT' | 'BUILDER' = 'AGENT', 
    tx?: Prisma.TransactionClient
  ) {
    const prisma = tx || db;
    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) throw new Error('Plan not found');

    // Deactivate previous active plans
    await prisma.subscription.updateMany({
      where: {
        ...(entityType === 'AGENT' ? { agentId: userId } : { builderId: userId }),
        status: 'ACTIVE'
      },
      data: { status: 'CANCELLED' }
    });

    const durationDays = 30; // default to 30 as durationDays doesn't exist on Plan

    return prisma.subscription.create({
      data: {
        ...(entityType === 'AGENT' ? { agentId: userId } : { builderId: userId }),
        planId,
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
      }
    });
  }

  static async cancelSubscription(subscriptionId: string, tx?: Prisma.TransactionClient) {
    const prisma = tx || db;
    return prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status: 'CANCELLED', cancelledAt: new Date() }
    });
  }

  static async checkFeatureAccess(userId: string, feature: string, entityType: 'AGENT' | 'BUILDER' = 'AGENT') {
    const activeSub = await this.getActivePlan(userId, entityType);
    if (!activeSub) return false;

    // Assuming plan has a JSON field `features` array
    const features = activeSub.plan.features as string[];
    return features?.includes(feature) ?? false;
  }

  static async getSubscriptionStats() {
    const activeCount = await db.subscription.count({
      where: { status: 'ACTIVE' }
    });

    const revenue = await db.payment.aggregate({
      where: { status: 'CAPTURED' },
      _sum: { amount: true }
    });

    return {
      activeSubscriptions: activeCount,
      totalRevenue: revenue._sum?.amount || 0
    };
  }
}
