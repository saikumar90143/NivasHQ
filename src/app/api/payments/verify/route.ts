import { NextResponse } from 'next/server';
import { PaymentService } from '@/services/payment.service';
import { SubscriptionService } from '@/services/subscription.service';
import { getAuthenticatedUser, validateBody } from '@/lib/api-helpers';
import { db } from '@/lib/db';
import { handleApiError, ValidationError, NotFoundError } from '@/lib/errors';
import { z } from 'zod';

const verifySchema = z.object({
  orderId: z.string(),
  paymentId: z.string(),
  signature: z.string(),
});

export async function POST(req: Request) {
  try {
    await getAuthenticatedUser(req);
    const body = await validateBody(req, verifySchema);

    const isValid = PaymentService.verifyPayment(body.orderId, body.paymentId, body.signature);
    if (!isValid) {
      throw new ValidationError('Invalid payment signature');
    }

    const payment = await db.payment.findUnique({
      where: { razorpayOrderId: body.orderId }
    });

    if (!payment) {
      throw new NotFoundError('Payment order not found');
    }

    if (payment.status === 'CAPTURED') {
      return NextResponse.json({ success: true, message: 'Payment already processed' });
    }

    let subscriptionId = payment.subscriptionId;

    const metadata = payment.metadata as { planId?: string } | null;
    if (metadata?.planId) {
      const userId = payment.agentId || payment.builderId;
      const entityType = payment.builderId ? 'BUILDER' : 'AGENT';
      if (userId) {
        const subscription = await SubscriptionService.subscribeToPlan(userId, metadata.planId, entityType);
        subscriptionId = subscription.id;
      }
    }

    const updatedPayment = await db.payment.update({
      where: { id: payment.id },
      data: {
        status: 'CAPTURED',
        razorpayPaymentId: body.paymentId,
        razorpaySignature: body.signature,
        subscriptionId: subscriptionId,
      }
    });

    return NextResponse.json({ success: true, payment: updatedPayment });
  } catch (error) {
    return handleApiError(error);
  }
}
