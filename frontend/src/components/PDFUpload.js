'use client';

import { useState } from 'react';
import { uploadPDF } from '@/utils/api';
import { useAuth } from '@/providers/AuthProvider';

export default function PDFUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (file) {
      try {
        setLoading(true);
        const { fileId, fileUrl } = await uploadPDF(file, user);
        onUploadSuccess({
          fileId,
          fileUrl,
          fileName: file.name,
        });
      } catch (err) {
        alert('Upload failed', err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full max-w-xs mx-auto">
      <input type="file" accept="application/pdf" onChange={handleFileChange} className="w-full text-sm" />
      <button
        onClick={handleUpload}
        disabled={loading || !file}
        className={`w-full px-4 py-2 rounded text-white 
          ${file ?
          'bg-blue-600 hover:bg-blue-700' :
          'bg-gray-400 cursor-not-allowed'}`}
      >
        {loading ? 'Uploading...' : 'Upload PDF'}
      </button>
    </div>
  );
}
