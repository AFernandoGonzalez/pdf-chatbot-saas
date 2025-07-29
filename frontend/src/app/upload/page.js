'use client'
import PDFUpload from '@/components/PDFUpload'

export default function UploadPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Upload a PDF</h1>
      <PDFUpload />
    </div>
  )
}
