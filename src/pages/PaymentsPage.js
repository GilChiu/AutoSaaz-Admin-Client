import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';

const PaymentsPage = () => {
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getPayments({
        page: currentPage,
        limit: 10,
        search: query
      });
      setTransactions(data.transactions || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPayments();
  };

  const formatType = (type) => {
    const typeMap = {
      'user_payment': 'User Payment',
      'garage_payout': 'Garage Payout',
      'commission': 'Commission',
      'refund': 'Refund',
      'penalty': 'Penalty'
    };
    return typeMap[type] || type;
  };

  const formatStatus = (status) => {
    const statusMap = {
      'pending': 'Pending',
      'processing': 'Processing',
      'completed': 'Completed',
      'failed': 'Failed',
      'refunded': 'Refunded',
      'flagged': 'Flagged'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      'completed': 'text-green-600 bg-green-50',
      'pending': 'text-yellow-600 bg-yellow-50',
      'processing': 'text-blue-600 bg-blue-50',
      'failed': 'text-red-600 bg-red-50',
      'flagged': 'text-red-700 bg-red-100',
      'refunded': 'text-gray-600 bg-gray-50'
    };
    return colors[status] || 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Payments</h1>

      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-5 pt-5">
          <h2 className="text-lg font-semibold text-gray-800">Transaction Log</h2>
          <form onSubmit={handleSearch} className="mt-3 flex items-center gap-3">
            <input
              placeholder="Search by User & Garage name"
              className="w-full sm:w-[420px] px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
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
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Transaction #</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Booking #</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Garage</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Escrow</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-5 py-6 text-center text-sm text-gray-500">
                    Loading transactions...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-5 py-6 text-center text-sm text-gray-500">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                transactions.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-sm text-gray-800">{t.transactionNumber}</td>
                    <td className="px-5 py-3 text-sm text-gray-800">{t.bookingNumber}</td>
                    <td className="px-5 py-3 text-sm text-gray-800">{t.userName}</td>
                    <td className="px-5 py-3 text-sm text-gray-800">{t.garageName}</td>
                    <td className="px-5 py-3 text-sm text-gray-800">{formatType(t.type)}</td>
                    <td className="px-5 py-3 text-sm font-medium text-gray-800">
                      {t.amount?.toLocaleString()} AED
                    </td>
                    <td className="px-5 py-3 text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(t.status)}`}>
                        {formatStatus(t.status)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm">
                      {t.escrowStatus && (
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          t.escrowStatus === 'held' ? 'bg-yellow-50 text-yellow-700' :
                          t.escrowStatus === 'released' ? 'bg-green-50 text-green-700' :
                          'bg-gray-50 text-gray-700'
                        }`}>
                          {t.escrowStatus}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button 
                        onClick={() => navigate(`/payments/${t.id}`)} 
                        className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium px-4 py-1.5 rounded-md"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && transactions.length > 0 && (
          <div className="px-5 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing page {currentPage} of {totalPages} ({total} total transactions)
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentsPage;