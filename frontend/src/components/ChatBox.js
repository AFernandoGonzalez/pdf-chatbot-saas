'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { fetchSummaryAndQuestions, fetchChatMessages, sendChatMessage  } from '@/utils/api';

export default function ChatBox({ pdfId }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [questions, setQuestions] = useState([]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (!pdfId || !user) {
      setSummary('No file selected.');
      setQuestions([]);
      setLoadingSummary(false);
      return;
    }

    setLoadingSummary(true);
    setSummary(null);
    setQuestions([]);

    let polling = true;

    async function pollSummary() {
      try {
        const res = await fetchSummaryAndQuestions(pdfId, user);

        if (res.status === 202) {
          if (polling) setTimeout(pollSummary, 3000);
        } else if (res.ok) {
          const data = await res.json();
          setSummary(data.summary || 'No summary available.');
          setQuestions(data.questions || []);
          setLoadingSummary(false);
        } else {
          setSummary('Failed to load summary.');
          setQuestions([]);
          setLoadingSummary(false);
        }
      } catch (err) {
        setSummary('Error loading summary.');
        setQuestions([]);
        setLoadingSummary(false);
        console.error(err);
      }
    }

    pollSummary();

    return () => {
      polling = false;
    };
  }, [pdfId, user]);

  useEffect(() => {
    if (!pdfId || !user) {
      setMessages([]);
      return;
    }

    async function loadMessages() {
      try {
        const data = await fetchChatMessages(pdfId, user);
        setMessages(data.map((msg) => ({ sender: msg.sender, text: msg.text })));
      } catch (err) {
        console.error('Failed to load messages:', err);
        setMessages([]);
      }
    }

    loadMessages();
  }, [pdfId, user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendQuestion(question) {
    if (!question.trim() || !user) return;

    setMessages((prev) => [...prev, { sender: 'user', text: question }]);
    setInput('');
    setMessages((prev) => [...prev, { sender: 'bot', text: '' }]);

    try {
      const res = await sendChatMessage({ pdfId, question, user });

      if (!res.body) throw new Error('No response body from server');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let answer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        answer += decoder.decode(value, { stream: true });

        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { sender: 'bot', text: answer };
          return updated;
        });
      }
    } catch (err) {
      console.error('Chat error', err);
      setMessages((prev) => [...prev, { sender: 'bot', text: 'Error getting response.' }]);
    }
  }

  async function sendMessage(e) {
    e?.preventDefault();
    await sendQuestion(input);
  }

  function formatSummary(text) {
    if (!text) return null;
    const cut = text.split(/Suggested Questions:/i)[0].trim();
    const lines = cut.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

    const out = [];
    let list = [];
    lines.forEach((line, i) => {
      if (line.startsWith('-')) {
        list.push(line.replace(/^-+\s*/, ''));
      } else {
        if (list.length) {
          out.push(
            <ul key={`ul-${i}`} className="list-disc list-inside mb-2 text-sm text-gray-700 ml-4">
              {list.map((li, idx) => <li key={idx}>{li}</li>)}
            </ul>,
          );
          list = [];
        }
        out.push(
          <div key={`p-${i}`} className="text-sm text-gray-800 mb-2">{line}</div>,
        );
      }
    });
    if (list.length) {
      out.push(
        <ul key="ul-last" className="list-disc list-inside mb-2 text-sm text-gray-700 ml-4">
          {list.map((li, idx) => <li key={idx}>{li}</li>)}
        </ul>,
      );
    }
    return out;
  }

  const cleanedQuestions = (questions || []).map((q) => q.replace(/^["“”](.*)["“”]$/, '$1'));

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto bg-white shadow-md rounded-lg">
      <div className="px-4 py-3 border-b border-gray-200 font-semibold text-lg text-gray-700">
        Chat with your PDF
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-b-lg">
        {summary && (
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <strong className="block mb-2 text-gray-800">Summary:</strong>
            <div className="text-gray-700 whitespace-pre-wrap">{formatSummary(summary)}</div>
          </div>
        )}

        {cleanedQuestions.length > 0 && (
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <strong className="block mb-3 text-gray-800">Suggested Questions:</strong>
            <div className="flex flex-wrap gap-3">
              {cleanedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => sendQuestion(q)}
                  className={`bg-blue-100 hover:bg-blue-200 text-blue-800
                    rounded-md px-4 py-2 text-sm font-medium transition`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[75%] p-3 rounded-lg shadow-sm whitespace-pre-wrap break-words
                ${m.sender === 'user'
                  ? 'bg-blue-600 text-white self-end rounded-br-none'
                  : 'bg-white text-gray-900 self-start rounded-bl-none border border-gray-200'
                }`}
            >
              {m.text}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
      </div>

      <form
        onSubmit={sendMessage}
        className="flex items-center gap-3 border-t border-gray-200 p-4 bg-white rounded-b-lg"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something about this PDF..."
          disabled={loadingSummary}
          className={`flex-1 border border-gray-300 rounded-md px-4 py-2 text-gray-900
            placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
        />
        <button
          type="submit"
          disabled={!input.trim() || loadingSummary}
          className={`px-5 py-2 rounded-md text-white font-semibold
            ${input.trim() && !loadingSummary ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'}`}
        >
          Send
        </button>
      </form>
    </div>
  );
}
