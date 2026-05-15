import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

export function DashboardPage() {
  const auth = useAuth() || {};
  const { user = {} } = auth;

  const modules = [
    {
      title: 'Buscar Clientes',
      description: 'Búsqueda de clientes por identificación',
      path: '/clientes',
      icon: '👥'
    },
    {
      title: 'Nueva Transacción',
      description: 'Realizar débito, crédito o transferencia',
      path: '/transacciones/nueva',
      icon: '💸'
    },
    {
      title: 'Gestionar Sucursales',
      description: 'Ver y crear sucursales',
      path: '/sucursales',
      icon: '🏢'
    },
    {
      title: 'Nueva Cuenta',
      description: 'Crear nueva cuenta de cliente',
      path: '/cuentas/nueva',
      icon: '🏦'
    },
    {
      title: 'Feriados',
      description: 'Gestionar calendario de feriados',
      path: '/feriados',
      icon: '📅'
    },
    {
      title: 'Notificaciones',
      description: 'Ver tus notificaciones',
      path: '/notificaciones',
      icon: '🔔'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">
          Bienvenido, {user?.name || 'Operario'}
        </h1>
        <p className="page-description">
          Panel de control de la Intranet Banquito
        </p>
      </div>

      {/* Grid de módulos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <Link
            key={module.path}
            to={module.path}
            className="module-card"
          >
            <div className="module-card-icon">{module.icon}</div>
            <h3 className="module-card-title">{module.title}</h3>
            <p className="module-card-description">{module.description}</p>
          </Link>
        ))}
      </div>

      {/* Información del Usuario - Stats */}
      <div className="dashboard-card">
        <h2 className="text-xl font-bold text-gray-900 mb-6" style={{ color: '#001f3f' }}>
          Información del Usuario
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="stat-box">
            <p className="stat-box-label">Usuario</p>
            <p className="stat-box-value">{user?.username || '-'}</p>
          </div>
          <div className="stat-box">
            <p className="stat-box-label">Rol</p>
            <p className="stat-box-value">{user?.role || 'OPERARIO'}</p>
          </div>
          <div className="stat-box">
            <p className="stat-box-label">Estado</p>
            <p className="stat-box-value" style={{ color: '#10b981' }}>
              {user?.status || 'ACTIVO'}
            </p>
          </div>
        </div>
      </div>

      {/* Alert informativo */}
      <div className="alert alert-info">
        <strong>ℹ️ Bienvenido a la Intranet Bancaria</strong><br/>
        Esta plataforma permite gestionar clientes, cuentas, transacciones y más. Utiliza los módulos del menú lateral para acceder a las diferentes funcionalidades.
      </div>
    </div>
  );
}

export default DashboardPage;
