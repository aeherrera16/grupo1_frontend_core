import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchCustomer } from '../../api/customerApi';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const ID_TYPES = [
  { value: 'CEDULA', label: 'Cédula' },
  { value: 'PASAPORTE', label: 'Pasaporte' },
  { value: 'RUC', label: 'RUC' },
];

export const CustomerListPage = () => {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [idType, setIdType] = useState('CEDULA');
  const [identification, setIdentification] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!identification.trim()) return;
    setLoading(true);
    setError('');
    setCustomer(null);
    setSearched(true);
    try {
      const response = await searchCustomer(idType, identification.trim());
      setCustomer(response.data || null);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('No se encontró ningún cliente con esa identificación.');
      } else if (!err.response) {
        setError('No se puede conectar al servidor.');
      } else {
        setError(err.response?.data?.message || 'Error al buscar el cliente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getCustomerName = (c) =>
    c?.fullName ||
    (c?.firstName ? `${c.firstName} ${c.lastName || ''}`.trim() : null) ||
    c?.businessName ||
    c?.name || '—';

  return (
    <div className="max-w-4xl mx-auto relative">
      <h1 className="text-3xl font-bold mb-6">Gestionar Clientes</h1>

      {/* Formulario de búsqueda */}
      <form onSubmit={handleSearch} className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-2">Tipo de identificación</label>
            <select
              value={idType}
              onChange={(e) => setIdType(e.target.value)}
              className="w-full p-2 border rounded"
            >
              {ID_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Número de identificación</label>
            <input
              type="text"
              value={identification}
              onChange={(e) => setIdentification(e.target.value)}
              placeholder="Ej: 1712345678"
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading || !identification.trim()}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-semibold disabled:opacity-50 transition"
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      </form>

      {loading && <LoadingSpinner />}

      {error && (
        <div className="bg-gradient-to-br from-orange-50 to-red-50 border-l-4 border-orange-500 p-4 rounded-lg mb-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-semibold text-gray-900">Error</p>
              <p className="text-gray-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Resultado */}
      {customer && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Resultado</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="p-3">Identificación</th>
                  <th className="p-3">Nombre / Razón Social</th>
                  <th className="p-3">Tipo</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Teléfono</th>
                  <th className="p-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-3 font-semibold">{customer.identification}</td>
                  <td className="p-3">{getCustomerName(customer)}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      (customer.customerType || customer.type) === 'NATURAL'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {(customer.customerType || customer.type) === 'NATURAL' ? 'Persona Natural' : 'Empresa'}
                    </span>
                  </td>
                  <td className="p-3 text-gray-600">{customer.email || '—'}</td>
                  <td className="p-3 text-gray-600">{customer.phone || '—'}</td>
                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() => navigate(`/clientes/${customer.id}`)}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-xs font-semibold"
                    >
                      Ver
                    </button>
                    <button
                      onClick={() => navigate(`/cuentas/nueva?customerId=${customer.id}`)}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-xs font-semibold"
                    >
                      Nueva Cuenta
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && searched && !customer && !error && (
        <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
          No se encontró ningún cliente.
        </div>
      )}

      {!searched && (
        <div className="bg-white p-8 rounded-lg shadow text-center text-gray-400">
          Ingresa un número de identificación para buscar un cliente.
        </div>
      )}

      {/* Botón flotante para crear nuevo cliente */}
      <button
        onClick={() => navigate('/clientes/nuevo')}
        className="fixed bottom-8 right-8 bg-blue-600 text-white rounded-full p-4 hover:bg-blue-700 shadow-lg hover:shadow-xl transition"
        title="Crear nuevo cliente"
      >
        <span className="text-3xl">+</span>
      </button>
    </div>
  );
};

export default CustomerListPage;
