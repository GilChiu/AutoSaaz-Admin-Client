import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';

const badgeClass = (status) => status === 'active' || status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600';

const UserDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const fetchUserDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiService.getUserDetail(id);
      setUser(data);
    } catch (err) {
      setError(err.message || 'Failed to load user details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handleSuspend = async () => {
    if (!window.confirm(`Are you sure you want to suspend ${user.name}?`)) {
      return;
    }

    const reason = window.prompt('Enter suspension reason (optional):');
    
    try {
      setOpen(false);
      setLoading(true);
      setError('');
      
      const adminData = JSON.parse(localStorage.getItem('userData') || '{}');
      const adminId = adminData.id;
      
      await apiService.suspendUser(id, reason || 'Suspended by admin', adminId);
      await fetchUserDetail(); // Refresh user data
      alert('User suspended successfully');
    } catch (err) {
      setError(err.message || 'Failed to suspend user');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to DELETE ${user.name}? This action cannot be undone.`)) {
      return;
    }

    if (!window.confirm('This will permanently delete the user account. Are you absolutely sure?')) {
      return;
    }
    
    try {
      setOpen(false);
      setLoading(true);
      setError('');
      
      const adminData = JSON.parse(localStorage.getItem('userData') || '{}');
      const adminId = adminData.id;
      
      await apiService.deleteUserAccount(id, adminId);
      alert('User deleted successfully');
      navigate('/users'); // Redirect to users list
    } catch (err) {
      setError(err.message || 'Failed to delete user');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetail();
  }, [fetchUserDetail]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        <span className="ml-3 text-gray-600">Loading user details...</span>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error || 'User not found'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 relative">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">User Details</h2>
          <div className="relative" ref={menuRef}>
            <button onClick={() => setOpen(o => !o)} className="text-gray-400 hover:text-gray-600 px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-primary-500">⋮</button>
            {open && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg py-1 text-sm z-10">
                <button 
                  onClick={handleSuspend}
                  className="block w-full text-left px-3 py-2 hover:bg-gray-50"
                  disabled={loading}
                >
                  {user.status === 'suspended' ? 'Unsuspend User' : 'Suspend User'}
                </button>
                <button 
                  onClick={handleDelete}
                  className="block w-full text-left px-3 py-2 hover:bg-gray-50 text-red-600"
                  disabled={loading}
                >
                  Delete User
                </button>
                <button onClick={() => { setOpen(false); navigate(-1); }} className="block w-full text-left px-3 py-2 hover:bg-gray-50">Back</button>
              </div>
            )}
          </div>
        </div>
        <dl className="text-sm">
          <div className="grid grid-cols-5 py-2">
            <dt className="font-medium text-gray-600 col-span-1">Name:</dt>
            <dd className="col-span-4 text-gray-800">{user.name}</dd>
          </div>
          <div className="grid grid-cols-5 py-2">
            <dt className="font-medium text-gray-600 col-span-1">Phone:</dt>
            <dd className="col-span-4 text-gray-800">{user.phone}</dd>
          </div>
            <div className="grid grid-cols-5 py-2">
            <dt className="font-medium text-gray-600 col-span-1">Email:</dt>
            <dd className="col-span-4 text-gray-800">{user.email}</dd>
          </div>
          <div className="grid grid-cols-5 py-2">
            <dt className="font-medium text-gray-600 col-span-1">Status:</dt>
            <dd className="col-span-4"><span className={`px-2 py-0.5 rounded text-xs font-medium ${badgeClass(user.status)}`}>{user.status}</span></dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default UserDetailPage;
