'use client';

import { useEffect, useCallback, useState } from 'react';
import { useAtom } from 'jotai';
import { useRouter, usePathname } from 'next/navigation';
import { fetchUploadedFiles } from '../utils/api';
import { filesAtom, selectedFileIdAtom } from '../store/atoms';
import { useAuth } from '../providers/AuthProvider';

export default function Sidebar({ open = false, onClose, className = '' }) {
  const router = useRouter();
  const pathname = usePathname();
  const [files, setFiles] = useAtom(filesAtom);
  const [selectedFileId, setSelectedFileId] = useAtom(selectedFileIdAtom);
  const [searchTerm, setSearchTerm] = useState('');
  const { user, signOut } = useAuth();
  const [loadingFiles, setLoadingFiles] = useState(true);

  const fetchFiles = useCallback(async () => {
    setLoadingFiles(true);
    if (!user) {
      setLoadingFiles(false);
      return;
    }

    try {
      const data = await fetchUploadedFiles(user);
      setFiles(data || []);
    } catch (err) {
      console.error('Failed to load files', err);
      setFiles([]);
    } finally {
      setLoadingFiles(false);
    }
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

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/40 md:hidden transition-opacity ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed top-0 left-0 z-50 h-full bg-white border-r border-gray-200 transform transition-transform
          w-full md:w-64 ${className} ${
            open ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 md:static md:block`}
      >
        <SidebarContent
          files={filteredFiles}
          selectedFileId={selectedFileId}
          router={router}
          user={user}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          setSelectedFileId={setSelectedFileId}
          signOut={signOut}
          onClose={onClose}
          loadingFiles={loadingFiles}
        />
      </aside>
    </>
  );
}

function SidebarContent({
  files,
  selectedFileId,
  router,
  user,
  searchTerm,
  setSearchTerm,
  setSelectedFileId,
  signOut,
  onClose,
  loadingFiles,
}) {
  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between">
        {onClose && (
          <button onClick={onClose} className="md:hidden text-gray-600">
            ✕
          </button>
        )}
      </div>

      <div className="p-4 sm:p-4 border-b border-gray-200">
        <button
          onClick={() => {
            router.push('/');
            onClose?.();
          }}
          className="
            w-full text-ellipsis whitespace-nowrap overflow-hidden px-4 py-2
            bg-blue-600 text-white rounded-md text-sm font-medium
            hover:bg-blue-700 transition
          "
        >
          + New Document
        </button>
      </div>

      <div className="p-4 sm:p-4 border-b border-gray-200">
        <input
          type="search"
          placeholder="Search documents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="
            w-full px-3 py-2 border border-gray-300 rounded-md
            focus:outline-none focus:ring-2 focus:ring-blue-500
          "
        />
      </div>

      <nav className="flex-1 overflow-y-auto px-4 sm:px-4 py-2">
        <div className="text-gray-600 text-xs font-semibold uppercase mb-3 tracking-wide">
          Recent Documents
        </div>

        <ul role="list" className="space-y-1">
          {loadingFiles
            ? Array.from({ length: 4 }).map((_, idx) => (
                <li
                  key={idx}
                  className="h-8 bg-gray-200 animate-pulse rounded-md"
                />
              ))
            : files.length === 0
            ? <li className="text-gray-400 italic text-sm truncate">No documents found</li>
            : files.map((file) => (
                <li
                  key={file.fileId}
                  onClick={() => {
                    router.push(`/chat/${file.fileId}`);
                    setSelectedFileId(file.fileId);
                    onClose?.();
                  }}
                  className={`flex items-center space-x-3 cursor-pointer rounded-md px-3 py-2 truncate
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

      {user && (
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={signOut}
            className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
