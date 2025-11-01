import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bookstore - Your Literary Haven",
  description: "Browse and purchase books from our curated collection",
};

// app/layout.tsx
import Link from 'next/link';
import { ToastProvider } from '@/components/ui/Toast';
import { CartBadge } from '@/components/CartBadge';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* suppressHydrationWarning prevents mismatch from extension-injected attrs */}
      <body suppressHydrationWarning className="bg-gray-50">
        {/* Navigation Bar */}
        <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="bg-indigo-600 p-2 rounded-lg">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-indigo-600">
                  Bookstore
                </span>
              </Link>

              {/* Navigation Links */}
              <div className="flex items-center gap-1 sm:gap-2">
                <Link 
                  href="/" 
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-indigo-50 transition-colors group"
                >
                  <svg className="w-5 h-5 text-indigo-600 group-hover:text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span className="hidden sm:inline text-sm font-medium text-gray-700 group-hover:text-indigo-700">Catalog</span>
                </Link>

                <Link 
                  href="/cart" 
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-indigo-50 transition-colors group relative"
                >
                  <div className="relative">
                    <svg className="w-5 h-5 text-indigo-600 group-hover:text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <CartBadge />
                  </div>
                  <span className="hidden sm:inline text-sm font-medium text-gray-700 group-hover:text-indigo-700">Cart</span>
                </Link>

                <Link 
                  href="/orders-ex" 
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-indigo-50 transition-colors group"
                >
                  <svg className="w-5 h-5 text-indigo-600 group-hover:text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="hidden sm:inline text-sm font-medium text-gray-700 group-hover:text-indigo-700">Orders</span>
                </Link>

                <Link 
                  href="/auth-ex" 
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="hidden sm:inline text-sm font-medium">Account</span>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}


