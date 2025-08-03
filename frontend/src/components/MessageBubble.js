export default function MessageBubble({ sender, text }) {
  const isUser = sender === 'user'
  return (
    <div className={`px-4 py-2 rounded-md w-fit mb-2 ${isUser ? 'bg-blue-500 text-white self-end' : 'bg-gray-300 self-start'}`}>
      {text}
    </div>
  )
}
