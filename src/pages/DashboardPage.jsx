import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import { Users, Repeat, Building2, UserPlus, ArrowRight } from 'lucide-react';

const ICON_COLOR = '#4B5563';

const modules = [
  {
    title: 'Buscar Clientes',
    description: 'Búsqueda de clientes por identificación',
    path: '/clientes',
    Icon: Users,
  },
  {
    title: 'Nueva Transacción',
    description: 'Realizar débito, crédito o transferencia',
    path: '/transacciones/nueva',
    Icon: Repeat,
  },
  {
    title: 'Gestionar Sucursales',
    description: 'Ver y crear sucursales',
    path: '/sucursales',
    Icon: Building2,
  },
  {
    title: 'Nueva Cuenta',
    description: 'Crear nueva cuenta de cliente',
    path: '/cuentas/nueva',
    Icon: UserPlus,
  },
];

export function DashboardPage() {
  const auth = useAuth() || {};
  const { user = {} } = auth;

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
        {modules.map(({ path, title, description, Icon }) => (
          <div key={path} className="module-card">
            <div className="module-card-icon">
              <Icon size={22} strokeWidth={1.5} color={ICON_COLOR} />
            </div>
            <div className="flex-1">
              <h3 className="module-card-title">{title}</h3>
              <p className="module-card-description">{description}</p>
            </div>
            <Link
              to={path}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1E40AF] hover:text-[#001f3f] transition-colors mt-auto"
            >
              Acceder
              <ArrowRight size={14} strokeWidth={2} />
            </Link>
          </div>
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

    </div>
  );
}

export default DashboardPage;
