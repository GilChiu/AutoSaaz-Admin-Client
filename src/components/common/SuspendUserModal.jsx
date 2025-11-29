import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

/**
 * Suspend User Modal Component
 * Professional modal for suspending users with reason input
 */
const SuspendUserModal = ({
  isOpen,
  onClose,
  onConfirm,
  userName,
  isLoading = false,
}) => {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    const finalReason = reason || 'Suspended by admin';
    console.log('🚀 [SuspendUserModal] Confirm button clicked, calling onConfirm with reason:', finalReason);
    onConfirm(finalReason);
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full animate-fadeIn">
        <div className="p-6">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <AlertTriangle className="text-orange-500" size={48} />
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
            Suspend User
          </h3>

          {/* Message */}
          <p className="text-gray-600 text-center mb-4">
            Are you sure you want to suspend <strong>{userName}</strong>?
          </p>

          {/* Reason Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Suspension Reason
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for suspension (optional)"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              This will be recorded in the audit log
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Suspending...' : 'Suspend User'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuspendUserModal;
