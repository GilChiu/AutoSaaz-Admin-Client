import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';

const DisputeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [disputeData, setDisputeData] = useState(null);
  
  // Modal states
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  
  // Form states
  const [evidenceMessage, setEvidenceMessage] = useState('');
  const [resolveMessage, setResolveMessage] = useState('');
  const [resolveNotes, setResolveNotes] = useState('');
  const [escalateReason, setEscalateReason] = useState('');
  const [escalateMessage, setEscalateMessage] = useState('');
  
  // Message input state
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchDisputeDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchDisputeDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getDisputeDetail(id);
      setDisputeData(data);
    } catch (err) {
      console.error('Error fetching dispute details:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestEvidence = async () => {
    if (!evidenceMessage.trim()) {
      alert('Please enter a message to send with the evidence request');
      return;
    }

    try {
      setActionLoading(true);
      const userData = localStorage.getItem('userData');
      const adminId = userData ? JSON.parse(userData).id : null;
      
      await apiService.requestEvidence(id, evidenceMessage, adminId);
      setShowEvidenceModal(false);
      setEvidenceMessage('');
      await fetchDisputeDetail();
    } catch (err) {
      console.error('Error requesting evidence:', err);
      alert('Failed to request evidence: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolveCase = async () => {
    if (!resolveMessage.trim()) {
      alert('Please enter a resolution message');
      return;
    }

    try {
      setActionLoading(true);
      const userData = localStorage.getItem('userData');
      const adminId = userData ? JSON.parse(userData).id : null;
      
      await apiService.resolveCase(id, resolveMessage, resolveNotes, adminId);
      setShowResolveModal(false);
      setResolveMessage('');
      setResolveNotes('');
      await fetchDisputeDetail();
    } catch (err) {
      console.error('Error resolving case:', err);
      alert('Failed to resolve case: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      alert('Please enter a message');
      return;
    }

    try {
      setSendingMessage(true);
      const userData = localStorage.getItem('userData');
      const adminId = userData ? JSON.parse(userData).id : null;
      
      await apiService.addDisputeMessage(id, newMessage, 'admin', adminId);
      setNewMessage('');
      await fetchDisputeDetail();
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message: ' + err.message);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleEscalateCase = async () => {
    if (!escalateReason.trim()) {
      alert('Please provide a reason for escalation');
      return;
    }

    try {
      setActionLoading(true);
      const userData = localStorage.getItem('userData');
      const adminId = userData ? JSON.parse(userData).id : null;
      
      await apiService.escalateCase(id, escalateReason, escalateMessage, adminId);
      setShowEscalateModal(false);
      setEscalateReason('');
      setEscalateMessage('');
      await fetchDisputeDetail();
    } catch (err) {
      console.error('Error escalating case:', err);
      alert('Failed to escalate case: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'open': 'bg-yellow-100 text-yellow-700',
      'under_review': 'bg-blue-100 text-blue-700',
      'pending': 'bg-yellow-100 text-yellow-700',
      'in_progress': 'bg-blue-100 text-blue-700',
      'resolved': 'bg-green-100 text-green-700',
      'closed': 'bg-gray-100 text-gray-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
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

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Disputes & Revisions</h1>
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-500">
          Loading case details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Disputes & Revisions</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
        <button 
          onClick={() => navigate('/disputes')}
          className="text-orange-500 hover:text-orange-600 font-medium"
        >
          ← Back to Cases
        </button>
      </div>
    );
  }

  if (!disputeData) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Disputes & Revisions</h1>
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-500">
          Case not found
        </div>
      </div>
    );
  }

  const { dispute, user, garage, conversation } = disputeData;
  const canTakeAction = dispute.status !== 'resolved' && dispute.status !== 'closed';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Disputes & Revisions</h1>
        <button 
          onClick={() => navigate('/disputes')}
          className="text-orange-500 hover:text-orange-600 font-medium"
        >
          ← Back to Cases
        </button>
      </div>

      {/* Case Details Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-bold text-gray-900">Case #{dispute.code}</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(dispute.status)}`}>
                {formatStatus(dispute.status)}
              </span>
              {dispute.type && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                  {dispute.type.charAt(0).toUpperCase() + dispute.type.slice(1)}
                </span>
              )}
            </div>
            <h3 className="text-lg text-gray-700">{dispute.subject}</h3>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Submitted</p>
            <p className="text-gray-900">{formatDate(dispute.created_at)}</p>
          </div>
          {dispute.resolved_at && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Resolved</p>
              <p className="text-gray-900">{formatDate(dispute.resolved_at)}</p>
            </div>
          )}
        </div>

        {dispute.evidence_requested && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-700 font-medium">
              Evidence Requested on {formatDate(dispute.evidence_requested_at)}
            </p>
          </div>
        )}

        {dispute.escalated && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-orange-700 font-medium">
              Case Escalated: {dispute.escalation_reason}
            </p>
          </div>
        )}

        {dispute.resolution_notes && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-green-700 font-medium mb-1">Resolution Notes:</p>
            <p className="text-sm text-green-700">{dispute.resolution_notes}</p>
          </div>
        )}

        <div>
          <p className="text-sm text-gray-500 mb-2">Description</p>
          <p className="text-gray-900">{dispute.message || 'No description provided.'}</p>
        </div>
      </div>

      {/* Conversation Thread */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Conversation</h3>
        <div className="space-y-4 mb-6">
          {conversation && conversation.length > 0 ? (
            conversation.map((msg, idx) => (
              <div key={idx} className="border-l-4 border-gray-200 pl-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-900">
                    {msg.senderType || 'User'}
                  </span>
                  <span className="text-xs text-gray-500">{formatDate(msg.createdAt)}</span>
                </div>
                <p className="text-gray-700 text-sm">{msg.body}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No messages yet.</p>
          )}
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type your message
          </label>
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="w-full border border-gray-300 rounded-md p-3 text-sm resize-none"
            rows="3"
          />
          <div className="flex justify-end mt-3">
            <button
              onClick={handleSendMessage}
              disabled={sendingMessage || !newMessage.trim()}
              className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {sendingMessage ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar - Parties & Quick Actions */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          {/* Placeholder for additional details if needed */}
        </div>
        <div className="space-y-4">
          {/* Parties */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-bold text-gray-900 mb-3">Parties</h4>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Customer</p>
                <p className="text-sm font-medium text-gray-900">{user?.name || 'N/A'}</p>
                <p className="text-xs text-gray-500">{user?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Garage</p>
                <p className="text-sm font-medium text-gray-900">{garage?.name || 'N/A'}</p>
                <p className="text-xs text-gray-500">{garage?.email || ''}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-bold text-gray-900 mb-3">Quick Actions</h4>
            <div className="space-y-2">
              <button 
                onClick={() => setShowEvidenceModal(true)}
                disabled={!canTakeAction}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
              >
                Request Evidence
              </button>
              <button 
                onClick={() => setShowResolveModal(true)}
                disabled={!canTakeAction}
                className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
              >
                Resolve Case
              </button>
              <button 
                onClick={() => setShowEscalateModal(true)}
                disabled={!canTakeAction}
                className="w-full px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
              >
                Escalate
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Request Evidence Modal */}
      {showEvidenceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Request Evidence</h3>
            <p className="text-sm text-gray-600 mb-4">
              Send a message to the garage requesting additional documentation or evidence.
            </p>
            <textarea
              value={evidenceMessage}
              onChange={(e) => setEvidenceMessage(e.target.value)}
              placeholder="Describe what evidence is needed..."
              className="w-full border border-gray-300 rounded p-3 text-sm mb-4 h-32 resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={handleRequestEvidence}
                disabled={actionLoading || !evidenceMessage.trim()}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {actionLoading ? 'Sending...' : 'Send Request'}
              </button>
              <button
                onClick={() => {
                  setShowEvidenceModal(false);
                  setEvidenceMessage('');
                }}
                disabled={actionLoading}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition disabled:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Case Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Resolve Case</h3>
            <p className="text-sm text-gray-600 mb-4">
              Mark this case as resolved and provide a resolution message to the user.
            </p>
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message to User <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={resolveMessage}
                  onChange={(e) => setResolveMessage(e.target.value)}
                  placeholder="Explain the resolution to the user..."
                  className="w-full border border-gray-300 rounded p-3 text-sm h-24 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Internal Notes (Optional)
                </label>
                <textarea
                  value={resolveNotes}
                  onChange={(e) => setResolveNotes(e.target.value)}
                  placeholder="Internal notes for admin reference..."
                  className="w-full border border-gray-300 rounded p-3 text-sm h-20 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleResolveCase}
                disabled={actionLoading || !resolveMessage.trim()}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {actionLoading ? 'Resolving...' : 'Resolve Case'}
              </button>
              <button
                onClick={() => {
                  setShowResolveModal(false);
                  setResolveMessage('');
                  setResolveNotes('');
                }}
                disabled={actionLoading}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition disabled:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Escalate Modal */}
      {showEscalateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Escalate Case</h3>
            <p className="text-sm text-gray-600 mb-4">
              Escalate this case to urgent priority for management review.
            </p>
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Escalation Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={escalateReason}
                  onChange={(e) => setEscalateReason(e.target.value)}
                  placeholder="Why does this case need to be escalated?"
                  className="w-full border border-gray-300 rounded p-3 text-sm h-24 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message (Optional)
                </label>
                <textarea
                  value={escalateMessage}
                  onChange={(e) => setEscalateMessage(e.target.value)}
                  placeholder="Additional message to add to conversation..."
                  className="w-full border border-gray-300 rounded p-3 text-sm h-20 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleEscalateCase}
                disabled={actionLoading || !escalateReason.trim()}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {actionLoading ? 'Escalating...' : 'Escalate Case'}
              </button>
              <button
                onClick={() => {
                  setShowEscalateModal(false);
                  setEscalateReason('');
                  setEscalateMessage('');
                }}
                disabled={actionLoading}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition disabled:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisputeDetailPage;