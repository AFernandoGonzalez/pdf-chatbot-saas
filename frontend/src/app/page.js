
export default function HomePage() {
  return (
    <main className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-1/6 bg-white shadow-md p-4 border-r border-gray-200">
        <h2 className="text-xl font-bold mb-6">📄 PDF Chat</h2>
        <ul className="space-y-4 text-gray-700">
          <li className="hover:text-blue-600 cursor-pointer">Home</li>
          <li className="hover:text-blue-600 cursor-pointer">Upload</li>
          <li className="hover:text-blue-600 cursor-pointer">Chat</li>
        </ul>
      </aside>

      {/* PDF Viewer */}
      <section className="w-2/5 p-6 bg-white border-r border-gray-200 overflow-auto">
        <h3 className="text-lg font-semibold mb-2">PDF Preview</h3>
        <div className="w-full h-[80vh] bg-gray-200 rounded flex items-center justify-center">
          <span className="text-gray-500">PDF content will appear here</span>
        </div>
      </section>

      {/* Chat Area */}
      <section className="flex-1 p-6 flex flex-col justify-between">
        <div className="flex-1 overflow-auto mb-4">
          <h3 className="text-lg font-semibold mb-2">Chat with Document</h3>
          <div className="space-y-2">
            <div className="bg-gray-300 px-4 py-2 rounded-md self-start w-fit">
              Example system message...
            </div>
            <div className="bg-blue-500 text-white px-4 py-2 rounded-md self-end w-fit">
              User message...
            </div>
          </div>
        </div>
        <form className="flex">
          <input
            type="text"
            placeholder="Ask something..."
            className="flex-1 px-4 py-2 rounded-l-md border border-gray-300"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-r-md"
          >
            Send
          </button>
        </form>
      </section>
    </main>
  );
}
