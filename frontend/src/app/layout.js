'use client';

import { Provider as JotaiProvider } from 'jotai';
import { AuthProvider } from '../providers/AuthProvider';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import '../styles/globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <JotaiProvider>
            <Navbar />
            <div className="flex min-h-screen w-full">
              <Sidebar />
              <main className="flex-1 bg-gray-50 max-w-screen-xl mx-auto px-2 sm:px-6 w-full">
                {children}
              </main>
            </div>
          </JotaiProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
