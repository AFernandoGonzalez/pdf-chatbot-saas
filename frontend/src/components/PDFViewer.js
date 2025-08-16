'use client';

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs?.version}/build/pdf.worker.min.mjs`;

export default function PDFViewer({ fileUrl }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);

  const onLoadSuccess = ({ loadedNumPages }) => {
    setNumPages(loadedNumPages);
    setPageNumber(1);
  };

  const goToPrevPage = () => setPageNumber((prev) => Math.max(prev - 1, 1));
  const goToNextPage = () => setPageNumber((prev) => Math.min(prev + 1, numPages));
  const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 3));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.4));

  return (
    <div className="w-full h-full bg-white rounded-lg shadow-md border border-gray-200 p-4 flex flex-col items-center">
      <div className="flex-1 overflow-auto flex justify-center w-full">
        <div className="w-full flex justify-center">
          <Document
            file={fileUrl}
            onLoadSuccess={onLoadSuccess}
            loading={<p className="text-center text-gray-500">Loading PDF...</p>}
            error={<p className="text-center text-red-500">Failed to load PDF.</p>}
          >
            <Page
              pageNumber={pageNumber}
              width={Math.min(640, window.innerWidth - 48)}
              scale={scale > 1 ? scale : 1}
              loading={<p className="text-gray-400">Loading page {pageNumber}...</p>}
              error={<p className="text-red-500">Failed to load page {pageNumber}</p>}
              className="rounded-lg shadow-sm border border-gray-100"
            />
          </Document>
        </div>
      </div>

      <div className={`mt-4 flex justify-center items-center border-t 
        border-gray-200 pt-3 select-none gap-2 w-full max-w-[640px]`}>
        <button
          onClick={zoomOut}
          disabled={scale <= 1}
          className="px-2 py-1 bg-gray-200 text-gray-700 rounded disabled:bg-gray-100 disabled:cursor-not-allowed"
          title="Zoom out"
        >
          -
        </button>
        <span className="text-gray-700 text-sm mx-1">{Math.round(scale * 100)}%</span>
        <button
          onClick={zoomIn}
          disabled={scale >= 3}
          className="px-2 py-1 bg-gray-200 text-gray-700 rounded disabled:bg-gray-100 disabled:cursor-not-allowed"
          title="Zoom in"
        >
          +
        </button>

        <div className="w-px h-4 bg-[#DDD] mx-1"></div>
        <button
          onClick={goToPrevPage}
          disabled={pageNumber <= 1}
          className="px-3 py-1 bg-blue-600 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Prev
        </button>

        <span className="text-gray-700">
          Page {pageNumber} of {numPages || '…'}
        </span>

        <div className="w-px h-4 bg-[#DDD] mx-1"></div>

        <button
          onClick={goToNextPage}
          disabled={pageNumber >= numPages}
          className="px-3 py-1 bg-blue-600 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}
