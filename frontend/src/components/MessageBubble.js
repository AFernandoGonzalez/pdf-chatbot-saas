export default function MessageBubble({ sender, text }) {
  const isUser = sender === 'user';
  return (
    <div
      className={`px-3 py-2 rounded-md max-w-full break-words 
        mb-2 text-sm sm:text-base 
        ${isUser ?
          'bg-blue-500 text-white self-end' :
          'bg-gray-300 self-start'}`}
      style={{ wordBreak: 'break-word' }}
    >
      {text}
    </div>
  );
}
