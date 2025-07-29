export default function MessageBubble({ sender, text }) {
  const isUser = sender === "user";
  return (
    <div
      className={`mb-2 p-3 max-w-[75%] rounded-lg ${
        isUser ? "bg-blue-500 text-white self-end" : "bg-gray-200 text-black self-start"
      }`}
    >
      {text}
    </div>
  );
}
