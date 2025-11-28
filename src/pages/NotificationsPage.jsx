import React, { useState, useEffect } from 'react';
import { formatNotificationTimeGST } from '../utils/gstDateTime';
import { Bell, RefreshCw, Filter, ExternalLink, Ticket, AlertTriangle, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import adminNotificationsService from '../services/adminNotifications.service';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, tickets, disputes, push
  const navigate = useNavigate();

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminNotificationsService.getNotifications({ limit: 100 });
      setNotifications(data.data || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true;
    if (filter === 'tickets') return notif.type === 'ticket';
    if (filter === 'disputes') return notif.type === 'dispute';
    if (filter === 'push') return notif.type === 'push_notification';
    return true;
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case 'ticket':
        return <Ticket className="text-blue-500" size={20} />;
      case 'dispute':
        return <AlertTriangle className="text-orange-500" size={20} />;
      case 'push_notification':
        return <MessageSquare className="text-purple-500" size={20} />;
      default:
        return <Bell className="text-gray-500" size={20} />;
    }
  };

  const formatTimeAgo = (dateString) => {
    return formatNotificationTimeGST(dateString);
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">All Notifications</h2>
          <p className="text-sm text-gray-600 mt-1">
            View all notifications from tickets, disputes, and push notifications
          </p>
        </div>
        <button
          onClick={loadNotifications}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button onClick={loadNotifications} className="text-red-600 underline mt-2">
            Retry
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <Filter size={20} className="text-gray-500" />
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('tickets')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'tickets'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tickets ({notifications.filter(n => n.type === 'ticket').length})
            </button>
            <button
              onClick={() => setFilter('disputes')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'disputes'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Disputes ({notifications.filter(n => n.type === 'dispute').length})
            </button>
            <button
              onClick={() => setFilter('push')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'push'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Push Notifs ({notifications.filter(n => n.type === 'push_notification').length})
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg border border-gray-200">
        {filteredNotifications.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Bell size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No notifications found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => adminNotificationsService.navigateToSource(notification, navigate)}
                className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getTypeIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h4 className="text-sm font-semibold text-gray-900">
                        {notification.title}
                      </h4>
                      <ExternalLink size={16} className="text-gray-400 flex-shrink-0" />
                    </div>

                    <p className="text-sm text-gray-600 mb-3">
                      {notification.message}
                    </p>

                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(notification.created_at)}
                      </span>

                      <span className={`text-xs px-2 py-1 rounded font-medium ${
                        adminNotificationsService.getPriorityBadge(notification.priority)
                      }`}>
                        {notification.priority}
                      </span>

                      <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                        {notification.type.replace('_', ' ')}
                      </span>

                      {notification.metadata && (
                        <>
                          {notification.metadata.ticket_number && (
                            <span className="text-xs text-gray-500">
                              #{notification.metadata.ticket_number}
                            </span>
                          )}
                          {notification.metadata.dispute_number && (
                            <span className="text-xs text-gray-500">
                              #{notification.metadata.dispute_number}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
