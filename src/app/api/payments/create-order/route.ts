import { NextResponse } from 'next/server';
import { PaymentService } from '@/services/payment.service';
import { getAuthenticatedUser, validateBody } from '@/lib/api-helpers';
import { db } from '@/lib/db';
import { handleApiError, NotFoundError, ValidationError } from '@/lib/errors';
import { z } from 'zod';

const createOrderSchema = z.object({
  planId: z.string().uuid().optional(),
  amount: z.number().optional(),
}).refine(data => data.planId || data.amount, {
  message: 'Either planId or amount is required'
});

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    const body = await validateBody(req, createOrderSchema);

    let amount = body.amount;

    if (body.planId) {
      const plan = await db.plan.findUnique({ where: { id: body.planId } });
      if (!plan) {
        throw new NotFoundError('Plan not found');
      }
      amount = Number(plan.priceMonthly);
    }

    if (!amount || amount <= 0) {
      throw new ValidationError('Invalid amount');
    }

    const agent = await db.agent.findUnique({ where: { userId: user.id } });
    if (!agent) {
      throw new NotFoundError('Agent profile not found');
    }

    const receipt = `rcpt_${Date.now()}`;
    const order = await PaymentService.createOrder(amount, 'INR', receipt);

    await db.payment.create({
      data: {
        agentId: agent.id,
        amount: BigInt(amount),
        currency: 'INR',
        status: 'PENDING',
        razorpayOrderId: order.id,
        metadata: body.planId ? { planId: body.planId } : undefined
      }
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    return handleApiError(error);
  }
}
