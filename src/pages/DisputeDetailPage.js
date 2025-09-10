import React from 'react';
import { useParams } from 'react-router-dom';

const store = {
  DSP001: {
    id: 'DSP001', type: 'Dispute', status: 'Open', subject: 'Incorrect charge on invoice',
    user: { name: 'Ali Khan', email: 'ali@example.com' },
    garage: { name: 'AAA Auto Garage' },
    messages: [
      { at: '2025-07-01 10:20', by: 'User', text: 'Charged extra 200 AED compared to quote.' },
      { at: '2025-07-01 12:05', by: 'Admin', text: 'We are reviewing the invoice and quotation.' }
    ]
  },
  DSP002: {
    id: 'DSP002', type: 'Revision', status: 'Under Review', subject: 'Request additional inspection photos',
    user: { name: 'Sara Malik', email: 'sara@example.com' },
    garage: { name: 'AutoFix' },
    messages: [
      { at: '2025-07-02 09:00', by: 'User', text: 'Please provide more photos around the engine bay.' }
    ]
  }
};

const Badge = ({ children, color }) => (
  <span className={`px-2 py-0.5 rounded-full text-xs ${color}`}>{children}</span>
);

const DisputeDetailPage = () => {
  const { id } = useParams();
  const data = store[id] || store.DSP001;

  const statusColor = data.status === 'Resolved' ? 'bg-green-100 text-green-700' : data.status === 'Under Review' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700';

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Disputes & Revisions</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Case Details</h2>
              <Badge color={statusColor}>{data.status}</Badge>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <div className="text-gray-500">Case ID</div>
                <div className="text-gray-900 font-medium">{data.id}</div>
                <div className="mt-3 text-gray-500">Type</div>
                <div className="text-gray-900">{data.type}</div>
              </div>
              <div>
                <div className="text-gray-500">Subject</div>
                <div className="text-gray-900">{data.subject}</div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h3 className="font-semibold text-gray-800 mb-3">Conversation</h3>
            <div className="space-y-4 text-sm">
              {data.messages.map((m, idx) => (
                <div key={idx} className="border border-gray-200 rounded-md p-3">
                  <div className="flex items-center justify-between text-gray-500">
                    <div>{m.by}</div>
                    <div>{m.at}</div>
                  </div>
                  <div className="mt-2 text-gray-900">{m.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h3 className="font-semibold text-gray-800 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full px-3 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm">Request Evidence</button>
              <button className="w-full px-3 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white text-sm">Resolve Case</button>
              <button className="w-full px-3 py-2 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-sm">Escalate</button>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5 text-sm">
            <h3 className="font-semibold text-gray-800 mb-3">Parties</h3>
            <div className="text-gray-500">User</div>
            <div className="text-gray-900">{data.user.name} · {data.user.email}</div>
            <div className="mt-3 text-gray-500">Garage</div>
            <div className="text-gray-900">{data.garage.name}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisputeDetailPage;