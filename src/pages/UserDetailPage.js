import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import ConfirmationModal from '../components/common/ConfirmationModal';
import SuspendUserModal from '../components/common/SuspendUserModal';

const badgeClass = (status) => status === 'active' || status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600';

const UserDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showUnsuspendModal, setShowUnsuspendModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const menuRef = useRef(null);

  const fetchUserDetail = useCallback(async (bypassCache = true) => {
    try {
      setLoading(true);
      setError('');
      console.log('🔍 [UserDetailPage] Fetching user detail, bypassCache:', bypassCache);
      const data = await apiService.getUserDetail(id, bypassCache);
      console.log('📥 [UserDetailPage] User data received:', { status: data?.status, name: data?.name });
      setUser(data);
    } catch (err) {
      setError(err.message || 'Failed to load user details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handleSuspend = async (reason) => {
    console.log('🎯 [UserDetailPage] handleSuspend called with reason:', reason);
    try {
      setActionLoading(true);
      setError('');
      
      const adminData = JSON.parse(localStorage.getItem('userData') || '{}');
      const adminId = adminData.id;
      
      console.log('👤 [UserDetailPage] Admin data:', { adminId, userId: id });
      console.log('📞 [UserDetailPage] Calling apiService.suspendUser...');
      
      await apiService.suspendUser(id, reason, adminId);
      
      console.log('✅ [UserDetailPage] Suspend successful, refreshing user data...');
      
      // Small delay to ensure backend has processed the update
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Force fresh fetch by bypassing cache
      await fetchUserDetail();
      
      console.log('🔄 [UserDetailPage] User data refreshed, closing modal...');
      setShowSuspendModal(false);
      setOpen(false);
    } catch (err) {
      console.error('❌ [UserDetailPage] Suspend error:', err);
      setError(err.message || 'Failed to suspend user');
      setShowSuspendModal(false);
    } finally {
      setActionLoading(false);
      console.log('🏁 [UserDetailPage] handleSuspend completed');
    }
  };

  const handleUnsuspend = async () => {
    console.log('🎯 [UserDetailPage] handleUnsuspend called');
    try {
      setActionLoading(true);
      setError('');
      
      const adminData = JSON.parse(localStorage.getItem('userData') || '{}');
      const adminId = adminData.id;
      
      console.log('👤 [UserDetailPage] Admin data:', { adminId, userId: id });
      console.log('📞 [UserDetailPage] Calling apiService.unsuspendUser...');
      
      await apiService.unsuspendUser(id, adminId);
      
      console.log('✅ [UserDetailPage] Unsuspend successful, refreshing user data...');
      
      // Small delay to ensure backend has processed the update
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Force fresh fetch by bypassing cache
      await fetchUserDetail();
      
      console.log('🔄 [UserDetailPage] User data refreshed, closing modal...');
      setShowUnsuspendModal(false);
      setOpen(false);
    } catch (err) {
      console.error('❌ [UserDetailPage] Unsuspend error:', err);
      setError(err.message || 'Failed to unsuspend user');
      setShowUnsuspendModal(false);
    } finally {
      setActionLoading(false);
      console.log('🏁 [UserDetailPage] handleUnsuspend completed');
    }
  };

  const handleDelete = async () => {
    try {
      setActionLoading(true);
      setError('');
      
      const adminData = JSON.parse(localStorage.getItem('userData') || '{}');
      const adminId = adminData.id;
      
      await apiService.deleteUserAccount(id, adminId);
      setShowDeleteModal(false);
      navigate('/users'); // Redirect to users list
    } catch (err) {
      setError(err.message || 'Failed to delete user');
      setShowDeleteModal(false);
      setActionLoading(false);
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
                  onClick={() => {
                    setOpen(false);
                    if (user.status === 'suspended') {
                      setShowUnsuspendModal(true);
                    } else {
                      setShowSuspendModal(true);
                    }
                  }}
                  className="block w-full text-left px-3 py-2 hover:bg-gray-50"
                  disabled={loading || actionLoading}
                >
                  {user.status === 'suspended' ? 'Unsuspend User' : 'Suspend User'}
                </button>
                <button 
                  onClick={() => {
                    setOpen(false);
                    setShowDeleteModal(true);
                  }}
                  className="block w-full text-left px-3 py-2 hover:bg-gray-50 text-red-600"
                  disabled={loading || actionLoading}
                >
                  Delete User
                </button>
                <button 
                  onClick={() => { 
                    setOpen(false); 
                    navigate(-1); 
                  }} 
                  className="block w-full text-left px-3 py-2 hover:bg-gray-50"
                >
                  Back
                </button>
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

      {/* Suspend User Modal */}
      <SuspendUserModal
        isOpen={showSuspendModal}
        onClose={() => setShowSuspendModal(false)}
        onConfirm={handleSuspend}
        userName={user.name}
        isLoading={actionLoading}
      />

      {/* Unsuspend User Modal */}
      <ConfirmationModal
        isOpen={showUnsuspendModal}
        onClose={() => setShowUnsuspendModal(false)}
        onConfirm={handleUnsuspend}
        title="Unsuspend User"
        message={`Are you sure you want to unsuspend ${user.name}? This will restore their account access.`}
        confirmText="Unsuspend User"
        cancelText="Cancel"
        type="success"
        isDestructive={false}
      />

      {/* Delete User Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to permanently delete ${user.name}? This action cannot be undone and will remove all user data.`}
        confirmText="Delete User"
        cancelText="Cancel"
        type="danger"
        isDestructive={true}
      />
    </div>
  );
};

export default UserDetailPage;
