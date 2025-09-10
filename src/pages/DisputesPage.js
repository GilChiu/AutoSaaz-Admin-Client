import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const disputesMock = [
  { id: 'DSP001', user: 'Ali Khan', garage: 'AAA Auto Garage', type: 'Dispute', subject: 'Incorrect charge on invoice', status: 'Open', created: '2025-07-01' },
  { id: 'DSP002', user: 'Sara Malik', garage: 'AutoFix', type: 'Revision', subject: 'Request additional inspection photos', status: 'Under Review', created: '2025-07-02' },
  { id: 'DSP003', user: 'Bilal Ahmed', garage: 'City Car Care', type: 'Dispute', subject: 'Service not completed as quoted', status: 'Pending', created: '2025-07-03' },
  { id: 'DSP004', user: 'Aman Khan', garage: 'Metro Auto Works', type: 'Revision', subject: 'Change assigned mechanic', status: 'Resolved', created: '2025-06-28' },
];

const DisputesPage = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const filtered = useMemo(() => disputesMock.filter(d => {
    const q = query.toLowerCase();
    return !q || d.user.toLowerCase().includes(q) || d.garage.toLowerCase().includes(q) || d.id.toLowerCase().includes(q) || d.subject.toLowerCase().includes(q);
  }), [query]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Disputes & Revisions</h1>

      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-5 pt-5">
          <h2 className="text-lg font-semibold text-gray-800">Cases</h2>
          <div className="mt-3 flex items-center gap-3">
            <input
              placeholder="Search by ID, User, Garage, subject"
              className="w-full sm:w-[520px] px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-2 rounded-md shadow-sm">Search</button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Garage</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Subject</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map(d => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-sm text-gray-800">{d.id}</td>
                  <td className="px-5 py-3 text-sm text-gray-800">{d.user}</td>
                  <td className="px-5 py-3 text-sm text-gray-800">{d.garage}</td>
                  <td className="px-5 py-3 text-sm text-gray-800">{d.type}</td>
                  <td className="px-5 py-3 text-sm text-gray-800 max-w-[360px] truncate" title={d.subject}>{d.subject}</td>
                  <td className="px-5 py-3 text-sm text-gray-800">{d.status}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => navigate(`/disputes/${d.id}`)} className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium px-4 py-1.5 rounded-md">Manage</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="7" className="px-5 py-6 text-center text-sm text-gray-500">No cases found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DisputesPage;