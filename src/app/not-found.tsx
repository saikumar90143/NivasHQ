import Link from 'next/link';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #050a14 0%, #0f172a 60%, #1e293b 100%)' }}>
      
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #c9932a, transparent)' }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #0284c7, transparent)' }} />
      </div>

      <div className="relative z-10 text-center max-w-lg">
        {/* 404 Number */}
        <div className="text-[120px] md:text-[180px] font-black leading-none mb-4"
          style={{ 
            fontFamily: 'Plus Jakarta Sans, Inter, sans-serif',
            background: 'linear-gradient(135deg, #a3720f, #d4a853)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
          404
        </div>

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="text-2xl font-bold text-white">
            Nivasa<span style={{ color: '#c9932a' }}>HQ</span>
          </span>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
          Property Not Found
        </h1>
        <p className="text-slate-400 mb-10 leading-relaxed">
          The page you're looking for doesn't exist or may have been moved.
          Let's help you find your perfect property.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #a3720f, #c9932a)' }}
          >
            <Home size={18} />
            Back to Home
          </Link>
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold border transition-all hover:bg-white/10"
            style={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}
          >
            <Search size={18} />
            Browse Properties
          </Link>
        </div>
      </div>
    </div>
  );
}
