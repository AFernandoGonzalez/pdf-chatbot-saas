'use client';

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs?.version}/build/pdf.worker.min.mjs`;

export default function PDFViewer({ fileUrl }) {
  const [numPages, setNumPages] = useState(null);

  const onLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  return (
    <div className="w-full h-[85vh] overflow-y-scroll border rounded">
      {/* <Document file={fileUrl} onLoadSuccess={onLoadSuccess}>
        {Array.from(new Array(numPages), (_, index) => (
          <Page key={index} pageNumber={index + 1} width={400} />
        ))}
      </Document> */}
      <Document
  file={fileUrl}
  onLoadSuccess={onLoadSuccess}
  loading={<p>Loading PDF...</p>}
  error={<p>Failed to load PDF.</p>}
>
  {numPages && Array.from(new Array(numPages), (_, index) => (
    <Page
      key={index}
      pageNumber={index + 1}
      width={400}
      loading={<p>Loading page {index + 1}...</p>}
      error={<p>Failed to load page {index + 1}</p>}
    />
  ))}
</Document>

    </div>
  );
}
