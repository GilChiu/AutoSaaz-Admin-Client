import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const garageTickets = [
  { id: 'TCKT1001', garage: 'Ahmed Garage', priority: 'High', status: 'Open', age: '2 hrs', booking: 'BKG12345', message: 'Issue with service listing visibility.' },
  { id: 'TCKT1003', garage: 'Speed Fix Garage', priority: 'Low', status: 'In Progress', age: '3 hrs', booking: 'BKG12345', message: 'Client not reachable on scheduled day.' },
];

const SupportGarageTicketsPage = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const filtered = useMemo(() => garageTickets.filter(t => {
    const q = query.toLowerCase();
    return !q || t.id.toLowerCase().includes(q) || t.garage.toLowerCase().includes(q) || t.booking.toLowerCase().includes(q) || t.message.toLowerCase().includes(q);
  }), [query]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Support</h1>

      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-5 pt-5">
          <h2 className="text-lg font-semibold text-gray-800">Support & Communication</h2>
          <div className="mt-3 flex items-center gap-3">
            <input
              placeholder="Search User Tickets"
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
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Ticket ID</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Garage Name</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Priority</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Age</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Booking</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Message</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map(t => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-sm text-gray-800">{t.id}</td>
                  <td className="px-5 py-3 text-sm text-gray-800">{t.garage}</td>
                  <td className="px-5 py-3 text-sm text-gray-800">{t.priority}</td>
                  <td className="px-5 py-3 text-sm text-gray-800">{t.status}</td>
                  <td className="px-5 py-3 text-sm text-gray-800">{t.age}</td>
                  <td className="px-5 py-3 text-sm text-gray-800">{t.booking}</td>
                  <td className="px-5 py-3 text-sm text-gray-800 max-w-[360px] truncate" title={t.message}>{t.message}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => navigate(`/support/garages/${t.id}`)} className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium px-4 py-1.5 rounded-md">Open Chat</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="8" className="px-5 py-6 text-center text-sm text-gray-500">No tickets found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SupportGarageTicketsPage;
