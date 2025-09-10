import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

const initialMessages = [
  { id: 1, from: 'user', text: "Hello admin the customer hasn't pay after delivery.", time: '10:22 AM' },
  { id: 2, from: 'admin', text: 'Thank you for reporting we are reviewing the order.', time: '10:26 AM' },
];

const SupportUserChatPage = () => {
  const { id } = useParams();
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');

  const send = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), from: 'admin', text: input.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setInput('');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Support & Communication</h1>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="border border-gray-200 rounded-md p-4 min-h-[280px]">
          <div className="space-y-3">
            {messages.map(m => (
              <div key={m.id} className={`max-w-[60%] ${m.from === 'admin' ? 'bg-gray-100 text-gray-800 rounded-lg p-3' : 'bg-blue-100 text-gray-800 rounded-lg p-3 ml-auto'}`}>
                <div>{m.text}</div>
                <div className="text-xs text-gray-500 mt-1 text-right">{m.time}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <input
            className="flex-1 px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="Type your message to admin......"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
          />
          <button onClick={send} className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-2 rounded-md">Send</button>
        </div>
        <div className="text-xs text-gray-500 mt-1">Ticket: {id}</div>
      </div>
    </div>
  );
};

export default SupportUserChatPage;
