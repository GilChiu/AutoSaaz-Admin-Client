import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const paymentsMock = [
  { id: 'TXN001', user: 'Ali Khan', garage: 'AutoFix', type: 'User Payment', amount: 1200, currency: 'AED', status: 'Completed' },
  { id: 'TXN002', user: 'Ali Khan', garage: 'AutoFix', type: 'User Payment', amount: 1200, currency: 'AED', status: 'Pending' },
  { id: 'TXN003', user: 'Sara Malik', garage: 'AAA Auto Garage', type: 'Commission', amount: 280, currency: 'AED', status: 'Completed' },
  { id: 'TXN004', user: 'Bilal Ahmed', garage: 'Metro Auto Works', type: 'User Payment', amount: 1640, currency: 'AED', status: 'Pending' },
  { id: 'TXN005', user: 'Aman Khan', garage: 'City Car Care', type: 'Commission', amount: 360, currency: 'AED', status: 'Completed' },
];

const PaymentsPage = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const filtered = useMemo(() => paymentsMock.filter(p => {
    const q = query.toLowerCase();
    return !q || p.user.toLowerCase().includes(q) || p.garage.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
  }), [query]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Payments</h1>

      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-5 pt-5">
          <h2 className="text-lg font-semibold text-gray-800">Transaction Log</h2>
          <div className="mt-3 flex items-center gap-3">
            <input
              placeholder="Search by User & Garage name"
              className="w-full sm:w-[420px] px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
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
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-sm text-gray-800">{p.id}</td>
                  <td className="px-5 py-3 text-sm text-gray-800">{p.user}</td>
                  <td className="px-5 py-3 text-sm text-gray-800">{p.garage}</td>
                  <td className="px-5 py-3 text-sm text-gray-800">{p.type}</td>
                  <td className="px-5 py-3 text-sm text-gray-800">{p.amount.toLocaleString()} {p.currency}</td>
                  <td className="px-5 py-3 text-sm text-gray-800">{p.status}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => navigate(`/payments/${p.id}`)} className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium px-4 py-1.5 rounded-md">Manage</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="7" className="px-5 py-6 text-center text-sm text-gray-500">No transactions found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentsPage;