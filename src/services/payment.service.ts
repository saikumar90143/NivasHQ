import crypto from 'crypto';
import { db } from '@/lib/db';
import { SubscriptionStatus } from '@prisma/client';

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

export class PaymentService {
  static async createOrder(amount: number, currency: string = 'INR', receipt: string) {
    if (!RAZORPAY_KEY_ID) {
      // Mock for development
      return {
        id: `order_mock_${Date.now()}`,
        amount: amount * 100, // paise
        currency,
        receipt,
        status: 'created'
      };
    }

    const Razorpay = require('razorpay');
    const razorpay = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });

    return razorpay.orders.create({
      amount: amount * 100,
      currency,
      receipt,
    });
  }

  static verifyPayment(orderId: string, paymentId: string, signature: string): boolean {
    if (!RAZORPAY_KEY_SECRET) {
      if (process.env.NODE_ENV !== 'production') return true;
      return false;
    }

    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    return expectedSignature === signature;
  }

  static handleWebhook(bodyText: string, signature: string): boolean {
    if (!RAZORPAY_KEY_SECRET) {
      if (process.env.NODE_ENV !== 'production') return true;
      return false;
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || RAZORPAY_KEY_SECRET)
      .update(bodyText)
      .digest('hex');

    return expectedSignature === signature;
  }

  static async createSubscription(planId: string, agentId: string) {
    // Record intent in DB
    const sub = await db.subscription.create({
      data: {
        planId,
        agentId,
        status: 'INACTIVE', // SubscriptionStatus enum has INACTIVE
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
      }
    });
    return sub;
  }

  static async cancelSubscription(subscriptionId: string) {
    return db.subscription.update({
      where: { id: subscriptionId },
      data: { status: 'CANCELLED', cancelledAt: new Date() }
    });
  }

  static async getPaymentHistory(agentId: string) {
    return db.payment.findMany({
      where: { agentId },
      orderBy: { createdAt: 'desc' }
    });
  }
}
