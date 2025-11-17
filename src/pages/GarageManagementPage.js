import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { MoreVertical } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import ConfirmModal from '../components/common/ConfirmModal';
import debounce from '../utils/debounce';

// Memoized GarageRow component
const GarageRow = React.memo(({ garage, openMenu, menuRef, menuPosition, onNavigate, onMenuClick, onSuspend, onDelete }) => (
  <tr key={garage.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onNavigate(garage.id)}>
    <td className="px-5 py-4 text-sm font-medium text-gray-900">{garage.name}</td>
    <td className="px-5 py-4 text-sm text-gray-700">{garage.owner}</td>
    <td className="px-5 py-4 text-sm text-gray-700">{garage.contact}</td>
    <td className="px-5 py-4 text-sm text-gray-700">{garage.area}</td>
    <td className="px-5 py-4 text-sm">
      <span className={`px-2 py-1 rounded text-xs font-medium ${
        garage.isSuspended ? 'bg-red-100 text-red-700' :
        garage.isDeleted ? 'bg-gray-100 text-gray-700' :
        'bg-green-100 text-green-700'
      }`}>
        {garage.status}
      </span>
    </td>
    <td className="px-5 py-4 text-sm text-gray-700">{garage.rating} ★</td>
    <td className="px-5 py-4 text-right text-sm font-medium relative" ref={openMenu === garage.id ? menuRef : null}>
      <button
        onClick={(e) => onMenuClick(e, garage.id)}
        className="text-gray-400 hover:text-gray-600"
      >
        <MoreVertical className="h-5 w-5" />
      </button>
      {openMenu === garage.id && (
        <div className={`origin-top-right absolute right-0 w-44 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 ${
          menuPosition === 'top' ? 'bottom-full mb-2' : 'mt-2'
        }`}>
          <div className="py-1 text-sm">
            <button
              onClick={(e) => { e.stopPropagation(); onNavigate(garage.id); }}
              className="block w-full text-left px-3 py-2 hover:bg-gray-50"
            >View Details</button>
            {!garage.isDeleted && (
              <button
                onClick={(e) => onSuspend(garage, e)}
                className="block w-full text-left px-3 py-2 hover:bg-gray-50"
              >
                {garage.isSuspended ? 'Unsuspend Garage' : 'Suspend Garage'}
              </button>
            )}
            {!garage.isDeleted && (
              <button
                onClick={(e) => onDelete(garage, e)}
                className="block w-full text-left px-3 py-2 hover:bg-gray-50 text-red-600"
              >Delete Garage</button>
            )}
          </div>
        </div>
      )}
    </td>
  </tr>
));

GarageRow.displayName = 'GarageRow';

const GarageManagementPage = () => {
  const [garages, setGarages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // Modal states
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'danger',
    onConfirm: () => {},
    showInput: false,
    inputValue: '',
    inputPlaceholder: ''
  });

  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(null);
  const [menuPosition, setMenuPosition] = useState('bottom'); // 'bottom' or 'top'
  const menuRef = useRef(null);

  const fetchGarages = useCallback(async (searchTerm = search) => {
    try {
      setLoading(true);
      setError('');
      const result = await apiService.getGarages({
        page,
        limit,
        search: searchTerm,
      });
      
      setGarages(result.data || []);
      setTotal(result.meta?.total || 0);
      setTotalPages(result.meta?.totalPages || 1);
    } catch (err) {
      console.error('Error fetching garages:', err);
      setError(err.message || 'Failed to load garages');
      setGarages([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => {
    fetchGarages();
  }, [fetchGarages]);

  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce((value) => {
      setSearch(value);
      setPage(1);
    }, 500),
    []
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    debouncedSearch(value);
  };

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Memoized handlers
  const handleNavigate = useCallback((garageId) => {
    setOpenMenu(null);
    navigate(`/garages/${garageId}`);
  }, [navigate]);

  const handleMenuClick = useCallback((e, garageId) => {
    e.stopPropagation();
    
    // Calculate if menu should open upwards or downwards
    const buttonRect = e.currentTarget.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - buttonRect.bottom;
    const menuHeight = 120;
    
    if (spaceBelow < menuHeight && buttonRect.top > menuHeight) {
      setMenuPosition('top');
    } else {
      setMenuPosition('bottom');
    }
    
    setOpenMenu(m => m === garageId ? null : garageId);
  }, []);

  const handleSuspendGarage = async (garage, e) => {
    e.stopPropagation();
    setOpenMenu(null);
    
    if (garage.isSuspended) {
      // Unsuspend - no reason needed
      setConfirmModal({
        isOpen: true,
        title: 'Unsuspend Garage',
        message: `Are you sure you want to unsuspend ${garage.name}? This will restore the garage to active status.`,
        type: 'warning',
        showInput: false,
        onConfirm: async () => {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
          try {
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            const adminId = userData.id;
            await apiService.unsuspendGarage(garage.id, adminId);
            fetchGarages();
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
      // Suspend - ask for reason
      setConfirmModal({
        isOpen: true,
        title: 'Suspend Garage',
        message: `Are you sure you want to suspend ${garage.name}?`,
        type: 'danger',
        showInput: true,
        inputPlaceholder: 'Reason for suspension (optional)',
        inputValue: '',
        onConfirm: async () => {
          const reason = confirmModal.inputValue || 'Suspended by admin';
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
          try {
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            const adminId = userData.id;
            await apiService.suspendGarage(garage.id, reason, adminId);
            fetchGarages();
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

  const handleDeleteGarage = async (garage, e) => {
    e.stopPropagation();
    setOpenMenu(null);
    
    setConfirmModal({
      isOpen: true,
      title: 'Delete Garage',
      message: `Are you sure you want to DELETE ${garage.name}? This action cannot be undone.`,
      type: 'danger',
      showInput: false,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          const userData = JSON.parse(localStorage.getItem('userData') || '{}');
          const adminId = userData.id;
          await apiService.deleteGarage(garage.id, adminId);
          fetchGarages();
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
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenu(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Garage Management</h1>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search by garage name"
          className="w-full sm:w-[520px] px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
          value={searchInput}
          onChange={handleSearchChange}
          onKeyPress={handleKeyPress}
        />
        <button 
          onClick={handleSearch}
          className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-2 rounded-md shadow-sm"
        >
          Search
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <span className="ml-3 text-gray-600">Loading garages...</span>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && garages.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <svg className="w-16 h-16 mb-4 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p className="text-lg font-medium text-gray-900 mb-2">No garages found</p>
          <p className="text-sm text-gray-500">
            {search ? 'Try adjusting your search criteria' : 'Garages will appear here once they register'}
          </p>
        </div>
      )}

      {/* Garages Table */}
      {!loading && !error && garages.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-auto mb-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Garage Name</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Owner</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Contact</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Area</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Rating</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {garages.map((garage) => (
                <GarageRow 
                  key={garage.id} 
                  garage={garage} 
                  openMenu={openMenu}
                  menuRef={menuRef}
                  menuPosition={menuPosition}
                  onNavigate={handleNavigate}
                  onMenuClick={handleMenuClick}
                  onSuspend={handleSuspendGarage}
                  onDelete={handleDeleteGarage}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && garages.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} garages
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-gray-700">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        {...confirmModal}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onInputChange={(value) => setConfirmModal(prev => ({ ...prev, inputValue: value }))}
      />
    </div>
  );
};

export default GarageManagementPage;
