import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const isRateLimitingEnabled = !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

let apiLimiter: Ratelimit | null = null;
let authLimiter: Ratelimit | null = null;

if (isRateLimitingEnabled) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  apiLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '10 s'),
    analytics: true,
  });

  authLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '60 s'),
    analytics: true,
  });
}

// Define route categories
const publicRoutes = ["/", "/buy", "/rent", "/projects", "/locations", "/guides"];
const authRoutes = ["/login", "/register", "/forgot-password"];
const apiAuthPrefix = "/api/auth";

// Role-specific protected routes
const protectedRoutes = {
  admin: ["/admin"],
  agent: ["/dashboard/agent"],
  builder: ["/dashboard/builder"],
  user: ["/dashboard", "/list-property", "/favorites"], // Base authenticated routes
};

export default auth(async (req) => {
  const { nextUrl } = req;
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? '127.0.0.1';
  
  if (isRateLimitingEnabled) {
    let limitResult;
    if (nextUrl.pathname.startsWith('/api/auth') || authRoutes.includes(nextUrl.pathname)) {
      limitResult = await authLimiter?.limit(`auth_${ip}`);
    } else if (nextUrl.pathname.startsWith('/api/')) {
      limitResult = await apiLimiter?.limit(`api_${ip}`);
    }

    if (limitResult && !limitResult.success) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limitResult.limit.toString(),
          'X-RateLimit-Remaining': limitResult.remaining.toString(),
          'Retry-After': Math.ceil((limitResult.reset - Date.now()) / 1000).toString(),
        },
      });
    }
  }
  const isLoggedIn = !!req.auth;
  const user = req.auth?.user as any;
  const userRole = user?.role || "BUYER";
  
  if (isLoggedIn) {
    console.log("[PROXY DEBUG] req.auth.user:", user);
    console.log("[PROXY DEBUG] Extracted userRole:", userRole);
  }
  
  const isOnboardingCompleted = user?.onboardingCompleted;

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  const isOnboardingRoute = nextUrl.pathname === "/onboarding";

  // 1. Allow NextAuth API routes to pass through
  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  // 2. Handle Authentication Routes (/login, /register)
  if (isAuthRoute) {
    if (isLoggedIn) {
      // If already logged in, redirect to home (or onboarding if incomplete)
      if (isOnboardingCompleted === false) {
        return NextResponse.redirect(new URL("/onboarding", nextUrl));
      }
      return NextResponse.redirect(new URL("/", nextUrl));
    }
    return NextResponse.next();
  }

  // 3. Handle Authenticated User Flows
  if (isLoggedIn) {
    // Force onboarding completion if not done
    if (isOnboardingCompleted === false && !isOnboardingRoute) {
      return NextResponse.redirect(new URL("/onboarding", nextUrl));
    }
    
    // Prevent access to onboarding if already completed
    if (isOnboardingCompleted === true && isOnboardingRoute) {
      return NextResponse.redirect(new URL("/", nextUrl));
    }

    // Redirect base /dashboard based on role
    if (nextUrl.pathname === "/dashboard") {
      if (userRole === "AGENT") return NextResponse.redirect(new URL("/dashboard/agent", nextUrl));
      if (userRole === "BUILDER") return NextResponse.redirect(new URL("/dashboard/builder", nextUrl));
      if (userRole === "ADMIN") return NextResponse.redirect(new URL("/admin", nextUrl));
      return NextResponse.redirect(new URL("/dashboard/properties", nextUrl));
    }

    // Role-Based Access Control (RBAC)
    // Check Admin Routes
    if (nextUrl.pathname.startsWith("/admin") && userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
    
    // Check Agent Routes
    if (nextUrl.pathname.startsWith("/dashboard/agent") && userRole !== "AGENT") {
      return NextResponse.redirect(new URL("/", nextUrl));
    }

    // Check Builder Routes
    if (nextUrl.pathname.startsWith("/dashboard/builder") && userRole !== "BUILDER") {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  // 4. Handle Unauthenticated Access to Protected Routes
  if (!isLoggedIn) {
    // Check if the route is strictly protected
    const isProtectedRoute = 
      nextUrl.pathname.startsWith("/admin") || 
      nextUrl.pathname.startsWith("/dashboard") ||
      nextUrl.pathname.startsWith("/list-property") ||
      isOnboardingRoute;

    if (isProtectedRoute) {
      // Redirect to login with callback URL
      let callbackUrl = nextUrl.pathname;
      if (nextUrl.search) callbackUrl += nextUrl.search;
      
      const encodedCallbackUrl = encodeURIComponent(callbackUrl);
      return NextResponse.redirect(new URL(`/login?callbackUrl=${encodedCallbackUrl}`, nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  // Matcher ignoring static files, _next, and images to optimize middleware performance
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
