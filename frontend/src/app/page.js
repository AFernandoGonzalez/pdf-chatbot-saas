'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  // const [files, setFiles] = useState([])
  // const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [fileInput, setFileInput] = useState(null)

  const router = useRouter()

  // Fetch uploaded files from backend
  // useEffect(() => {
  //   const fetchFiles = async () => {
  //     try {
  //       const res = await fetch('http://localhost:8000/api/files')
  //       const data = await res.json()
  //       console.log('Fetched files:', data);
        
  //       setFiles(data)
  //     } catch (err) {
  //       console.error('Failed to load files:', err)
  //     }
  //   }

  //   fetchFiles()
  // }, [])

  // Handle PDF file upload
  const handleUpload = async () => {
    if (!fileInput) return
    const formData = new FormData()
    formData.append('file', fileInput)

    setUploading(true)
    try {
      const res = await fetch('http://localhost:8000/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      setFiles((prev) => [...prev, data]) // update UI
      setSelectedFile(data) // set selected to new one
      router.push(`/c/${data.fileId}`) // navigate to chat
    } catch (err) {
      console.error('Upload failed:', err)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      {/* <aside className="w-64 bg-gray-100 border-r p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Your PDFs</h2>
        <ul className="space-y-2">
          {files.map((file) => (
            <li
              key={file.fileId}
              onClick={() => router.push(`/chat/${file.fileId}`)}
              className={`cursor-pointer p-2 rounded hover:bg-gray-200 text-black ${
                selectedFile?.fileId === file.fileId ? 'bg-blue-100 font-semibold' : ''
              }`}
            >
              {file.originalName}
            </li>
          ))}
        </ul>

      </aside> */}

      {/* Main Upload Section */}
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-4">Upload a PDF</h1>

        <input
          type="file"
          accept="application"
          onChange={(e) => setFileInput(e.target.files?.[0] || null)}
          className="mb-4"
        />
        <button
          onClick={handleUpload}
          disabled={!fileInput || uploading}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Upload PDF'}
        </button>
      </main>
    </div>
  )
}
