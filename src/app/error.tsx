'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // e.g., Sentry.captureException(error);
    } else {
      console.error('Page error:', error);
    }
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-20">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6"
          style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
          <AlertTriangle size={36} className="text-red-500" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-3">
          Something went wrong
        </h1>
        <p className="text-slate-500 mb-2 leading-relaxed">
          We encountered an unexpected error. Our team has been notified.
        </p>
        {process.env.NODE_ENV === 'development' && error.message && (
          <p className="text-xs text-red-500 font-mono bg-red-50 px-3 py-2 rounded-lg mb-6 break-all text-left">
            {error.message}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #0a0f1e, #1e293b)' }}
          >
            <RefreshCw size={16} />
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all"
          >
            <Home size={16} />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
