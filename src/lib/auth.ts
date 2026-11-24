import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      checks: ['state'],
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.passwordHash) return null;
        if (user.status === 'SUSPENDED') return null; // Block suspended users
        // Note: PENDING users with unverified email are blocked at login
        // Google OAuth users bypass this
        if (user.status === 'PENDING') {
          throw new Error('EMAIL_NOT_VERIFIED');
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );
        if (!isValid) return null;

        // Update last login
        await db.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        }).catch(() => {}); // Non-blocking

        return user;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // For Google OAuth: auto-activate and set onboarding
      if (account?.provider === 'google') {
        const dbUser = await db.user.findUnique({ where: { email: user.email! } });
        if (dbUser && dbUser.status === 'PENDING') {
          await db.user.update({
            where: { id: dbUser.id },
            data: { status: 'ACTIVE', emailVerified: new Date() },
          });
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || 'BUYER';
        token.onboardingCompleted = (user as any).onboardingCompleted ?? false;
      }

      if (trigger === 'update') {
        if (session?.role) token.role = session.role;
        if (typeof session?.onboardingCompleted === 'boolean') {
          token.onboardingCompleted = session.onboardingCompleted;
        }
        // Refresh from DB when explicitly updated
        if (token.id) {
          const dbUser = await db.user.findUnique({
            where: { id: token.id as string },
            select: { role: true, onboardingCompleted: true, status: true },
          });
          if (dbUser) {
            token.role = dbUser.role;
            token.onboardingCompleted = dbUser.onboardingCompleted;
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role as string;
        (session.user as any).onboardingCompleted = token.onboardingCompleted as boolean;
      }
      return session;
    },
  },
});
