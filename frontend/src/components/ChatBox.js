'use client'

import { useState } from 'react'
import MessageBubble from './MessageBubble'

export default function ChatBox({ pdfId }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMsg = { sender: 'user', text: input }
    setMessages((prev) => [...prev, userMsg])

    const res = await fetch('http://localhost:8000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileId: pdfId, question: input }),
    })

    const data = await res.json()
    const botMsg = { sender: 'bot', text: data.answer || 'No response' }
    setMessages((prev) => [...prev, botMsg])
    setInput('')
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg, i) => (
          <MessageBubble key={i} sender={msg.sender} text={msg.text} />
        ))}
      </div>
      <form onSubmit={sendMessage} className="flex p-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          type="text"
          placeholder="Ask something..."
          className="flex-1 px-4 py-2 rounded-l-md border border-gray-300"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-r-md">
          Send
        </button>
      </form>
    </div>
  )
}
