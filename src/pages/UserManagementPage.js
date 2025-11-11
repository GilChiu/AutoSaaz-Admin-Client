import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const fetchUsers = async (searchTerm = search) => {
    try {
      setLoading(true);
      setError('');
      const result = await apiService.getUsers({
        page,
        limit,
        search: searchTerm,
      });
      
      setUsers(result.data || []);
      setTotal(result.meta?.total || 0);
      setTotalPages(result.meta?.totalPages || 1);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1); // Reset to first page on search
    fetchUsers();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <input
            type="text"
            placeholder="Search by name, phone, email..."
            className="w-full sm:w-96 px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-2 rounded-md shadow-sm disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">User Name</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Phone</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Car Model</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Bookings</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Verification</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total Sale</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center text-sm text-gray-500">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                    <span className="ml-3">Loading users...</span>
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <p className="text-lg font-medium text-gray-700">No users found</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {search ? 'Try adjusting your search criteria' : 'Users will appear here once they register'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4 text-sm text-gray-900 font-medium">{user.name || 'N/A'}</td>
                  <td className="px-5 py-4 text-sm text-gray-700">{user.phone || 'N/A'}</td>
                  <td className="px-5 py-4 text-sm text-gray-700 max-w-[140px] truncate" title={user.email}>{user.email}</td>
                  <td className="px-5 py-4 text-sm text-gray-700">{user.carModel || 'N/A'}</td>
                  <td className="px-5 py-4 text-sm text-gray-700">{user.bookings || 0}</td>
                  <td className="px-5 py-4 text-sm flex items-center gap-1">
                    {user.verification === 'Validated' ? (
                      <>
                        <span className="text-green-600">Validated</span>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </>
                    ) : (
                      <>
                        <span className="text-red-600">Unvalidated</span>
                        <XCircle className="h-4 w-4 text-red-600" />
                      </>
                    )}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700">{user.totalSale || '0 AED'}</td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => navigate(`/users/${user.id}`)}
                      className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium px-4 py-2 rounded-md shadow"
                    >View Details</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && users.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} users
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-gray-700">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;
