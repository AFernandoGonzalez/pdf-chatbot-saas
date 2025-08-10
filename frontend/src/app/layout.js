'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import '../styles/globals.css';

export default function RootLayout({ children }) {
  const router = useRouter();
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    async function fetchFiles() {
      try {
        const res = await fetch('http://localhost:8000/api/files');
        const data = await res.json();
        setFiles(data);
      } catch (error) {
        console.error('Failed to load files:', error);
      }
    }
    fetchFiles();
  }, []);

  return (
    <html lang="en">
      <body>
        <div className="flex h-screen">
          {/* Sidebar */}
          <aside className="w-64 bg-gray-100 border-r p-4 overflow-y-auto">
            <h2
              className="text-lg font-semibold mb-4 cursor-pointer hover:underline"
              onClick={() => router.push('/')}
            >
              Your PDFs
            </h2>
            <ul className="space-y-2">
              {files.map((file) => (
                <li
                  key={file.fileId}
                  onClick={() => {
                    setSelectedFile(file);
                    router.push(`/chat/${file.fileId}`);
                  }}
                  className={`cursor-pointer p-2 rounded hover:bg-gray-200 text-black ${selectedFile?.fileId === file.fileId ? 'bg-blue-100 font-semibold' : ''
                    }`}
                >
                  {file.originalName}
                </li>
              ))}
            </ul>
          </aside>

          {/* Main content */}
          <main className="flex-1 p-4 overflow-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
