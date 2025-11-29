import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';

const DisputesPage = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [disputes, setDisputes] = useState([]);
  const navigate = useNavigate();

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getDisputes({
        page: 1,
        limit: 100,
        search: query
      });
      setDisputes(data.disputes || []);
    } catch (err) {

      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDisputes();
  };

  const formatType = (type) => {
    return type === 'dispute' ? 'Dispute' : 'Revision';
  };

  const formatStatus = (status) => {
    const statusMap = {
      'open': 'Open',
      'under_review': 'Under Review',
      'pending': 'Pending',
      'in_progress': 'In Progress',
      'resolved': 'Resolved',
      'closed': 'Closed'
    };
    return statusMap[status] || status;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Disputes & Revisions</h1>

      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-5 pt-5">
          <h2 className="text-lg font-semibold text-gray-800">Cases</h2>
          <form onSubmit={handleSearch} className="mt-3 flex items-center gap-3">
            <input
              placeholder="Search by ID, User, Garage, subject"
              className="w-full sm:w-[520px] px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-2 rounded-md shadow-sm">Search</button>
          </form>
        </div>

        {error && (
          <div className="mx-5 mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}

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
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-5 py-6 text-center text-sm text-gray-500">
                    Loading cases...
                  </td>
                </tr>
              ) : disputes.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-5 py-6 text-center text-sm text-gray-500">
                    No cases found.
                  </td>
                </tr>
              ) : (
                disputes.map(d => (
                  <tr 
                    key={d.id} 
                    className={`hover:bg-gray-50 ${d.escalated ? 'bg-red-50 border-l-4 border-red-500' : ''}`}
                  >
                    <td className="px-5 py-3 text-sm text-gray-800">
                      {d.code}
                      {d.escalated && (
                        <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded">
                          ESCALATED
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-800">{d.userName}</td>
                    <td className="px-5 py-3 text-sm text-gray-800">{d.garageName}</td>
                    <td className="px-5 py-3 text-sm text-gray-800">{formatType(d.type)}</td>
                    <td className="px-5 py-3 text-sm text-gray-800 max-w-[360px] truncate" title={d.subject}>{d.subject}</td>
                    <td className="px-5 py-3 text-sm text-gray-800">{formatStatus(d.status)}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{formatDate(d.created_at || d.createdAt)}</td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => navigate(`/disputes/${d.id}`)} className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium px-4 py-1.5 rounded-md">Manage</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DisputesPage;