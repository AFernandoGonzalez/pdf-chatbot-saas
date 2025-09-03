'use client';

import { useState } from 'react';
import { Provider as JotaiProvider } from 'jotai';
import { AuthProvider } from '../providers/AuthProvider';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import '../styles/globals.css';

export default function RootLayout({ children }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleSidebar = () => setMobileSidebarOpen((prev) => !prev);
  const closeSidebar = () => setMobileSidebarOpen(false);

  return (
    <html lang="en">
      <body className="h-screen overflow-hidden">
        <AuthProvider>
          <JotaiProvider>
            <Navbar onHamburgerClick={toggleSidebar} />
            <div className="flex">
              <Sidebar open={mobileSidebarOpen} onClose={closeSidebar} />
              <main className="flex-1 bg-gray-50 overflow-auto">
                {children}
              </main>
            </div>
          </JotaiProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
