import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getUnreadCount } from '../../api/notificationApi';

const Topbar = ({ title = 'Dashboard' }) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user?.coreUserId) {
      getUnreadCount(user.coreUserId)
        .then(response => setUnreadCount(response.data || 0))
        .catch(() => setUnreadCount(0));
    }
  }, [user?.coreUserId]);

  return (
    <header className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
      <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
      <div className="flex items-center gap-4">
        <Link
          to="/notificaciones"
          className="relative p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <span className="text-2xl">🔔</span>
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
};

export default Topbar;
