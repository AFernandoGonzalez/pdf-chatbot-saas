// src/components/PDFUpload.jsx
"use client";
import { useState } from "react";
import { uploadPDF } from "../utils/api";

export default function PDFUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (file) {
      try {
        setLoading(true);
        const { fileId, fileUrl } = await uploadPDF(file);
        // 🔥 Send info back to parent so it can show PDF
        onUploadSuccess({
          fileId,
          fileUrl,
          fileName: file.name,
        });
      } catch (err) {
        alert("Upload failed");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      <button
        onClick={handleUpload}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {loading ? "Uploading..." : "Upload PDF"}
      </button>
    </div>
  );
}
