import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';

const SupportUserChatPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolving, setResolving] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchTicketDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Polling for new messages (realtime doesn't work with custom JWT auth)
  useEffect(() => {
    if (!id) return;

    let isActive = true;
    let lastMessageCount = ticket?.conversation?.length || 0;
    
    // Poll every 3 seconds for responsive updates
    const pollInterval = setInterval(async () => {
      if (!isActive) return;
      try {
        const updated = await apiService.getSupportTicketDetail(id);
        if (updated && updated.conversation?.length > lastMessageCount) {
          lastMessageCount = updated.conversation.length;
          if (isActive) setTicket(updated);
          
          // Auto-scroll to new message
          setTimeout(() => scrollToBottom(), 100);
        } else if (updated) {
          lastMessageCount = updated.conversation?.length || 0;
          // Update if status changed even without new messages
          if (updated.ticket?.status !== ticket?.ticket?.status && isActive) {
            setTicket(updated);
          }
        }
      } catch (err) {
        // Silent fail for polling
      }
    }, 3000);

    return () => {
      isActive = false;
      clearInterval(pollInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, ticket?.conversation?.length, ticket?.ticket?.status]);

  useEffect(() => {
    scrollToBottom();
  }, [ticket?.conversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchTicketDetail = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await apiService.getSupportTicketDetail(id);
      setTicket(data);
      setError(null);
    } catch (err) {
      if (!silent) {
        setError(err.message);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      setSending(true);
      const userData = localStorage.getItem('userData');
      const admin = userData ? JSON.parse(userData) : null;
      
      await apiService.addSupportTicketMessage(id, admin?.id, message.trim());
      setMessage('');
      await fetchTicketDetail(true);
    } catch (err) {
      alert('Failed to send message: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  const handleResolveTicket = async () => {
    try {
      setResolving(true);
      const userData = localStorage.getItem('userData');
      const admin = userData ? JSON.parse(userData) : null;
      
      await apiService.updateSupportTicketStatus(id, 'resolved', admin?.id, resolutionNotes);
      setShowResolveModal(false);
      setResolutionNotes('');
      await fetchTicketDetail();
    } catch (err) {
      alert('Failed to resolve ticket: ' + err.message);
    } finally {
      setResolving(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Support & Communication</h1>
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-500">
          Loading ticket...
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Support & Communication</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error || 'Ticket not found'}
        </div>
        <button 
          onClick={() => navigate('/support/users')}
          className="text-orange-500 hover:text-orange-600 font-medium"
        >
          ← Back to User Tickets
        </button>
      </div>
    );
  }

  const isResolved = ticket.ticket.status === 'resolved' || ticket.ticket.status === 'closed';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Support & Communication</h1>
        <button 
          onClick={() => navigate('/support/users')}
          className="text-orange-500 hover:text-orange-600 font-medium"
        >
          ← Back to User Tickets
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-sm text-gray-500 mb-1">Ticket #{ticket.ticket.ticketNumber}</div>
            <h2 className="text-xl font-bold text-gray-900">{ticket.ticket.subject}</h2>
            <div className="mt-2 text-sm text-gray-600">
              <span className="font-medium">From:</span> {ticket.sender.name} ({ticket.sender.email})
            </div>
          </div>
          <div className="text-right">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
              ticket.ticket.status === 'open' ? 'bg-yellow-100 text-yellow-700' :
              ticket.ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
              ticket.ticket.status === 'resolved' ? 'bg-green-100 text-green-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {ticket.ticket.status.replace('_', ' ').charAt(0).toUpperCase() + ticket.ticket.status.replace('_', ' ').slice(1)}
            </span>
            {!isResolved && (
              <button
                onClick={() => setShowResolveModal(true)}
                className="mt-2 block ml-auto px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
              >
                Resolve Ticket
              </button>
            )}
          </div>
        </div>

        <div className="border border-gray-200 rounded-md p-4 min-h-[400px] max-h-[500px] overflow-y-auto">
          <div className="space-y-3">
            {ticket.conversation && ticket.conversation.length > 0 ? (
              ticket.conversation.map(msg => (
                <div 
                  key={msg.id} 
                  className={`max-w-[70%] rounded-lg p-3 ${
                    msg.senderType === 'admin' 
                      ? 'bg-gray-100 text-gray-800' 
                      : 'bg-blue-100 text-gray-800 ml-auto'
                  }`}
                >
                  <div className="text-xs text-gray-600 mb-1">
                    <span className="font-medium">{msg.senderName}</span>
                    <span className="ml-2">{formatDate(msg.createdAt)}</span>
                  </div>
                  <div className="text-sm">{msg.body}</div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">No messages yet</div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {!isResolved && (
          <div className="mt-4 flex items-center gap-2">
            <input
              className="flex-1 px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="Type your message to user..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
            />
            <button 
              onClick={handleSendMessage}
              disabled={sending || !message.trim()}
              className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-2 rounded-md disabled:opacity-50"
            >
              {sending ? 'Sending...' : 'Send'}
            </button>
          </div>
        )}

        {isResolved && ticket.ticket.resolutionNotes && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="text-sm font-medium text-green-800 mb-1">Resolution Notes:</div>
            <div className="text-sm text-green-700">{ticket.ticket.resolutionNotes}</div>
          </div>
        )}
      </div>

      {/* Resolve Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Resolve Ticket</h3>
            <p className="text-sm text-gray-600 mb-4">
              Add resolution notes before closing this ticket.
            </p>
            <textarea
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Resolution notes (optional)"
              className="w-full border border-gray-300 rounded p-3 text-sm mb-4 h-32 resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={handleResolveTicket}
                disabled={resolving}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition disabled:opacity-50"
              >
                {resolving ? 'Resolving...' : 'Resolve Ticket'}
              </button>
              <button
                onClick={() => {
                  setShowResolveModal(false);
                  setResolutionNotes('');
                }}
                disabled={resolving}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition disabled:opacity-50"
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

export default SupportUserChatPage;
