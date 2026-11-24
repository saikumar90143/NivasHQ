import { NextResponse } from 'next/server';
import { PaymentService } from '@/services/payment.service';
import { SubscriptionService } from '@/services/subscription.service';
import { AnalyticsService } from '@/services/analytics.service';
import { db } from '@/lib/db';
import { handleApiError } from '@/lib/errors';

export async function POST(req: Request) {
  try {
    const bodyText = await req.text();
    const signature = req.headers.get('x-razorpay-signature') || '';

    let body;
    try {
      body = JSON.parse(bodyText);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const isValid = PaymentService.handleWebhook(bodyText, signature);
    
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = body.event;
    
    if (event === 'payment.captured' || event === 'subscription.charged') {
      const paymentEntity = body.payload.payment.entity;
      const razorpayPaymentId = paymentEntity.id;
      const razorpayOrderId = paymentEntity.order_id;
      const amountPaid = paymentEntity.amount;
      
      if (!razorpayPaymentId) {
        return NextResponse.json({ error: 'Missing payment ID' }, { status: 400 });
      }

      // Enforce IDEMPOTENCY
      const existingPayment = await db.payment.findUnique({
        where: { razorpayPaymentId }
      });

      if (existingPayment) {
        return NextResponse.json({ success: true, message: 'Already processed' });
      }

      if (razorpayOrderId) {
        const paymentRecord = await db.payment.findUnique({
          where: { razorpayOrderId }
        });

        if (paymentRecord) {
          // AMOUNT FORGERY PROTECTION
          if (Number(paymentRecord.amount) * 100 !== amountPaid) {
            console.error(`Amount mismatch: Expected ${Number(paymentRecord.amount) * 100} (paise), got ${amountPaid}`);
            return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
          }

          const metadata = paymentRecord.metadata as { planId?: string } | null;
          
          await db.$transaction(async (tx) => {
            let subscriptionId = paymentRecord.subscriptionId;

            if (metadata?.planId) {
              const userId = paymentRecord.agentId || paymentRecord.builderId;
              const entityType = paymentRecord.builderId ? 'BUILDER' : 'AGENT';
              
              if (userId) {
                const subscription = await SubscriptionService.subscribeToPlan(userId, metadata.planId, entityType, tx);
                subscriptionId = subscription.id;
              }
            }

            await tx.payment.update({
              where: { id: paymentRecord.id },
              data: {
                status: 'CAPTURED',
                razorpayPaymentId,
                subscriptionId,
              }
            });

            await AnalyticsService.trackEvent('PAYMENT_CAPTURED', {
              paymentId: paymentRecord.id,
              amount: amountPaid,
              planId: metadata?.planId,
              userId: paymentRecord.agentId || paymentRecord.builderId
            });
          });
        } else {
          // If order is not found, we could insert a new Payment if we had agent info, 
          // but without it, we log or ignore as we can't link it correctly.
          console.warn(`Webhook: Order ${razorpayOrderId} not found in DB`);
        }
      }
    } else if (event === 'payment.failed') {
      const razorpayOrderId = body.payload.payment.entity.order_id;
      if (razorpayOrderId) {
        await db.payment.updateMany({
          where: { razorpayOrderId },
          data: { status: 'FAILED' }
        });
      }
    } else if (event === 'refund.created' || event === 'refund.processed') {
      const razorpayPaymentId = body.payload.refund.entity.payment_id;
      if (razorpayPaymentId) {
        await db.$transaction(async (tx) => {
          const payment = await tx.payment.findUnique({ where: { razorpayPaymentId } });
          if (payment) {
            await tx.payment.update({
              where: { id: payment.id },
              data: { status: 'REFUNDED' }
            });
            if (payment.subscriptionId) {
              await SubscriptionService.cancelSubscription(payment.subscriptionId, tx);
            }
          }
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
