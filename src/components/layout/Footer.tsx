import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

// Social icon SVGs (lucide-react doesn't include brand icons)
function SocialIcon({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a href={href} aria-label={label} target="_blank" rel="noopener noreferrer"
      className="p-2 rounded-full bg-white/5 hover:bg-[#c9932a] hover:text-white transition-colors text-slate-400">
      {children}
    </a>
  );
}

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-[#0a0f1e] to-[#0f172a] text-slate-300 pt-16 pb-8 border-t border-white/10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-bold tracking-tighter text-white">
                Nivasa<span className="text-[#c9932a]">HQ</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
              Hyderabad's most premium real estate marketplace. Find your dream home, verified and curated for you.
            </p>
            <div className="flex items-center gap-4">
              <SocialIcon href="https://instagram.com/nivasahq" label="Instagram">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </SocialIcon>
              <SocialIcon href="https://twitter.com/nivasahq" label="Twitter / X">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </SocialIcon>
              <SocialIcon href="https://linkedin.com/company/nivasahq" label="LinkedIn">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </SocialIcon>
              <SocialIcon href="https://youtube.com/@nivasahq" label="YouTube">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </SocialIcon>
            </div>
            <div className="flex items-center gap-2 text-sm text-white font-medium">
              <ShieldCheck className="w-5 h-5 text-[#c9932a]" />
              <span>Trusted by 50,000+ buyers</span>
            </div>
          </div>

          {/* Buy Property Column */}
          <div>
            <h3 className="text-white font-semibold mb-6">Buy Property</h3>
            <ul className="space-y-4 text-sm">
              <li><Link href="/properties?listingType=SALE&propertyType=APARTMENT" className="text-slate-400 hover:text-[#c9932a] transition-colors">Apartments in Hyderabad</Link></li>
              <li><Link href="/properties?listingType=SALE&propertyType=VILLA" className="text-slate-400 hover:text-[#c9932a] transition-colors">Villas for Sale</Link></li>
              <li><Link href="/properties?listingType=SALE&propertyType=PLOT" className="text-slate-400 hover:text-[#c9932a] transition-colors">Plots & Land</Link></li>
              <li><Link href="/properties?listingType=SALE&propertyType=INDEPENDENT_HOUSE" className="text-slate-400 hover:text-[#c9932a] transition-colors">Independent Houses</Link></li>
              <li><Link href="/properties?listingType=SALE&propertyType=COMMERCIAL_OFFICE" className="text-slate-400 hover:text-[#c9932a] transition-colors">Commercial Properties</Link></li>
              <li><Link href="/projects" className="text-slate-400 hover:text-[#c9932a] transition-colors">New Projects</Link></li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="text-white font-semibold mb-6">Company</h3>
            <ul className="space-y-4 text-sm">
              <li><Link href="/about" className="text-slate-400 hover:text-[#c9932a] transition-colors">About Us</Link></li>
              <li><Link href="/careers" className="text-slate-400 hover:text-[#c9932a] transition-colors">Careers</Link></li>
              <li><Link href="/press" className="text-slate-400 hover:text-[#c9932a] transition-colors">Press</Link></li>
              <li><Link href="/blog" className="text-slate-400 hover:text-[#c9932a] transition-colors">Blog</Link></li>
              <li><Link href="/pricing" className="text-slate-400 hover:text-[#c9932a] transition-colors">Pricing</Link></li>
              <li><Link href="/contact" className="text-slate-400 hover:text-[#c9932a] transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h3 className="text-white font-semibold mb-6">Support</h3>
            <ul className="space-y-4 text-sm">
              <li><Link href="/help" className="text-slate-400 hover:text-[#c9932a] transition-colors">Help Center</Link></li>
              <li><Link href="/verification" className="text-slate-400 hover:text-[#c9932a] transition-colors">Verification Process</Link></li>
              <li><Link href="/rera" className="text-slate-400 hover:text-[#c9932a] transition-colors">RERA Info</Link></li>
              <li><Link href="/privacy" className="text-slate-400 hover:text-[#c9932a] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-slate-400 hover:text-[#c9932a] transition-colors">Terms of Service</Link></li>
              <li><Link href="/cookie-policy" className="text-slate-400 hover:text-[#c9932a] transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} NivasaHQ. All rights reserved. | Real Estate in Hyderabad, Telangana, India</p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className="text-slate-400">100% Verified Listings</span>
            </div>
            <span className="font-semibold tracking-wider text-slate-600">RAZORPAY</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
