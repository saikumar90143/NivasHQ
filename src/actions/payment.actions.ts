'use server';

import { auth } from '@/lib/auth';
import { PaymentService } from '@/services/payment.service';
import { db } from '@/lib/db';

const PLAN_PRICES: Record<string, number> = {
  "Free": 0,
  "Pro Agent": 2999,
  "Premium Builder": 9999
};

export async function createSubscriptionOrder(planName: string) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      throw new Error('You must be logged in to subscribe to a plan');
    }

    const price = PLAN_PRICES[planName];
    
    if (price === undefined) {
      throw new Error('Invalid plan selected');
    }

    if (price === 0) {
      // Free plan doesn't need razorpay
      return { success: true, orderId: null, amount: 0, isFree: true };
    }

    const userId = session.user.id;
    // The webhook handles the actual subscription. We record the pending payment intent.
    const metadata = { planId: planName };
    const receipt = `rcpt_${Date.now()}`;

    // Call Razorpay
    const order = await PaymentService.createOrder(price, 'INR', receipt);

    // Save to DB
    await db.payment.create({
      data: {
        amount: price,
        status: 'PENDING',
        paymentMethod: 'RAZORPAY',
        agentId: userId, // Assuming agent for now, or builder
        metadata: metadata as any,
        razorpayOrderId: order.id,
      }
    });

    return { 
      success: true, 
      orderId: order.id, 
      amount: order.amount,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID 
    };
  } catch (error: any) {
    console.error('[createSubscriptionOrder] Error:', error);
    return { success: false, error: error.message || 'Failed to create order' };
  }
}
