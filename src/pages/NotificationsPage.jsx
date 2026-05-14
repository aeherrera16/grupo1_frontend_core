import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getNotifications, markAsRead } from '../api/notificationApi';
import { formatDateTime } from '../helpers/formatters';
import { STATUS_COLORS } from '../constants/statusColors';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export const NotificationsPage = () => {
  const auth = useAuth() || {};
  const { user = {} } = auth;
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, [user?.id, user?.coreUserId]);

  const fetchNotifications = async () => {
    try {
      const userId = user?.id || user?.coreUserId;
      if (!userId) {
        setError('No se pudo obtener el ID del usuario');
        setLoading(false);
        return;
      }

      const response = await getNotifications(userId);
      setNotifications(response.data || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
    } catch (err) {
      console.error('Error al marcar como leído:', err);
    }
  };

  const getNotificationColor = (type) => {
    const colorMap = {
      CREDITO: 'bg-green-100 text-green-800',
      DEBITO: 'bg-red-100 text-red-800',
      SEGURIDAD: 'bg-orange-100 text-orange-800',
      INFO: 'bg-blue-100 text-blue-800'
    };
    return colorMap[type] || 'bg-gray-100 text-gray-800';
  };

  if (loading) return <LoadingSpinner fullPage={true} />;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Notificaciones</h1>

      {error && (
        <div className="bg-red-100 text-red-800 p-4 rounded mb-6">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
              className={`p-4 rounded-lg border-l-4 cursor-pointer transition ${
                notification.isRead
                  ? 'bg-gray-50 border-gray-300'
                  : 'bg-white border-blue-600 hover:bg-blue-50'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3 flex-1">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getNotificationColor(notification.type)}`}>
                    {notification.type}
                  </span>
                  <h3 className="font-bold text-lg">{notification.title}</h3>
                </div>
                {!notification.isRead && (
                  <span className="w-3 h-3 bg-blue-600 rounded-full ml-2 flex-shrink-0"></span>
                )}
              </div>

              <p className="text-gray-700 mb-2">{notification.message}</p>

              <div className="text-sm text-gray-500 flex justify-between items-center">
                <span>{formatDateTime(notification.createdAt)}</span>
                {!notification.isRead && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead(notification.id);
                    }}
                    className="text-blue-600 hover:text-blue-800 text-xs font-semibold"
                  >
                    Marcar como leído
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-8 rounded-lg text-center text-gray-600">
            <p className="text-lg">No hay notificaciones</p>
            <p className="text-sm mt-2">Todas tus notificaciones aparecerán aquí</p>
          </div>
        )}
      </div>

      {/* Resumen */}
      {notifications.length > 0 && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg text-sm text-gray-600">
          <p>
            Total: {notifications.length} notificación(es) |
            No leídas: {notifications.filter(n => !n.isRead).length}
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
