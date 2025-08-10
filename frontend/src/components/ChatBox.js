'use client';

import { useState, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';

export default function ChatBox({ pdfId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [summary, setSummary] = useState('Loading summary...');
  const [questions, setQuestions] = useState([]);
  const chatEndRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch summary and questions when pdfId changes
  useEffect(() => {
    if (!pdfId) {
      setSummary('No file selected.');
      setQuestions([]);
      return;
    }

    async function fetchSummary() {
      try {
        const res = await fetch(`http://localhost:8000/api/chat/file-info/${pdfId}`);
        const data = await res.json();

        if (res.ok) {
          setSummary(data.summary || 'No summary available.');
          setQuestions(data.questions || []);
        } else {
          setSummary('Failed to load summary.');
          setQuestions([]);
        }
      } catch (err) {
        setSummary('Error loading summary.');
        setQuestions([]);
        console.error(err);
      }
    }

    fetchSummary();
  }, [pdfId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { sender: 'user', text: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    try {
      const res = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId: pdfId, question: userMsg.text }),
      });

      const data = await res.json();
      const botMsg = { sender: 'bot', text: data.answer || 'No response' };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errorMsg = { sender: 'bot', text: 'Error fetching response.' };
      setMessages((prev) => [...prev, errorMsg]);
      console.error(err);
    }
  };

  // Format summary with paragraphs and bullet points
  function formatSummary(text) {
    const lines = text.split('\n');

    const elements = [];
    let listItems = [];

    lines.forEach((line, idx) => {
      if (line.trim().startsWith('- ')) {
        listItems.push(line.trim().substring(2));
      } else {
        if (listItems.length) {
          elements.push(
            <ul key={`ul-${idx}`} className="list-disc list-inside mb-3 ml-4 text-gray-700">
              {listItems.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          );
          listItems = [];
        }
        if (line.trim() !== '') {
          elements.push(
            <p key={`p-${idx}`} className="mb-3 leading-relaxed text-gray-800">
              {line}
            </p>
          );
        }
      }
    });

    if (listItems.length) {
      elements.push(
        <ul key="ul-last" className="list-disc list-inside mb-3 ml-4 text-gray-700">
          {listItems.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    }

    return elements;
  }

  // Remove quotes from questions (if any)
  const cleanQuestions = questions.map(q => q.replace(/^["“”](.*)["“”]$/, '$1'));

  return (
    <div className="flex flex-col h-full max-w-xl mx-auto p-4 bg-white shadow-lg rounded-lg">
      {/* Summary */}
      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-3 border-b border-gray-300 pb-1">Summary</h3>
        <div className="bg-gray-50 p-4 rounded-md max-h-48 overflow-auto text-sm">
          {formatSummary(summary)}
        </div>
      </section>

      {/* Suggested Questions */}
      <section className="mb-6">
        <h4 className="text-md font-semibold mb-3">Suggested Questions</h4>
        <ul className="space-y-2 text-sm">
          {cleanQuestions.map((q, idx) => (
            <li
              key={idx}
              onClick={() => setInput(q)}
              className="bg-white p-3 rounded-md shadow-sm cursor-pointer hover:bg-blue-50 transition"
              title="Click to ask this question"
            >
              {q}
            </li>
          ))}
        </ul>
      </section>

      {/* Chat Messages */}
      <section className="flex-1 overflow-y-auto p-4 border border-gray-200 rounded-md mb-4 bg-gray-50">
        {messages.length === 0 && (
          <p className="text-gray-400 text-center mt-10 select-none">Start the conversation by asking a question...</p>
        )}
        {messages.map((msg, i) => (
          <MessageBubble key={i} sender={msg.sender} text={msg.text} />
        ))}
        <div ref={chatEndRef} />
      </section>

      {/* Input */}
      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          type="text"
          placeholder="Ask something..."
          className="flex-1 px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className={`px-6 py-3 rounded-md text-white font-semibold transition ${
            input.trim() ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300 cursor-not-allowed'
          }`}
        >
          Send
        </button>
      </form>
    </div>
  );
}
