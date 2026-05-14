// import { getNotifications, markAsRead } from '../api/notificationApi'; // No implementado en backend aún

export const NotificationsPage = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Notificaciones</h1>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded">
        <p className="text-yellow-800 font-semibold text-lg mb-2">⚠️ Funcionalidad en desarrollo</p>
        <p className="text-yellow-700">Los endpoints de notificaciones aún no están implementados en el backend. Esta funcionalidad estará disponible próximamente.</p>
      </div>
    </div>
  );
};

export default NotificationsPage;
