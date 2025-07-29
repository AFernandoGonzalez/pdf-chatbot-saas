'use client'
import ChatBox from '@/components/ChatBox'

export default function ChatPage({ params }) {
  const { id } = params

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Chat with PDF: {id}</h2>
      <ChatBox pdfId={id} />
    </div>
  )
}
