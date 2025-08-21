'use client';

import { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs?.version}/build/pdf.worker.min.mjs`;

export default function PDFViewer({ fileUrl, loadingFile }) {
  const containerRef = useRef();
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [containerWidth, setContainerWidth] = useState(600);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const onLoadSuccess = ({ numPages: nextNumPages }) => {
    setNumPages(nextNumPages);
    setPageNumber(1);
  };

  const goToPrevPage = () => setPageNumber((prev) => Math.max(prev - 1, 1));
  const goToNextPage = () => setPageNumber((prev) => Math.min(prev + 1, numPages));
  const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 3));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.4));

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex flex-col bg-white rounded-lg shadow-md border border-gray-200"
      style={{ minHeight: 600 }}
    >
      <div className="flex-1 overflow-auto flex justify-center items-center p-2">
        {loadingFile ? (
          <div className="flex flex-col items-center justify-center w-full h-full">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-2" />
            <p className="text-gray-500 text-center text-lg">Loading PDF...</p>
          </div>
        ) : (
          <Document
            file={fileUrl}
            onLoadSuccess={onLoadSuccess}
            loading={null}
            error={<p className="text-center text-red-500">Failed to load PDF.</p>}
          >
            {numPages && (
              <Page
                pageNumber={pageNumber}
                width={containerWidth - 16}
                scale={scale > 1 ? scale : 1}
                loading={<p className="text-gray-400">Loading page {pageNumber}...</p>}
                error={<p className="text-red-500">Failed to load page {pageNumber}</p>}
                className="rounded-lg shadow-sm border border-gray-100"
              />
            )}
          </Document>
        )}
      </div>

      <div className="mt-2 flex justify-center items-center border-t border-gray-200 p-2 gap-2 flex-wrap">
        <button
          onClick={zoomOut}
          disabled={scale <= 1}
          className="px-2 py-1 bg-gray-200 text-gray-700 rounded disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          -
        </button>
        <span className="text-gray-700 text-sm mx-1">{Math.round(scale * 100)}%</span>
        <button
          onClick={zoomIn}
          disabled={scale >= 3}
          className="px-2 py-1 bg-gray-200 text-gray-700 rounded disabled:bg-gray-100 disabled:cursor-not-allowed"
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
        <span className="text-gray-700">Page {pageNumber} of {numPages || '…'}</span>
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
