import React, { useState, useEffect, useCallback } from "react";
import { useParams } from 'react-router-dom';
import { apiService } from '../services/apiService';

const StatusBadge = ({ status }) => {
  const cls = status === 'pending' ? 'bg-yellow-100 text-yellow-700' : status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700';
  const label = status === 'pending' ? 'Pending' : status === 'in_progress' ? 'In Progress' : 'Completed';
  return <span className={`px-3 py-1 rounded-full text-xs font-medium ${cls}`}>{label}</span>;
};

const OrderCard = ({ order, onAssign, onComplete }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-5">
    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-start">
      <div>
        <div className="text-xs uppercase text-gray-500">User</div>
        <div className="text-sm text-gray-800">{order.customerName}</div>
      </div>
      <div>
        <div className="text-xs uppercase text-gray-500">Garage</div>
        <div className="text-sm text-gray-800">{order.garageName}</div>
      </div>
      <div>
        <div className="text-xs uppercase text-gray-500">Pickup Schedule</div>
        <div className="text-sm text-gray-800">{order.pickupSchedule}</div>
      </div>
      <div>
        <div className="text-xs uppercase text-gray-500">Recovery Status</div>
        <div className="text-sm text-gray-800">{formatRecoveryStatus(order.recoveryStatus)}</div>
      </div>
      <div>
        <div className="text-xs uppercase text-gray-500">Quotation</div>
        <div className="text-sm text-gray-800">{order.quotation} AED</div>
      </div>
      <div>
        <div className="text-xs uppercase text-gray-500">Inspection Report</div>
        <div className="text-sm text-gray-800 truncate" title={order.inspectionReport}>{order.inspectionReport || 'N/A'}</div>
      </div>
    </div>
    <div className="mt-4 flex items-center justify-between">
      <div className="text-xs text-gray-600">
        <div className="font-medium">Payment Status</div>
        <div>{formatPaymentStatus(order.paymentStatus)}</div>
      </div>
      <div className="flex items-center gap-3">
        <StatusBadge status={order.status} />
        {/* Show buttons based on status */}
        {order.status === 'pending' && (
          <button onClick={() => onAssign(order)} className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md">
            Assign / Change Garage
          </button>
        )}
        {order.status === 'in_progress' && (
          <>
            <button onClick={() => onAssign(order)} className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md">
              Assign / Change Garage
            </button>
            <button onClick={() => onComplete(order)} className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-md">
              Mark as Completed
            </button>
          </>
        )}
        {/* Completed status: no buttons */}
      </div>
    </div>
  </div>
);

const formatRecoveryStatus = (status) => {
  const map = {
    'awaiting_confirmation': 'Awaiting Confirmation',
    'awaiting_pickup': 'Awaiting Pickup',
    'assigned': 'Assigned',
    'driver_en_route': 'Driver En Route',
    'picked_up': 'Picked Up',
    'at_garage': 'At Garage',
    'diagnosing': 'Diagnosing',
    'parts_ordered': 'Parts Ordered',
    'under_repair': 'Under Repair',
    'painting': 'Painting',
    'quality_check': 'Quality Check',
    'completed': 'Completed'
  };
  return map[status] || status;
};

const formatPaymentStatus = (status) => {
  const map = {
    'pending': 'Pending',
    'paid': 'Paid via Escrow',
    'partial': 'Partially Paid',
    'refunded': 'Refunded'
  };
  return map[status] || status;
};

const Modal = ({ open, onClose, children, footer }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">{children}</div>
        <div className="px-6 pb-6 flex justify-end gap-3 border-t border-gray-200 pt-4 flex-shrink-0">
          {footer}
        </div>
      </div>
    </div>
  );
};

