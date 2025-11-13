import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import ConfirmModal from '../components/ConfirmModal';

const SummaryRow = ({ label, value }) => (
  <div className="flex items-center justify-between text-sm py-1">
    <div className="text-gray-600">{label}</div>
    <div className="text-gray-900 font-medium">{value}</div>
  </div>
);

const PaymentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPaymentDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchPaymentDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getPaymentDetail(id);
      setPaymentData(data);
    } catch (err) {
      console.error('Error fetching payment details:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReleasePayment = async () => {
    try {
      setActionLoading(true);
      const userData = localStorage.getItem('userData');
      const adminId = userData ? JSON.parse(userData).id : null;
      
      await apiService.releasePayment(id, adminId);
      setShowReleaseModal(false);
      await fetchPaymentDetail(); // Refresh data
    } catch (err) {
      console.error('Error releasing payment:', err);
      alert('Failed to release payment: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleFlagPayment = async () => {
    if (!flagReason.trim()) {
      alert('Please provide a reason for flagging this payment');
      return;
    }

    try {
      setActionLoading(true);
      const userData = localStorage.getItem('userData');
      const adminId = userData ? JSON.parse(userData).id : null;
      
      await apiService.flagPayment(id, flagReason, adminId);
      setShowFlagModal(false);
      setFlagReason('');
      await fetchPaymentDetail(); // Refresh data
    } catch (err) {
      console.error('Error flagging payment:', err);
      alert('Failed to flag payment: ' + err.message);
    } finally {
      setActionLoading(false);
    }
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
      'completed': 'bg-green-100 text-green-700',
      'pending': 'bg-yellow-100 text-yellow-700',
      'processing': 'bg-blue-100 text-blue-700',
      'failed': 'bg-red-100 text-red-700',
      'flagged': 'bg-red-200 text-red-800',
      'refunded': 'bg-gray-100 text-gray-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Payment Details</h1>
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-500">
          Loading payment details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Payment Details</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
        <button 
          onClick={() => navigate('/payments')}
          className="text-orange-500 hover:text-orange-600 font-medium"
        >
          ← Back to Payments
        </button>
      </div>
    );
  }

  if (!paymentData) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Payment Details</h1>
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-500">
          Payment not found
        </div>
      </div>
    );
  }

  const { transaction, booking, garage, paymentSummary } = paymentData;
  const canRelease = transaction.status === 'pending' && transaction.escrowStatus === 'held';
  const canFlag = transaction.status === 'pending' || transaction.status === 'processing';

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Payment Details</h1>
        <button 
          onClick={() => navigate('/payments')}
          className="text-orange-500 hover:text-orange-600 font-medium"
        >
          ← Back to Payments
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Payment Details card */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Payment Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-gray-500">Transaction Number</div>
                <div className="text-sm text-gray-900 font-medium">{transaction.transactionNumber}</div>

                <div className="mt-3 text-sm text-gray-500">Booking Number</div>
                <div className="text-sm text-gray-900">{booking?.bookingNumber || 'N/A'}</div>

                <div className="mt-3 text-sm text-gray-500">Payment Method</div>
                <div className="text-sm text-gray-900">{transaction.paymentMethod || 'N/A'}</div>

                <div className="mt-3 text-sm text-gray-500">Amount</div>
                <div className="text-sm text-gray-900 font-semibold">{transaction.amount?.toLocaleString() || 0} AED</div>

                <div className="mt-3 text-sm text-gray-500">Net Amount</div>
                <div className="text-sm text-gray-900 font-semibold">{transaction.netAmount?.toLocaleString() || 0} AED</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Service Type</div>
                <div className="text-sm text-gray-900">{booking?.serviceType || 'N/A'}</div>

                <div className="mt-3 text-sm text-gray-500">Transaction Date</div>
                <div className="text-sm text-gray-900">{formatDate(transaction.transactionDate)}</div>

                <div className="mt-3 text-sm text-gray-500">Transaction Fee</div>
                <div className="text-sm text-gray-900">{transaction.transactionFee || 0} AED</div>

                <div className="mt-3 text-sm text-gray-500">Type</div>
                <div className="text-sm text-gray-900">{transaction.type?.replace('_', ' ').toUpperCase() || 'N/A'}</div>

                <div className="mt-3 text-sm text-gray-500">Escrow Status</div>
                <div className="text-sm">
                  {transaction.escrowStatus ? (
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      transaction.escrowStatus === 'held' ? 'bg-yellow-50 text-yellow-700' :
                      transaction.escrowStatus === 'released' ? 'bg-green-50 text-green-700' :
                      'bg-gray-50 text-gray-700'
                    }`}>
                      {transaction.escrowStatus}
                    </span>
                  ) : (
                    <span className="text-gray-500">N/A</span>
                  )}
                </div>
              </div>
            </div>

            {/* Flagged info */}
            {transaction.status === 'flagged' && transaction.flagReason && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="text-sm font-semibold text-red-800">Payment Flagged</div>
                <div className="text-sm text-red-700 mt-1">Reason: {transaction.flagReason}</div>
                {transaction.flaggedAt && (
                  <div className="text-xs text-red-600 mt-1">Flagged on: {formatDate(transaction.flaggedAt)}</div>
                )}
              </div>
            )}

            {/* Released info */}
            {transaction.releasedAt && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="text-sm font-semibold text-green-800">Payment Released</div>
                <div className="text-xs text-green-600 mt-1">Released on: {formatDate(transaction.releasedAt)}</div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <h3 className="font-semibold text-gray-800 mb-3">Customer Information</h3>
              <div className="text-sm text-gray-500">Name</div>
              <div className="text-sm">{booking?.customerName || 'N/A'}</div>
              <div className="mt-3 text-sm text-gray-500">Email</div>
              <div className="text-sm">{booking?.customerEmail || 'N/A'}</div>
              <div className="mt-3 text-sm text-gray-500">Phone</div>
              <div className="text-sm">{booking?.customerPhone || 'N/A'}</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <h3 className="font-semibold text-gray-800 mb-3">Vehicle Information</h3>
              <div className="text-sm text-gray-500">Make & Model</div>
              <div className="text-sm">{booking?.vehicleMake} {booking?.vehicleModel}</div>
              <div className="mt-3 text-sm text-gray-500">Year</div>
              <div className="text-sm">{booking?.vehicleYear || 'N/A'}</div>
              <div className="mt-3 text-sm text-gray-500">Plate Number</div>
              <div className="text-sm">{booking?.registrationNumber || 'N/A'}</div>
            </div>
          </div>

          {/* Garage Info */}
          {garage && (
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <h3 className="font-semibold text-gray-800 mb-3">Garage Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Garage Name</div>
                  <div className="text-sm">{garage.name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Contact</div>
                  <div className="text-sm">{garage.phone || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Email</div>
                  <div className="text-sm">{garage.email || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Location</div>
                  <div className="text-sm">{garage.city}, {garage.state}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right column: Quick Actions + Summary */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Quick Actions</h3>
              <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(transaction.status)}`}>
                {formatStatus(transaction.status)}
              </span>
            </div>
            {!canRelease && !canFlag ? (
              <div className="text-sm text-gray-500">No actions available</div>
            ) : (
              <div className="space-y-2">
                {canRelease && (
                  <button 
                    onClick={() => setShowReleaseModal(true)}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm"
                  >
                    Release Payment
                  </button>
                )}
                {canFlag && (
                  <button 
                    onClick={() => setShowFlagModal(true)}
                    className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm"
                  >
                    Flag Payment
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h3 className="font-semibold text-gray-800 mb-3">Payment Summary</h3>
            <SummaryRow label="Subtotal:" value={`${paymentSummary?.subtotal?.toLocaleString() || 0} AED`} />
            <SummaryRow label="Transaction Fee:" value={`${paymentSummary?.transactionFee || 0} AED`} />
            <div className="border-t border-gray-200 my-2"></div>
            <SummaryRow label="Total Amount:" value={`${paymentSummary?.total?.toLocaleString() || 0} AED`} />
            
            {paymentSummary?.escrowAmount > 0 && (
              <>
                <div className="border-t border-gray-200 my-2"></div>
                <div className="text-xs text-gray-500 mt-3">Escrow Breakdown:</div>
                <SummaryRow label="Escrow Amount:" value={`${paymentSummary.escrowAmount?.toLocaleString()} AED`} />
                <SummaryRow label="Commission:" value={`${paymentSummary.commissionAmount?.toLocaleString() || 0} AED`} />
                <SummaryRow label="Garage Payout:" value={`${paymentSummary.garagePayoutAmount?.toLocaleString() || 0} AED`} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Release Payment Confirmation Modal */}
      <ConfirmModal
        isOpen={showReleaseModal}
        onClose={() => setShowReleaseModal(false)}
        onConfirm={handleReleasePayment}
        title="Release Payment"
        message={`Are you sure you want to release this payment to the garage? The amount of ${transaction.netAmount?.toLocaleString()} AED will be transferred.`}
        confirmText="Release Payment"
        confirmButtonClass="bg-green-600 hover:bg-green-700"
        loading={actionLoading}
      />

      {/* Flag Payment Modal */}
      {showFlagModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Flag Payment</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for flagging this payment:
            </p>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
              rows="4"
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
              placeholder="Enter reason for flagging..."
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowFlagModal(false);
                  setFlagReason('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleFlagPayment}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                disabled={actionLoading}
              >
                {actionLoading ? 'Flagging...' : 'Flag Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentDetailPage;