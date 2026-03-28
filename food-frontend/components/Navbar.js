'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  return (
    <nav className="glass sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <span className="text-xl font-bold text-gray-800">Foodie<span className="text-orange-600">Hub</span></span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                <Link href="/orders" className="text-gray-600 hover:text-orange-600 transition font-medium">
                  My Orders
                </Link>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {user.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-gray-700">{user.name}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="text-gray-600 hover:text-red-600 transition font-medium"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login" className="text-gray-600 hover:text-orange-600 transition font-medium">
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="btn-primary text-white px-5 py-2 rounded-lg font-medium transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            {user ? (
              <div className="space-y-3">
                <Link href="/orders" className="block text-gray-600 hover:text-orange-600 transition font-medium py-2">
                  My Orders
                </Link>
                <button
                  onClick={logout}
                  className="block w-full text-left text-gray-600 hover:text-red-600 transition font-medium py-2"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Link href="/login" className="block text-gray-600 hover:text-orange-600 transition font-medium py-2">
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="block btn-primary text-white px-4 py-2 rounded-lg font-medium text-center"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}