const ConfirmModal = ({ open, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel' }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-3">{title}</h3>
          <p className="text-gray-600">{message}</p>
        </div>
        <div className="px-6 pb-6 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            className="px-5 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const OrderManagementPage = () => {
  const { status } = useParams();
  const statusMap = { 'in-progress': 'in_progress', 'completed': 'completed', 'pending': 'pending' };
  const currentStatus = status ? statusMap[status] : ''; // Don't default to 'pending', allow empty to show all
  
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [assignOpen, setAssignOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Orders state
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;
  
  // Garages state for assign modal
  const [garages, setGarages] = useState([]);
  const [selectedGarage, setSelectedGarage] = useState(null);
  const [assigning, setAssigning] = useState(false);
  const [completing, setCompleting] = useState(false);

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching orders with params:', { page, limit, search, status: currentStatus });
      const data = await apiService.getOrders({
        page,
        limit,
        search,
        status: currentStatus
      });
      console.log('Orders response:', data);
      setOrders(data.orders || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [page, search, currentStatus]);

  // Fetch active garages when assign modal opens
  const fetchActiveGarages = useCallback(async () => {
    try {
      const data = await apiService.getActiveGarages();
      setGarages(data.garages || []);
    } catch (err) {
      console.error('Error fetching garages:', err);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (assignOpen) {
      fetchActiveGarages();
    }
  }, [assignOpen, fetchActiveGarages]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [currentStatus, search]);

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const openAssign = (order) => { 
    setActiveOrder(order); 
    setSelectedGarage(order.garageId);
    setAssignOpen(true); 
  };

  const handleAssignGarage = async () => {
    if (!selectedGarage || !activeOrder) return;
    
    try {
      setAssigning(true);
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const adminId = userData.id;
      
      await apiService.assignGarage(activeOrder.id, selectedGarage, adminId);
      setAssignOpen(false);
      setSelectedGarage(null);
      setActiveOrder(null);
      fetchOrders(); // Refresh list
    } catch (err) {
      console.error('Error assigning garage:', err);
      alert(err.message || 'Failed to assign garage');
    } finally {
      setAssigning(false);
    }
  };

  const handleCompleteOrder = (order) => {
    setActiveOrder(order);
    setConfirmOpen(true);
  };

  const confirmCompleteOrder = async () => {
    if (!activeOrder) return;
    
    try {
      setCompleting(true);
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const adminId = userData.id;
      
      // Call API to update order status to completed
      await apiService.assignGarage(activeOrder.id, activeOrder.garageId, adminId, 'completed');
      setConfirmOpen(false);
      setActiveOrder(null);
      fetchOrders(); // Refresh list
    } catch (err) {
      console.error('Error completing order:', err);
      alert(err.message || 'Failed to complete order');
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>

      {/* Search */}
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search by User & Garage name"
          className="w-full sm:w-[420px] px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyPress={handleSearchKeyPress}
        />
        <button 
          onClick={handleSearch}
          className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-2 rounded-md shadow-sm"
        >
          Search
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <span className="ml-3 text-gray-600">Loading orders...</span>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Orders list */}
      {!loading && !error && (
        <div className="flex gap-6">
          <div className="flex-1 space-y-4">
            {orders.map(order => (
              <OrderCard key={order.id} order={order} onAssign={openAssign} onComplete={handleCompleteOrder} />
            ))}
            {orders.length === 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-lg font-medium text-gray-900 mb-2">No orders found</p>
                <p className="text-sm text-gray-500">
                  {search ? 'Try adjusting your search criteria' : 'Orders will appear here once customers book services'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && orders.length > 0 && (
        <div className="flex items-center justify-between pt-2">
          <div className="text-sm text-gray-600">
            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} orders
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-gray-700">
              Page {page} of {totalPages}
            </span>
            <button
              className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Assign / Change Garage Modal */}
      <Modal open={assignOpen} onClose={() => { setAssignOpen(false); setSelectedGarage(null); }}
        footer={
          <>
            <button 
              onClick={() => { setAssignOpen(false); setSelectedGarage(null); }} 
              className="px-5 py-2 rounded-md border border-gray-300"
              disabled={assigning}
            >
              Cancel
            </button>
            <button 
              onClick={handleAssignGarage} 
              className="px-5 py-2 rounded-md bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50"
              disabled={!selectedGarage || assigning}
            >
              {assigning ? 'Assigning...' : 'Assign Garage'}
            </button>
          </>
        }>
        <h2 className="text-2xl font-semibold mb-2">Assign / Change Garage</h2>
        <div className="text-sm text-gray-600 mb-4">Order ID: {activeOrder?.orderNumber}</div>
        <div className="text-sm font-medium mb-4">Current Garage: {activeOrder?.garageName}</div>
        
        {garages.length === 0 && (
          <div className="text-sm text-gray-500 py-4">Loading garages...</div>
        )}
        
        <div className="space-y-3 pb-2">
          {garages.map(garage => (
            <div 
              key={garage.id} 
              onClick={() => setSelectedGarage(garage.id)}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedGarage === garage.id 
                  ? 'border-orange-500 bg-orange-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium">{garage.name}</div>
              <div className="text-sm text-gray-600">{garage.location}</div>
              <div className="mt-1 text-sm text-gray-700">★ {garage.rating}</div>
            </div>
          ))}
        </div>
        
        {garages.length > 10 && (
          <div className="mt-4 text-sm text-gray-500 text-center">
            Showing first 10 garages
          </div>
        )}
      </Modal>

      {/* Confirm Complete Modal */}
      <ConfirmModal
        open={confirmOpen}
        onClose={() => { setConfirmOpen(false); setActiveOrder(null); }}
        onConfirm={confirmCompleteOrder}
        title="Mark as Completed"
        message={`Are you sure you want to mark order ${activeOrder?.orderNumber} as completed?`}
        confirmText={completing ? 'Completing...' : 'Mark as Completed'}
        cancelText="Cancel"
      />
    </div>
  );
};

export default OrderManagementPage;
