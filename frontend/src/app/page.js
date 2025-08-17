'use client';

import { useAtom } from 'jotai';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { fetchUploadedFiles, uploadPDF, uploadImage } from '../utils/api';
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
    try {
      let data;
      if (file.type === 'application/pdf') {
        data = await uploadPDF(file, user);
      } else if (file.type.startsWith('image/')) {
        data = await uploadImage(file, user);
      } else {
        return alert('Unsupported file type.');
      }

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

    if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
      uploadAndNavigate(file);
    } else {
      alert('Please select a PDF or image file.');
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
              Supports PDF and images. Upload and open chat instantly.
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
                Choose File
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
