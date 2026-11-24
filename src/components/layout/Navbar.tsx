'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LogOut, User, Bell, ChevronDown, Building2, Home, Key,
  MapPin, BookOpen, Phone, Menu, X, Search, Heart,
  LayoutDashboard, Settings, Shield, TrendingUp, Users
} from 'lucide-react';

const BUY_MENU = {
  title: 'Buy Property',
  sections: [
    {
      heading: 'By Type',
      items: [
        { label: 'Apartments', href: '/properties?listingType=SALE&propertyType=APARTMENT', icon: Building2 },
        { label: 'Villas', href: '/properties?listingType=SALE&propertyType=VILLA', icon: Home },
        { label: 'Plots', href: '/properties?listingType=SALE&propertyType=PLOT', icon: MapPin },
        { label: 'Independent Houses', href: '/properties?listingType=SALE&propertyType=INDEPENDENT_HOUSE', icon: Home },
        { label: 'Commercial', href: '/properties?listingType=SALE&propertyType=COMMERCIAL_OFFICE', icon: Building2 },
      ],
    },
    {
      heading: 'Popular Areas',
      items: [
        { label: 'Gachibowli', href: '/properties?listingType=SALE&locality=gachibowli' },
        { label: 'Banjara Hills', href: '/properties?listingType=SALE&locality=banjara-hills' },
        { label: 'Jubilee Hills', href: '/properties?listingType=SALE&locality=jubilee-hills' },
        { label: 'Kokapet', href: '/properties?listingType=SALE&locality=kokapet' },
        { label: 'Kondapur', href: '/properties?listingType=SALE&locality=kondapur' },
        { label: 'HITEC City', href: '/properties?listingType=SALE&locality=hitec-city' },
      ],
    },
    {
      heading: 'Budget',
      items: [
        { label: 'Under ₹50 Lacs', href: '/properties?listingType=SALE&maxPrice=5000000' },
        { label: '₹50L – ₹1 Cr', href: '/properties?listingType=SALE&minPrice=5000000&maxPrice=10000000' },
        { label: '₹1Cr – ₹2 Cr', href: '/properties?listingType=SALE&minPrice=10000000&maxPrice=20000000' },
        { label: '₹2 Cr+', href: '/properties?listingType=SALE&minPrice=20000000' },
      ],
    },
  ],
};

