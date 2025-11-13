import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';

const SupportUserTicketsPage = () => {
  const [query, setQuery] = useState('');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getSupportTickets('user');
      setTickets(data);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => tickets.filter(t => {
    const q = query.toLowerCase();
    return !q || 
      t.ticketNumber?.toLowerCase().includes(q) || 
      t.senderName?.toLowerCase().includes(q) || 
      t.subject?.toLowerCase().includes(q);
  }), [tickets, query]);

  const getStatusColor = (status) => {
    const colors = {
      'open': 'bg-yellow-100 text-yellow-700',
      'in_progress': 'bg-blue-100 text-blue-700',
      'resolved': 'bg-green-100 text-green-700',
      'closed': 'bg-gray-100 text-gray-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': 'bg-gray-100 text-gray-600',
      'normal': 'bg-blue-100 text-blue-600',
      'high': 'bg-orange-100 text-orange-600',
      'urgent': 'bg-red-100 text-red-600'
    };
    return colors[priority] || 'bg-gray-100 text-gray-600';
  };

  const formatStatus = (status) => {
    const statusMap = {
      'open': 'Open',
      'in_progress': 'In Progress',
      'resolved': 'Resolved',
      'closed': 'Closed'
    };
    return statusMap[status] || status;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Support & Communication</h1>

      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-5 pt-5">
          <h2 className="text-lg font-semibold text-gray-800">User Tickets</h2>
          <div className="mt-3 flex items-center gap-3">
            <input
              placeholder="Search User Tickets"
              className="w-full sm:w-[520px] px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button 
              className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-2 rounded-md shadow-sm"
              onClick={fetchTickets}
            >
              Refresh
            </button>
          </div>
        </div>

        {loading && (
          <div className="px-5 py-8 text-center text-gray-500">
            Loading tickets...
          </div>
        )}

        {error && (
          <div className="mx-5 my-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="px-5 py-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No user tickets</h3>
            <p className="mt-1 text-sm text-gray-500">
              {query ? 'No tickets match your search criteria.' : 'There are currently no support tickets from users.'}
            </p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Ticket ID</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Priority</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Age</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Subject</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-sm text-gray-800 font-medium">{t.ticketNumber}</td>
                    <td className="px-5 py-3 text-sm text-gray-800">{t.senderName}</td>
                    <td className="px-5 py-3 text-sm">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getPriorityColor(t.priority)}`}>
                        {t.priority.charAt(0).toUpperCase() + t.priority.slice(1)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(t.status)}`}>
                        {formatStatus(t.status)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600">{t.age}</td>
                    <td className="px-5 py-3 text-sm text-gray-800 max-w-[360px] truncate" title={t.subject}>{t.subject}</td>
                    <td className="px-5 py-3 text-right">
                      <button 
                        onClick={() => navigate(`/support/users/${t.id}`)} 
                        className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium px-4 py-1.5 rounded-md"
                      >
                        Open Chat
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportUserTicketsPage;
