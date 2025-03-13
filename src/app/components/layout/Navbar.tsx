'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { FaUser, FaStore, FaBars, FaTimes, FaUtensils, FaCog, FaSignOutAlt } from 'react-icons/fa';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex items-center">
              <FaUtensils className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">See-Eat</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex sm:items-center sm:space-x-4">
            {user ? (
              <>
                <Link
                  href="/restaurant/dashboard"
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    pathname?.startsWith('/restaurant/dashboard')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <FaStore className="mr-2" />
                  Mis Restaurantes
                </Link>
                <div className="ml-3 relative">
                  <div>
                    <button
                      type="button"
                      className="flex items-center max-w-xs bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                    >
                      {user.photoURL ? (
                        <img
                          className="h-8 w-8 rounded-full"
                          src={user.photoURL}
                          alt={user.displayName || 'Usuario'}
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                          <FaUser className="h-4 w-4 text-white" />
                        </div>
                      )}
                      <span className="ml-3 text-gray-700 text-sm font-medium">
                        {user.displayName || 'Usuario'}
                      </span>
                    </button>
                  </div>

                  {isProfileOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="py-1" role="menu">
                        <Link
                          href="/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <FaUser className="mr-3 h-4 w-4" />
                          Mi Perfil
                        </Link>
                        <Link
                          href="/settings"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <FaCog className="mr-3 h-4 w-4" />
                          Configuración
                        </Link>
                        <button
                          type="button"
                          className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                          onClick={() => {
                            signOut();
                            setIsProfileOpen(false);
                          }}
                        >
                          <FaSignOutAlt className="mr-3 h-4 w-4" />
                          Cerrar Sesión
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="text-gray-900 hover:text-gray-700"
              >
                Iniciar sesión
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-50"
            >
              {isMenuOpen ? (
                <FaTimes className="h-6 w-6" />
              ) : (
                <FaBars className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {user ? (
              <>
                <Link
                  href="/restaurant/dashboard"
                  className={`block px-3 py-2 text-base font-medium ${
                    pathname?.startsWith('/restaurant/dashboard')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <FaStore className="mr-2" />
                    Mis Restaurantes
                  </div>
                </Link>
                <div className="ml-3 relative">
                  <div>
                    <button
                      type="button"
                      className="flex items-center max-w-xs bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                    >
                      {user.photoURL ? (
                        <img
                          className="h-8 w-8 rounded-full"
                          src={user.photoURL}
                          alt={user.displayName || 'Usuario'}
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                          <FaUser className="h-4 w-4 text-white" />
                        </div>
                      )}
                      <span className="ml-3 text-gray-700 text-sm font-medium">
                        {user.displayName || 'Usuario'}
                      </span>
                    </button>
                  </div>

                  {isProfileOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="py-1" role="menu">
                        <Link
                          href="/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <FaUser className="mr-3 h-4 w-4" />
                          Mi Perfil
                        </Link>
                        <Link
                          href="/settings"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <FaCog className="mr-3 h-4 w-4" />
                          Configuración
                        </Link>
                        <button
                          type="button"
                          className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                          onClick={() => {
                            signOut();
                            setIsProfileOpen(false);
                          }}
                        >
                          <FaSignOutAlt className="mr-3 h-4 w-4" />
                          Cerrar Sesión
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="text-gray-900 hover:text-gray-700"
              >
                Iniciar sesión
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
} 