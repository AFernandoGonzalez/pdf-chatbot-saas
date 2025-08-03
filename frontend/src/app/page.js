'use client';

import { useState } from 'react';
import ChatBox from '@/components/ChatBox';
import { uploadPDF } from '@/utils/api';
import dynamic from 'next/dynamic';

// Dynamically import react-pdf components (client-side only)
const Document = dynamic(
  () => import('react-pdf').then(mod => {
    // Set the workerSrc for pdfjs
    if (mod.pdfjs) {
      mod.pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
    }
    return mod.Document;
  }),
  { ssr: false }
);
const Page = dynamic(
  () => import('react-pdf').then(mod => mod.Page),
  { ssr: false }
);

export default function HomePage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [fileId, setFileId] = useState(null);
  const [fileName, setFileName] = useState('');
  const [numPages, setNumPages] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    try {
      setLoading(true);
      const { fileId, fileUrl } = await uploadPDF(file);
      setPdfUrl(fileUrl);
      setFileId(fileId);
      setFileName(file.name);
    } catch (err) {
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePdfLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  return (
    <main className="flex h-screen">
      {/* Left Sidebar */}
      <aside className="w-[20%] bg-white border-r border-gray-300 p-4 flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold mb-4">📄 Chats</h2>
          {fileName && (
            <div className="text-blue-600 font-medium truncate mb-4">
              {fileName}
            </div>
          )}

          {/* Upload UI */}
          <div className="flex flex-col gap-2">
            <input type="file" accept="application/pdf" onChange={handleFileChange} />
            <button
              onClick={handleUpload}
              className="bg-blue-500 text-white px-4 py-2 rounded"
              disabled={loading}
            >
              {loading ? "Uploading..." : "Upload PDF"}
            </button>
          </div>

          <ul className="mt-6 space-y-2 text-gray-700 text-sm">
            <li className="hover:text-blue-600 cursor-pointer">+ New folder</li>
          </ul>

          <div className="mt-8">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Tools</h3>
            <ul className="text-sm space-y-1 text-gray-500">
              <li>AI Scholar</li>
              <li>AI Detector</li>
              <li>AI Writer</li>
            </ul>
          </div>
        </div>
        <div className="text-xs text-gray-400">Sign up to save chat history</div>
      </aside>

      {/* PDF Viewer */}
      <section className="w-[40%] bg-white border-r border-gray-300 p-6 overflow-auto">
        <h3 className="text-lg font-semibold mb-2">PDF Preview</h3>
        {pdfUrl ? (
          <div className="w-full h-[85vh] overflow-y-scroll border rounded">
            <Document file={pdfUrl} onLoadSuccess={handlePdfLoadSuccess}>
              {Array.from(new Array(numPages), (_, index) => (
                <Page key={index} pageNumber={index + 1} width={400} />
              ))}
            </Document>
          </div>
        ) : (
          <div className="w-full h-[85vh] flex items-center justify-center bg-gray-100 text-gray-500 rounded">
            Upload a PDF to preview it
          </div>
        )}
      </section>

      {/* Right Chat + Summary */}
      <section className="flex-1 p-6 flex flex-col">
        <div className="flex-1 overflow-auto">
          <h3 className="text-lg font-semibold mb-2">Summary</h3>
          <div className="bg-gray-100 p-4 rounded text-sm text-gray-700 mb-6">
            {fileId ? (
              <p>Generating summary for this document...</p>
            ) : (
              <p>No file uploaded yet.</p>
            )}
          </div>

          <h4 className="text-sm font-semibold mb-2">Suggested Questions:</h4>
          <ul className="space-y-2 mb-6 text-sm">
            <li className="bg-white p-2 rounded shadow cursor-pointer hover:bg-gray-50">Summarize the project requirements</li>
            <li className="bg-white p-2 rounded shadow cursor-pointer hover:bg-gray-50">What challenges are there in scraping large sites?</li>
            <li className="bg-white p-2 rounded shadow cursor-pointer hover:bg-gray-50">How does specialty equipment impact the scraper?</li>
          </ul>

          {fileId && <ChatBox pdfId={fileId} />}
        </div>
      </section>
    </main>
  );
}
