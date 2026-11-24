'use server';

import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { registerSchema } from '@/validators/user.validator';
import { sendVerificationEmail } from '@/lib/mail';
import { z } from 'zod';

type RegisterResult =
  | { success: true; verifyEmail: true; email: string }
  | { success: false; error: string };

export async function registerUser(data: unknown): Promise<RegisterResult> {
  try {
    const validated = registerSchema.parse(data);

    // Normalize role: map any legacy 'USER' to 'BUYER'
    const role = (validated.role === ('USER' as any) ? 'BUYER' : validated.role) as 'BUYER' | 'AGENT' | 'BUILDER';

    // Check for existing user
    const existing = await db.user.findUnique({ where: { email: validated.email } });
    if (existing) {
      if (existing.status === 'ACTIVE') {
        return { success: false, error: 'An account with this email already exists.' };
      }
      // Clean up stale PENDING registration
      await db.user.delete({ where: { id: existing.id } });
    }

    // Check phone uniqueness
    const existingPhone = await db.user.findUnique({ where: { phone: validated.phone } });
    if (existingPhone) {
      return { success: false, error: 'This phone number is already registered.' };
    }

    const passwordHash = await bcrypt.hash(validated.password, 12);

    await db.user.create({
      data: {
        name: validated.name,
        email: validated.email,
        phone: validated.phone,
        passwordHash,
        role,
        status: 'PENDING',
        onboardingCompleted: false,
      },
    });

    // OTP for email verification
    const token = Math.floor(100000 + Math.random() * 900000).toString();

    await db.verificationToken.deleteMany({ where: { identifier: validated.email } });
    await db.verificationToken.create({
      data: {
        identifier: validated.email,
        token,
        expires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    });

    const emailResult = await sendVerificationEmail(validated.email, token);
    if (!emailResult.success) {
      return { success: false, error: 'Failed to send verification email. Please try again.' };
    }

    return { success: true, verifyEmail: true, email: validated.email };
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || 'Invalid input.' };
    }
    console.error('Registration error:', error);
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}
