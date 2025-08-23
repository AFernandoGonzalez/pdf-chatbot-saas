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
  const [showModal, setShowModal] = useState(false);

  if (loading) return null;

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
      <main className="flex-1 p-4 sm:p-8 md:p-12 w-full max-w-5xl mx-auto">
        <header className="mb-6 sm:mb-8 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold">Chat with any PDF</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Upload a PDF and start asking questions immediately.
          </p>
        </header>

        {!user ? (
          <div className="flex flex-col items-center justify-center bg-white p-8 rounded-lg shadow">
            <p className="text-gray-700 mb-4">Please login to upload and chat with PDFs.</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Login to Continue
            </button>
            {showModal && <AuthModal onClose={() => setShowModal(false)} />}
          </div>
        ) : (
          <section
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-300 rounded-lg
              p-6 sm:p-10 md:p-12 flex flex-col items-center justify-center
              bg-white text-center"
          >
            <p className="text-lg sm:text-xl font-medium">
              Click to upload, or drag & drop your PDF here
            </p>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              Supports PDF and images. Upload and open chat instantly.
            </p>

            <input
              ref={inputRef}
              type="file"
              accept="application/pdf,image/jpeg,image/png"
              onChange={onFileChange}
              className="hidden"
            />

            <div className="mt-4 sm:mt-6">
              <button
                onClick={() => inputRef.current?.click()}
                className="px-4 py-2 sm:px-6 sm:py-2 bg-blue-600 text-white
                  rounded-md text-sm sm:text-base hover:bg-blue-700"
              >
                Choose File
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
