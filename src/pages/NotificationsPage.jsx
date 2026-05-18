import { useState, useEffect, useCallback } from 'react';
import { getNotifications, markNotificationAsRead } from '../services/apiClient';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const TYPE_STYLES = {
  CREDITO:   { dot: 'bg-green-500',  badge: 'bg-green-100 text-green-700' },
  DEBITO:    { dot: 'bg-red-500',    badge: 'bg-red-100 text-red-700' },
  SEGURIDAD: { dot: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700' },
};
const DEFAULT_STYLE = { dot: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700' };

function typeStyle(type) {
  return TYPE_STYLES[type] || DEFAULT_STYLE;
}

export function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [markingId, setMarkingId] = useState(null);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await getNotifications(user.id);
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'No se pudieron cargar las notificaciones.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleOpen = async (n) => {
    setSelected(n);
    if (!n.isUnread) return;
    setMarkingId(n.id);
    try {
      await markNotificationAsRead(n.id);
      setNotifications(prev =>
        prev.map(item => item.id === n.id ? { ...item, isUnread: false } : item)
      );
      setSelected(prev => prev?.id === n.id ? { ...prev, isUnread: false } : prev);
    } catch {
      // not critical
    } finally {
      setMarkingId(null);
    }
  };

  const unread = notifications.filter(n => n.isUnread).length;

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notificaciones</h1>
          {unread > 0 && (
            <p className="text-sm text-gray-500 mt-0.5">{unread} sin leer</p>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-4">
          {error}
        </div>
      )}

      {!error && notifications.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center text-gray-400">
          <p className="text-lg">No hay notificaciones</p>
        </div>
      )}

      <div className="space-y-2">
        {notifications.map(n => {
          const s = typeStyle(n.type);
          return (
            <button
              key={n.id}
              onClick={() => handleOpen(n)}
              className={`w-full text-left bg-white rounded-lg shadow-sm border transition-all hover:shadow-md p-4 flex items-start gap-3 ${
                n.isUnread ? 'border-blue-200' : 'border-gray-100'
              }`}
            >
              <span className={`mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${s.dot} ${!n.isUnread ? 'opacity-30' : ''}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${s.badge}`}>
                    {n.type}
                  </span>
                  <span className="text-[11px] text-gray-400 ml-auto flex-shrink-0">
                    {new Date(n.createdAt).toLocaleString('es-EC')}
                  </span>
                </div>
                <p className={`text-sm truncate ${n.isUnread ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                  {n.title}
                </p>
                <p className="text-xs text-gray-400 truncate mt-0.5">{n.message}</p>
              </div>
              {markingId === n.id && (
                <svg className="animate-spin w-4 h-4 text-blue-400 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              )}
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSelected(null)}
          />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className={`h-1.5 w-full ${typeStyle(selected.type).dot}`} />
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${typeStyle(selected.type).badge}`}>
                    {selected.type}
                  </span>
                  <h2 className="text-xl font-bold text-gray-900 mt-2">{selected.title}</h2>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="text-gray-400 hover:text-gray-700 transition-colors ml-4 flex-shrink-0"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-700 leading-relaxed">{selected.message}</p>
              </div>

              {selected.detail && (
                <div className="mb-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Detalle</p>
                  <p className="text-sm text-gray-600">{selected.detail}</p>
                </div>
              )}

              <div className="flex justify-between items-center text-xs text-gray-400 border-t pt-3">
                <span>ID: #NOT-{selected.id}</span>
                <span>{new Date(selected.createdAt).toLocaleString('es-EC')}</span>
              </div>

              <button
                onClick={() => setSelected(null)}
                className="mt-4 w-full py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationsPage;
