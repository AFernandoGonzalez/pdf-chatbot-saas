'use client';

import { useEffect, useCallback, useState } from 'react';
import { useAtom } from 'jotai';
import { useRouter, usePathname } from 'next/navigation';
import { fetchUploadedFiles } from '../utils/api';
import { filesAtom, selectedFileIdAtom } from '../store/atoms';
import { useAuth } from '../providers/AuthProvider';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [files, setFiles] = useAtom(filesAtom);
  const [selectedFileId, setSelectedFileId] = useAtom(selectedFileIdAtom);
  const [searchTerm, setSearchTerm] = useState('');
  const { user, loading, signOut } = useAuth();

  const dummyFiles = [
    { fileId: 'demo1', originalName: 'Sample PDF 1', uploadedAt: new Date() },
    { fileId: 'demo2', originalName: 'Sample PDF 2', uploadedAt: new Date() },
  ];

  const fetchFiles = useCallback(async () => {
    if (!user) {
      setFiles(dummyFiles);
      return;
    }

    try {
      const data = await fetchUploadedFiles(user);
      setFiles(data || []);
    } catch (err) {
      console.error('Failed to load files', err);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, setFiles]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  useEffect(() => {
    const match = pathname.match(/^\/chat\/([^\/]+)$/);
    if (match) {
      const fileIdFromPath = match[1];
      if (fileIdFromPath !== selectedFileId) {
        setSelectedFileId(fileIdFromPath);
      }
    } else {
      setSelectedFileId(null);
    }
  }, [pathname, selectedFileId, setSelectedFileId]);

  const filteredFiles = files.filter((file) =>
    (file.originalName ?? '').toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) return null;

  return (
    <aside className="w-64 min-w-[250px] bg-white border-r border-gray-200 h-screen overflow-auto">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">TalkPDF</h2>
      </div>

      <div className="p-4 border-b border-gray-200">
        <button
          onClick={() => router.push('/')}
          className={`w-full px-4 py-2 bg-blue-600 text-white 
            rounded-md text-sm font-medium hover:bg-blue-700 transition`}
        >
          + New Document
        </button>
      </div>

      <div className="p-4 border-b border-gray-200">
        <input
          type="search"
          placeholder="Search documents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full px-3 py-2 border border-gray-300 
            rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
        />
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-2">
        <div className="text-gray-600 text-xs font-semibold uppercase mb-3 tracking-wide">
          Recent Documents
        </div>

        <ul role="list" className="space-y-1">
          {filteredFiles.length === 0 && (
            <li className="text-gray-400 italic text-sm">No documents found</li>
          )}

          {filteredFiles.map((file) => (
            <li
              key={file.fileId}
              onClick={() => {
                if (user) router.push(`/chat/${file.fileId}`);
                setSelectedFileId(file.fileId);
              }}
              className={`flex items-center space-x-3 cursor-pointer rounded-md px-3 py-2
                ${selectedFileId === file.fileId
                  ? 'bg-blue-100 text-blue-900 font-semibold'
                  : 'hover:bg-gray-100 text-gray-700'
                } transition`}
            >
              <span className="truncate">{file.originalName}</span>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200 text-xs text-gray-400 text-center">
        {user ? "You're logged in" : 'Sign up to upload documents'}
      </div>

      <div className="p-4 border-t border-gray-200">
        {user && (
          <button
            onClick={signOut}
            className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
          >
            Log out
          </button>
        )}
      </div>

    </aside>
  );
}
