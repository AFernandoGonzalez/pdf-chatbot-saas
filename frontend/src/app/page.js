'use client';

import { useAtom } from 'jotai';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { fetchUploadedFiles } from '../utils/api';
import { filesAtom } from '../store/atoms';
import { useAuth } from '../providers/AuthProvider';
import AuthModal from '../components/AuthModal';

export default function HomePage() {
  const router = useRouter();
  const inputRef = useRef();
  const [, setFiles] = useAtom(filesAtom);
  const { user, loading } = useAuth();
  const [, setShowModal] = useState(false);

  if (loading) return null;
  if (!user) return <AuthModal onClose={() => setShowModal(false)} />;

  async function uploadAndNavigate(file) {
    const fd = new FormData();
    fd.append('file', file);

    const endpoint =
      file.type === 'application/pdf'
        ? '/api/upload/upload-pdf'
        : file.type.startsWith('image/')
          ? '/api/upload/upload-img'
          : null;

    if (!endpoint) return alert('Unsupported file type.');

    try {
      const idToken = await user.getIdToken();

      const res = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        body: fd,
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Upload failed');

      const allFiles = await fetchUploadedFiles(user);
      setFiles(allFiles);

      router.push(`/chat/${data.fileId}`);
    } catch (err) {
      console.error('Upload error', err);
      alert('Upload failed — check console.');
    }
  }

  function onFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (
      file.type === 'application/pdf' ||
      file.type === 'image/jpeg' ||
      file.type === 'image/png'
    ) {
      uploadAndNavigate(file);
    } else {
      alert('Please select a PDF or a JPEG/PNG image.');
    }
  }

  function onDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
      uploadAndNavigate(file);
    } else {
      alert('Please drop a PDF or image file.');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <main className="flex-1 p-12">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Chat with any PDF</h1>
          <p className="text-gray-600 mt-2">
            Upload a PDF and start asking questions immediately.
          </p>
        </header>

        <section
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          className={`border-2 border-dashed border-gray-300 rounded-lg 
            p-12 flex flex-col items-center justify-center bg-white`}
        >
          <div className="text-center">
            <p className="text-xl font-medium">
              Click to upload, or drag & drop your PDF here
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Supports PDF. Upload and open chat instantly.
            </p>

            <input
              ref={inputRef}
              type="file"
              accept="application/pdf,image/jpeg,image/png"
              onChange={onFileChange}
              className="hidden"
            />

            <div className="mt-6">
              <button
                onClick={() => inputRef.current?.click()}
                className="px-6 py-2 bg-blue-600 text-white rounded-md"
              >
                Choose PDF
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
