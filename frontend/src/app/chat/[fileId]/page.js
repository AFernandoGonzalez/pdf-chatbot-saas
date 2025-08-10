// 'use client'
// import { useEffect, useState } from 'react'
// import { useParams } from 'next/navigation'
// import PDFViewer from '@/components/PDFViewer'
// import ChatBox from '@/components/ChatBox'

// export default function PDFChatPage() {
//   const params = useParams()
//   const fileId = params.fileId
//   const [selectedFile, setSelectedFile] = useState(null)

//   useEffect(() => {
//     const fetchFile = async () => {
//       const res = await fetch(`http://localhost:8000/api/files/${fileId}`)
//       const data = await res.json()
//       setSelectedFile(data)
//     }
//     fetchFile()
//   }, [fileId])

//   return (
//     <div className="flex h-screen">
//       <div className="flex-1 flex">
//         {/* PDF Viewer */}
//         <div className="w-2/3 p-6">
//           {selectedFile && <PDFViewer fileUrl={selectedFile.fileUrl} />}
//         </div>

//         {/* Chat Section */}
//         <section className="flex-1 p-6 flex flex-col">
//           <div className="flex-1 overflow-auto">
//             <h3 className="text-lg font-semibold mb-2">Summary</h3>
//             <div className="bg-gray-100 p-4 rounded text-sm text-gray-700 mb-6">
//               {selectedFile ? (
//                 <p>Generating summary for this document...</p>
//               ) : (
//                 <p>No file selected.</p>
//               )}
//             </div>

//             <h4 className="text-sm font-semibold mb-2">Suggested Questions:</h4>
//             <ul className="space-y-2 mb-6 text-sm">
//               <li className="bg-white p-2 rounded shadow cursor-pointer hover:bg-gray-50">
//                 Summarize the project requirements
//               </li>
//               <li className="bg-white p-2 rounded shadow cursor-pointer hover:bg-gray-50">
//                 What challenges are there in scraping large sites?
//               </li>
//               <li className="bg-white p-2 rounded shadow cursor-pointer hover:bg-gray-50">
//                 How does specialty equipment impact the scraper?
//               </li>
//             </ul>

//             <ChatBox pdfId={fileId} />
//           </div>
//         </section>
//       </div>
//     </div>
//   )
// }

import React from 'react';
import dynamic from 'next/dynamic';
import ChatBox from '@/components/ChatBox';
import PDFViewer from '@/components/PDFViewer';

// Use React's experimental `use` to unwrap async props (params is now a Promise)
const { use } = React;

// Dynamically import PDFViewer only on client
// const PDFViewer = dynamic(() => import('@/components/PDFViewer'), { ssr: false });

// Async function to fetch file info by ID
async function fetchFile(fileId) {
    const res = await fetch(`http://localhost:8000/api/files/${fileId}`, {
        // avoid caching to get fresh data on every request
        cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch file');
    return res.json();
}

export default function PDFChatPage({ params }) {
    // unwrap params Promise
    const unwrappedParams = use(params);
    const { fileId } = unwrappedParams;

    // fetch file info
    const selectedFile = use(fetchFile(fileId));

    return (
        <div className="flex h-screen">
            <div className="flex-1 flex">
                {/* PDF Viewer */}
                <div className="w-2/3 p-6">
                    {selectedFile && <PDFViewer fileUrl={selectedFile?.fileUrl} />}
                </div>

                {/* Chat Section */}
                {/* Chat Section */}
                <section className="flex-1 p-6 flex flex-col">
                    <ChatBox pdfId={fileId} />
                </section>

                {/* <section className="flex-1 p-6 flex flex-col">
          <div className="flex-1 overflow-auto">
            <h3 className="text-lg font-semibold mb-2">Summary</h3>
            <div className="bg-gray-100 p-4 rounded text-sm text-gray-700 mb-6">
              {selectedFile ? (
                <p>Generating summary for this document...</p>
              ) : (
                <p>No file selected.</p>
              )}
            </div>

            <h4 className="text-sm font-semibold mb-2">Suggested Questions:</h4>
            <ul className="space-y-2 mb-6 text-sm">
              <li className="bg-white p-2 rounded shadow cursor-pointer hover:bg-gray-50">
                Summarize the project requirements
              </li>
              <li className="bg-white p-2 rounded shadow cursor-pointer hover:bg-gray-50">
                What challenges are there in scraping large sites?
              </li>
              <li className="bg-white p-2 rounded shadow cursor-pointer hover:bg-gray-50">
                How does specialty equipment impact the scraper?
              </li>
            </ul>

            {/* ChatBox is a client component */}
                {/* <ChatBox pdfId={fileId} />
            </div>
        </section> */}
      </div >
    </div >
  );
}
