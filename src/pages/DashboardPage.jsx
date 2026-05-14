import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

export function DashboardPage() {
  const auth = useAuth() || {};
  const { user = {} } = auth;

  const quickAccessLinks = [
    {
      title: 'Buscar Clientes',
      description: 'Búsqueda de clientes por identificación',
      path: '/clientes',
      bg: 'from-blue-50 to-blue-100',
      border: 'border-blue-200',
      text: 'text-blue-700'
    },
    {
      title: 'Nueva Transacción',
      description: 'Realizar débito, crédito o transferencia',
      path: '/transacciones/nueva',
      bg: 'from-emerald-50 to-emerald-100',
      border: 'border-emerald-200',
      text: 'text-emerald-700'
    },
    {
      title: 'Gestionar Sucursales',
      description: 'Ver y crear sucursales',
      path: '/sucursales',
      bg: 'from-indigo-50 to-indigo-100',
      border: 'border-indigo-200',
      text: 'text-indigo-700'
    },
    {
      title: 'Nueva Cuenta',
      description: 'Crear nueva cuenta de cliente',
      path: '/cuentas/nueva',
      bg: 'from-amber-50 to-amber-100',
      border: 'border-amber-200',
      text: 'text-amber-700'
    },
    {
      title: 'Feriados',
      description: 'Gestionar calendario de feriados',
      path: '/feriados',
      bg: 'from-orange-50 to-orange-100',
      border: 'border-orange-200',
      text: 'text-orange-700'
    },
    {
      title: 'Notificaciones',
      description: 'Ver tus notificaciones',
      path: '/notificaciones',
      bg: 'from-rose-50 to-rose-100',
      border: 'border-rose-200',
      text: 'text-rose-700'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Bienvenido, {user?.name || 'Operario'}
        </h1>
        <p className="text-gray-600 mt-1">
          Panel de control de la Intranet Banquito
        </p>
      </div>

      {/* Grid de accesos rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickAccessLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`group bg-gradient-to-br ${link.bg} border-2 ${link.border} rounded-xl p-6 cursor-pointer transition duration-200 hover:shadow-md hover:scale-105`}
          >
            <h3 className={`text-lg font-semibold ${link.text} mb-2`}>
              {link.title}
            </h3>
            <p className="text-gray-600 text-sm">
              {link.description}
            </p>
          </Link>
        ))}
      </div>

      {/* Información del Usuario */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Información del Usuario</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
            <p className="text-gray-600 text-sm font-medium">Usuario</p>
            <p className="text-lg font-semibold text-gray-900 mt-2">{user?.username || '-'}</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg border border-indigo-200">
            <p className="text-gray-600 text-sm font-medium">Rol</p>
            <p className="text-lg font-semibold text-gray-900 mt-2">{user?.role || 'OPERARIO'}</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200">
            <p className="text-gray-600 text-sm font-medium">Estado</p>
            <p className="text-lg font-semibold text-gray-900 mt-2">{user?.status || 'ACTIVO'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
