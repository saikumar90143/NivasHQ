'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Home, Search, Heart, Bell, User } from 'lucide-react';

export default function MobileNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navItems = [
    {
      label: 'Home',
      icon: Home,
      href: '/',
      isActive: pathname === '/',
    },
    {
      label: 'Search',
      icon: Search,
      href: '/properties',
      isActive: pathname === '/properties',
    },
    {
      label: 'Favorites',
      icon: Heart,
      href: session ? '/favorites' : '/login?callbackUrl=/favorites',
      isActive: pathname === '/favorites',
    },
    {
      label: 'Alerts',
      icon: Bell,
      href: session ? '/dashboard' : '/login',
      isActive: pathname === '/dashboard' && !pathname.includes('settings'), // rudimentary check, customize as needed
      showDot: !!session,
    },
    {
      label: 'Profile',
      icon: User,
      href: session ? '/dashboard' : '/login',
      isActive: pathname === '/dashboard' || pathname === '/login' || pathname.startsWith('/settings'),
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_16px_rgba(0,0,0,0.05)] z-50 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Link
              key={idx}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 relative transition-colors ${
                item.isActive ? 'text-[#c9932a]' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <div className="relative">
                <Icon
                  className="w-6 h-6 transition-transform"
                  strokeWidth={item.isActive ? 2.5 : 2}
                  fill={item.isActive ? 'currentColor' : 'none'}
                />
                {item.showDot && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                )}
              </div>
              <span className={`text-[10px] font-medium ${item.isActive ? 'text-[#c9932a]' : 'text-slate-500'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
