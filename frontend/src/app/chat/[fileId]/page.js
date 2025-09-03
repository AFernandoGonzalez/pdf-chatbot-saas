'use client';

import dynamic from 'next/dynamic';
import React, { useEffect, useState, use } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '../../../providers/AuthProvider';
import { fetchFile } from '../../../utils/api';
import ChatBox from '@/components/ChatBox';

const PDFViewer = dynamic(() => import('@/components/PDFViewer'), { ssr: false });

export default function PDFChatPage() {
  const params = useParams();
  const { fileId } = params;
  const router = useRouter();
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [loadingFile, setLoadingFile] = useState(true);

  useEffect(() => {
    const loadFile = async () => {
      try {
        setLoadingFile(true);
        const fileData = await fetchFile(fileId, user);
        setSelectedFile(fileData);
      } catch (err) {
        router.push('/');
      } finally {
        setLoadingFile(false);
      }
    };

    if (user) loadFile();
  }, [fileId, user, router]);

  const fileUrl = selectedFile?.fileUrl?.toLowerCase();
  const isPDF = fileUrl?.endsWith('.pdf');
  const isImage = /\.(jpe?g|png|gif)$/i.test(fileUrl);

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      <div className="hidden md:flex flex-1 p-4 justify-center items-start min-h-0 overflow-auto">
        {loadingFile && (
          <p className="text-gray-500 text-center text-lg animate-pulse">
            Loading file...
          </p>
        )}
        {!loadingFile && selectedFile && (
          <>
            {isPDF && <PDFViewer fileUrl={selectedFile.fileUrl} loadingFile={loadingFile} />}
            {isImage && (
              <Image
                src={selectedFile.fileUrl}
                alt={selectedFile.originalName || 'Uploaded Image'}
                className="max-w-full max-h-full object-contain rounded shadow"
                width={800}
                height={600}
              />
            )}
            {!isPDF && !isImage && (
              <p className="text-gray-500">Unsupported file type for preview.</p>
            )}
          </>
        )}
      </div>

      <section className="flex-1 p-4 flex flex-col min-h-0 overflow-auto">
        <ChatBox pdfId={fileId} />
      </section>
    </div>
  );

}