const RENT_MENU = {
  title: 'Rent Property',
  sections: [
    {
      heading: 'By Type',
      items: [
        { label: 'Apartments', href: '/properties?listingType=RENT&propertyType=APARTMENT', icon: Building2 },
        { label: 'Villas', href: '/properties?listingType=RENT&propertyType=VILLA', icon: Home },
        { label: 'PG / Co-Living', href: '/properties?listingType=RENT&propertyType=PG', icon: Users },
        { label: 'Commercial', href: '/properties?listingType=RENT&propertyType=COMMERCIAL_OFFICE', icon: Building2 },
      ],
    },
    {
      heading: 'Popular Areas',
      items: [
        { label: 'Gachibowli', href: '/properties?listingType=RENT&locality=gachibowli' },
        { label: 'Madhapur', href: '/properties?listingType=RENT&locality=madhapur' },
        { label: 'Kondapur', href: '/properties?listingType=RENT&locality=kondapur' },
        { label: 'Manikonda', href: '/properties?listingType=RENT&locality=manikonda' },
        { label: 'Kukatpally', href: '/properties?listingType=RENT&locality=kukatpally' },
      ],
    },
    {
      heading: 'By BHK',
      items: [
        { label: '1 BHK Flats', href: '/properties?listingType=RENT&bedrooms=1' },
        { label: '2 BHK Flats', href: '/properties?listingType=RENT&bedrooms=2' },
        { label: '3 BHK Flats', href: '/properties?listingType=RENT&bedrooms=3' },
        { label: '4+ BHK', href: '/properties?listingType=RENT&bedrooms=4' },
      ],
    },
  ],
};

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveMenu(null);
    setUserMenuOpen(false);
  }, [pathname]);

  const handleMouseEnter = (menuName: string) => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setActiveMenu(menuName);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 150);
  };

  const isDarkNav = !isScrolled && pathname === '/'; // Example logic, assume transparent implies dark bg on root usually, but let's make it standard

  return (
    <>
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 h-[72px] flex items-center ${
          isScrolled
            ? 'bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4 w-full flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <span className={`text-2xl font-bold tracking-tighter ${isScrolled ? 'text-gray-900' : 'text-white drop-shadow-sm'}`}>
                Nivasa<span className="text-[#c9932a]">HQ</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {/* Buy Menu */}
              <div
                className="relative h-[72px] flex items-center px-3"
                onMouseEnter={() => handleMouseEnter('buy')}
                onMouseLeave={handleMouseLeave}
              >
                <button className={`flex items-center gap-1 text-sm font-medium transition-colors ${isScrolled ? 'text-gray-700 hover:text-gray-900' : 'text-gray-100 hover:text-white'}`}>
                  Buy <ChevronDown className="w-4 h-4" />
                </button>
                <AnimatePresence>
                  {activeMenu === 'buy' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-[72px] left-0 w-[600px] bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
                    >
                      <div className="p-6 grid grid-cols-3 gap-6">
                        {BUY_MENU.sections.map((section, idx) => (
                          <div key={idx}>
                            <h3 className="text-sm font-bold text-gray-900 mb-4">{section.heading}</h3>
                            <ul className="space-y-3">
                              {section.items.map((item, i) => (
                                <li key={i}>
                                  <Link href={item.href} className="text-sm text-gray-600 hover:text-[#c9932a] transition-colors flex items-center gap-2">
                                    {('icon' in item) && (() => { const Icon = (item as any).icon; return <Icon className="w-4 h-4" />; })()}
                                    {item.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Rent Menu */}
              <div
                className="relative h-[72px] flex items-center px-3"
                onMouseEnter={() => handleMouseEnter('rent')}
                onMouseLeave={handleMouseLeave}
              >
                <button className={`flex items-center gap-1 text-sm font-medium transition-colors ${isScrolled ? 'text-gray-700 hover:text-gray-900' : 'text-gray-100 hover:text-white'}`}>
                  Rent <ChevronDown className="w-4 h-4" />
                </button>
                <AnimatePresence>
                  {activeMenu === 'rent' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-[72px] left-0 w-[600px] bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
                    >
                      <div className="p-6 grid grid-cols-3 gap-6">
                        {RENT_MENU.sections.map((section, idx) => (
                          <div key={idx}>
                            <h3 className="text-sm font-bold text-gray-900 mb-4">{section.heading}</h3>
                            <ul className="space-y-3">
                              {section.items.map((item, i) => (
                                <li key={i}>
                                  <Link href={item.href} className="text-sm text-gray-600 hover:text-[#c9932a] transition-colors flex items-center gap-2">
                                    {('icon' in item) && (() => { const Icon = (item as any).icon; return <Icon className="w-4 h-4" />; })()}
                                    {item.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link href="/projects" className={`px-3 py-2 text-sm font-medium transition-colors ${isScrolled ? 'text-gray-700 hover:text-gray-900' : 'text-gray-100 hover:text-white'}`}>Projects</Link>
              <Link href="/locations" className={`px-3 py-2 text-sm font-medium transition-colors ${isScrolled ? 'text-gray-700 hover:text-gray-900' : 'text-gray-100 hover:text-white'}`}>Locations</Link>
              <Link href="/guides" className={`px-3 py-2 text-sm font-medium transition-colors ${isScrolled ? 'text-gray-700 hover:text-gray-900' : 'text-gray-100 hover:text-white'}`}>Guides</Link>
            </nav>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <Link href="/properties" className={`p-2 rounded-full transition-colors ${isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-100 hover:bg-white/10'}`}>
              <Search className="w-5 h-5" />
            </Link>
            
            <div className="hidden md:flex items-center gap-4">
              <Link href="/favorites" className={`p-2 rounded-full transition-colors ${isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-100 hover:bg-white/10'}`}>
                <Heart className="w-5 h-5" />
              </Link>

              <Link href="/list-property" className="px-4 py-2 text-sm font-medium text-[#c9932a] border-2 border-[#c9932a] rounded-lg hover:bg-[#c9932a] hover:text-white transition-all shadow-sm">
                List Property
              </Link>

              {session ? (
                <div className="relative">
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 p-1 rounded-full border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                      {session.user?.image ? (
                        <img src={session.user.image} alt={session.user.name || 'User'} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                  </button>
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2"
                      >
                        <div className="px-4 py-2 border-b border-gray-100 mb-2">
                          <p className="text-sm font-medium text-gray-900 truncate">{session.user?.name}</p>
                          <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
                        </div>
                        <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#c9932a]">
                          <LayoutDashboard className="w-4 h-4" /> Dashboard
                        </Link>
                        {/* Assuming an ADMIN role might be stored in a custom user property, or simply a specific email */}
                        {session.user?.email === 'admin@nivasahq.com' && (
                           <Link href="/admin" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#c9932a]">
                           <Shield className="w-4 h-4" /> Admin Panel
                         </Link>
                        )}
                        <Link href="/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#c9932a]">
                          <Settings className="w-4 h-4" /> Settings
                        </Link>
                        <button onClick={() => signOut({ callbackUrl: '/' })} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link href="/login" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#0a0f1e] to-[#1e293b] rounded-lg hover:shadow-lg transition-all">
                  <User className="w-4 h-4" /> Login
                </Link>
              )}
            </div>

            <button
              onClick={() => setMobileMenuOpen(true)}
              className={`md:hidden p-2 rounded-lg ${isScrolled ? 'text-gray-900' : 'text-white'}`}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[60] md:hidden backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 w-[85%] max-w-sm h-full bg-white z-[70] shadow-2xl flex flex-col md:hidden overflow-y-auto"
            >
              <div className="flex items-center justify-between p-4 border-b">
                <span className="text-xl font-bold text-gray-900">Menu</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-4 flex flex-col gap-6 flex-1">
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Buy</h3>
                  <div className="flex flex-col gap-2">
                    {BUY_MENU.sections[0].items.map((item, i) => (
                      <Link key={i} href={item.href} className="text-base text-gray-700 py-1">{item.label}</Link>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Rent</h3>
                  <div className="flex flex-col gap-2">
                    {RENT_MENU.sections[0].items.map((item, i) => (
                      <Link key={i} href={item.href} className="text-base text-gray-700 py-1">{item.label}</Link>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-3 mt-4 border-t pt-4">
                  <Link href="/projects" className="text-base font-medium text-gray-900">Projects</Link>
                  <Link href="/locations" className="text-base font-medium text-gray-900">Locations</Link>
                  <Link href="/guides" className="text-base font-medium text-gray-900">Guides</Link>
                </div>
              </div>

              <div className="p-4 border-t mt-auto">
                <Link href="/list-property" className="w-full flex justify-center items-center py-3 text-[#c9932a] border border-[#c9932a] rounded-lg font-medium mb-3">
                  List Property
                </Link>
                {!session && (
                  <Link href="/login" className="w-full flex justify-center items-center py-3 bg-[#0a0f1e] text-white rounded-lg font-medium">
                    Login / Register
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
