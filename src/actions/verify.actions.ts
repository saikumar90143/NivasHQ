'use server';

import { db } from '@/lib/db';

export async function verifyEmailAction(
  email: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!email || !code) {
      return { success: false, error: 'Email and code are required.' };
    }

    const token = await db.verificationToken.findFirst({
      where: { identifier: email, token: code },
    });

    if (!token) {
      return { success: false, error: 'Invalid verification code.' };
    }

    if (token.expires < new Date()) {
      await db.verificationToken.delete({ where: { identifier_token: { identifier: email, token: code } } });
      return { success: false, error: 'Verification code has expired. Please register again.' };
    }

    // Activate user
    await db.user.update({
      where: { email },
      data: { status: 'ACTIVE', emailVerified: new Date() },
    });

    // Clean up token
    await db.verificationToken.deleteMany({ where: { identifier: email } });

    return { success: true };
  } catch (error) {
    console.error('Email verification error:', error);
    return { success: false, error: 'Verification failed. Please try again.' };
  }
}

export async function resendVerificationAction(
  email: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await db.user.findUnique({ where: { email } });
    if (!user) return { success: false, error: 'No account found with this email.' };
    if (user.status === 'ACTIVE') return { success: false, error: 'This email is already verified.' };

    const { sendVerificationEmail } = await import('@/lib/mail');
    const token = Math.floor(100000 + Math.random() * 900000).toString();

    await db.verificationToken.deleteMany({ where: { identifier: email } });
    await db.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    await sendVerificationEmail(email, token);
    return { success: true };
  } catch (error) {
    console.error('Resend verification error:', error);
    return { success: false, error: 'Failed to resend verification email.' };
  }
}
