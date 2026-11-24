import { Inter } from 'next/font/google';
import './globals.css';
import { DEFAULT_METADATA } from '@/constants/seo.constants';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MobileNav from '@/components/layout/MobileNav';
import AppSessionProvider from '@/components/providers/session-provider';
import { cn } from '@/lib/utils';
import { Toaster } from 'sonner';
import CompareBar from '@/components/compare/CompareBar';

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = DEFAULT_METADATA;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn(inter.variable, 'scroll-smooth')}>
      <body className={cn(
        inter.className,
        'min-h-screen antialiased font-sans',
        'bg-background text-foreground'
      )}>
        <AppSessionProvider>
          <Navbar />
          <main className="min-h-screen pb-20 md:pb-0">
            {children}
          </main>
          <Footer />
          <MobileNav />
          <CompareBar />
          <Toaster 
            position="top-right" 
            richColors 
            toastOptions={{
              classNames: {
                toast: 'rounded-xl font-sans',
              }
            }}
          />
        </AppSessionProvider>
      </body>
    </html>
  );
}
