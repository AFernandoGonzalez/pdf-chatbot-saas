'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';

export default function Navbar({ onHamburgerClick }) {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const signOut = async () => {
    await firebaseAuth.signOut();
    setUser(null);
  };

  const handleHamburgerClick = () => {
    setSidebarOpen(!sidebarOpen);
    if (onHamburgerClick) onHamburgerClick(!sidebarOpen);
  };

  return (
    <header
      className="
        w-full bg-white shadow-sm border-b border-gray-200
        px-4 sm:px-6 py-3 flex items-center justify-between
      "
    >
      <div className="flex items-center space-x-2">
        <button
          onClick={handleHamburgerClick}
          className="md:hidden mr-2 text-gray-700 hover:text-gray-900 focus:outline-none"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <span className="text-xl font-bold text-blue-600">TalkPDF</span>
      </div>

      <div className="flex items-center space-x-4">
        {!loading && !user && (
          <a
            href="/login"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Log in
          </a>
        )}

        {!loading && user && (
          <div className="relative">
            <button className="flex items-center space-x-2 focus:outline-none">
              <div
                className={'w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center'}
              >
                {user.displayName
                  ? user.displayName.charAt(0).toUpperCase()
                  : user.email
                  ? user.email.charAt(0).toUpperCase()
                  : null}
              </div>
              <span className="hidden sm:inline text-gray-700 font-medium">
                {user.displayName || user.email}
              </span>
            </button>
            <div
              className={
                'absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md ' +
                'border border-gray-200 hidden group-hover:block'
              }
            >
              <button
                onClick={signOut}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
              >
                Log out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
