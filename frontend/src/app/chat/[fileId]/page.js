'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '../../../providers/AuthProvider';
import ChatBox from '@/components/ChatBox';
import PDFViewer from '@/components/PDFViewer';

async function fetchFile(fileId, firebaseUser) {
  if (!firebaseUser) throw new Error('Not logged in');
  const token = await firebaseUser.getIdToken();

  const res = await fetch(`http://localhost:8000/api/files/${fileId}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!res.ok) throw new Error('File not found or access denied');
  return res.json();
}

export default function PDFChatPage({ params }) {
  const { fileId } = use(params);
  const router = useRouter();
  const { user, loading } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    const loadFile = async () => {
      try {
        const fileData = await fetchFile(fileId, user);
        setSelectedFile(fileData);
      } catch (err) {
        console.error('Error fetching file:', err);
        router.push('/');
      }
    };

    if (user) loadFile();
  }, [fileId, user, router]);

  if (loading || !user) return <div>Loading...</div>;
  if (!selectedFile) return <div>Loading file...</div>;

  const fileUrl = selectedFile.fileUrl.toLowerCase();
  const isPDF = fileUrl.endsWith('.pdf');
  const isImage = /\.(jpe?g|png|gif)$/i.test(fileUrl);

  return (
    <div className="flex h-screen">
      <div className="flex-1 p-6 flex justify-center items-start">
        {isPDF && <PDFViewer fileUrl={selectedFile.fileUrl} />}
        {isImage && (
          <Image
            src={selectedFile.fileUrl}
            alt={selectedFile.originalName || 'Uploaded Image'}
            width={800}
            height={600}
            className="max-w-full h-auto rounded shadow"
            style={{ objectFit: 'contain' }}
          />
        )}
        {!isPDF && !isImage && (
          <p className="text-gray-500">Unsupported file type for preview.</p>
        )}
      </div>

      <section className="flex-1 p-6 flex flex-col">
        <ChatBox pdfId={fileId} />
      </section>
    </div>
  );
}
