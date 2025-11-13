import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import ConfirmModal from '../components/common/ConfirmModal';

const badgeClass = (status) => {
  if (status === 'Active' || status === 'active') return 'bg-green-100 text-green-700';
  if (status === 'Suspended' || status === 'suspended') return 'bg-red-100 text-red-600';
  if (status === 'Deleted' || status === 'deleted') return 'bg-gray-100 text-gray-600';
  return 'bg-yellow-100 text-yellow-700';
};

const GarageDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [garage, setGarage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: () => {},
    showInput: false,
    inputValue: '',
    inputPlaceholder: ''
  });

  const fetchGarageDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiService.getGarageDetail(id);
      setGarage(data);
    } catch (err) {
      console.error('Error fetching garage details:', err);
      setError(err.message || 'Failed to load garage details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchGarageDetail();
  }, [fetchGarageDetail]);

  const handleSuspend = async () => {
    setOpen(false);
    if (!garage) return;

    if (garage.isSuspended) {
      // Unsuspend - no reason needed
      setConfirmModal({
        isOpen: true,
        title: 'Unsuspend Garage',
        message: `Are you sure you want to unsuspend ${garage.name}? This will restore the garage to active status.`,
        type: 'warning',
        showInput: false,
        onConfirm: async () => {
          try {
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            const adminId = userData.id;
            await apiService.unsuspendGarage(garage.id, adminId);
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
            fetchGarageDetail();
          } catch (err) {
            console.error('Error unsuspending garage:', err);
            setConfirmModal({
              isOpen: true,
              title: 'Error',
              message: err.message || 'Failed to unsuspend garage',
              type: 'danger',
              showInput: false,
              onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
            });
          }
        }
      });
    } else {
      // Suspend - reason required
      setConfirmModal({
        isOpen: true,
        title: 'Suspend Garage',
        message: `Are you sure you want to suspend ${garage.name}?`,
        type: 'danger',
        showInput: true,
        inputPlaceholder: 'Enter suspension reason',
        inputValue: '',
        onConfirm: async () => {
          try {
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            const adminId = userData.id;
            const reason = confirmModal.inputValue || 'Suspended by admin';
            await apiService.suspendGarage(garage.id, reason, adminId);
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
            fetchGarageDetail();
          } catch (err) {
            console.error('Error suspending garage:', err);
            setConfirmModal({
              isOpen: true,
              title: 'Error',
              message: err.message || 'Failed to suspend garage',
              type: 'danger',
              showInput: false,
              onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
            });
          }
        }
      });
    }
  };

  const handleDelete = async () => {
    setOpen(false);
    if (!garage) return;

    setConfirmModal({
      isOpen: true,
      title: 'Delete Garage',
      message: `Are you sure you want to DELETE ${garage.name}? This action cannot be undone.`,
      type: 'danger',
      showInput: false,
      onConfirm: async () => {
        try {
          const userData = JSON.parse(localStorage.getItem('userData') || '{}');
          const adminId = userData.id;
          await apiService.deleteGarage(garage.id, adminId);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
          navigate('/garages');
        } catch (err) {
          console.error('Error deleting garage:', err);
          setConfirmModal({
            isOpen: true,
            title: 'Error',
            message: err.message || 'Failed to delete garage',
            type: 'danger',
            showInput: false,
            onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
          });
        }
      }
    });
  };

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        <span className="ml-3 text-gray-600">Loading garage details...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  // No garage found
  if (!garage) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
        Garage not found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 relative">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Garage Details</h2>
          <div className="relative" ref={menuRef}>
            <button onClick={() => setOpen(o => !o)} className="text-gray-400 hover:text-gray-600 px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-primary-500">⋮</button>
            {open && (
              <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-md shadow-lg py-1 text-sm z-50">
                {!garage.isDeleted && (
                  <button 
                    onClick={handleSuspend}
                    className="block w-full text-left px-3 py-2 hover:bg-gray-50"
                  >
                    {garage.isSuspended ? 'Unsuspend Garage' : 'Suspend Garage'}
                  </button>
                )}
                {!garage.isDeleted && (
                  <button 
                    onClick={handleDelete}
                    className="block w-full text-left px-3 py-2 hover:bg-gray-50 text-red-600"
                  >
                    Delete Garage
                  </button>
                )}
                <button onClick={() => { setOpen(false); navigate(-1); }} className="block w-full text-left px-3 py-2 hover:bg-gray-50">Back</button>
              </div>
            )}
          </div>
        </div>
        <dl className="text-sm">
          <div className="grid grid-cols-5 py-2">
            <dt className="font-medium text-gray-600 col-span-1">Name:</dt>
            <dd className="col-span-4 text-gray-800">{garage.name}</dd>
          </div>
          <div className="grid grid-cols-5 py-2">
            <dt className="font-medium text-gray-600 col-span-1">Owner:</dt>
            <dd className="col-span-4 text-gray-800">{garage.owner}</dd>
          </div>
          <div className="grid grid-cols-5 py-2">
            <dt className="font-medium text-gray-600 col-span-1">Location:</dt>
            <dd className="col-span-4 text-gray-800">{garage.location || 'N/A'}</dd>
          </div>
          <div className="grid grid-cols-5 py-2">
            <dt className="font-medium text-gray-600 col-span-1">Email:</dt>
            <dd className="col-span-4 text-gray-800">{garage.email}</dd>
          </div>
          <div className="grid grid-cols-5 py-2">
            <dt className="font-medium text-gray-600 col-span-1">Phone:</dt>
            <dd className="col-span-4 text-gray-800">{garage.phone}</dd>
          </div>
          <div className="grid grid-cols-5 py-2">
            <dt className="font-medium text-gray-600 col-span-1">Status:</dt>
            <dd className="col-span-4"><span className={`px-2 py-0.5 rounded text-xs font-medium ${badgeClass(garage.status)}`}>{garage.status}</span></dd>
          </div>
          <div className="grid grid-cols-5 py-2">
            <dt className="font-medium text-gray-600 col-span-1">Rating:</dt>
            <dd className="col-span-4 text-gray-800">{garage.rating || 0} ★</dd>
          </div>
          {garage.isSuspended && (
            <div className="grid grid-cols-5 py-2 bg-red-50 -mx-6 px-6 py-3 mt-2">
              <dt className="font-medium text-red-600 col-span-1">Suspended:</dt>
              <dd className="col-span-4 text-red-700">
                {garage.suspensionReason || 'No reason provided'}
                {garage.suspendedAt && <div className="text-xs text-red-600 mt-1">Since: {new Date(garage.suspendedAt).toLocaleDateString()}</div>}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        {...confirmModal}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onInputChange={(value) => setConfirmModal(prev => ({ ...prev, inputValue: value }))}
      />
    </div>
  );
};

export default GarageDetailPage;
