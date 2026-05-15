import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCustomers } from '../../api/customerApi';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export const CustomerListPage = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await getAllCustomers();
      setCustomers(response.data || []);
      setError('');
    } catch (err) {
      let errorMessage = 'Error al cargar clientes';
      if (err.response?.status === 500) {
        errorMessage = 'Error en el servidor. Intente más tarde';
      } else if (!err.response) {
        errorMessage = 'No se puede conectar al servidor';
      } else {
        errorMessage = err.response?.data?.message || errorMessage;
      }
      setError(errorMessage);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar y buscar en el cliente
  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      const customerTypeVal = customer.customerType || customer.type;
      const typeMatch = filterType === 'ALL' || customerTypeVal === filterType;
      const fullName = customer.fullName ||
        (customer.firstName ? `${customer.firstName} ${customer.lastName || ''}`.trim() : '') ||
        customer.businessName ||
        customer.name || '';
      const searchMatch =
        !searchTerm ||
        fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.identification && customer.identification.includes(searchTerm));
      return typeMatch && searchMatch;
    });
  }, [customers, filterType, searchTerm]);

  if (loading) return <LoadingSpinner fullPage={true} />;

  return (
    <div className="max-w-6xl mx-auto relative">
      <h1 className="text-3xl font-bold mb-6">Gestionar Clientes</h1>

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

      {/* Filtros y búsqueda */}
      <div className="bg-white p-6 rounded-lg shadow mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Filtrar por tipo</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="ALL">Todos</option>
              <option value="NATURAL">Personas Naturales</option>
              <option value="JURIDICO">Personas Jurídicas</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Buscar por nombre o identificación</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nombre, razón social o identificación..."
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      </div>

      {/* Tabla de clientes */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {filteredCustomers.length} {filteredCustomers.length === 1 ? 'Cliente' : 'Clientes'}
          </h2>
        </div>

        {filteredCustomers.length > 0 ? (
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
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-semibold">{customer.identification}</td>
                    <td className="p-3">
                      {customer.fullName ||
                        (customer.firstName ? `${customer.firstName} ${customer.lastName || ''}`.trim() : null) ||
                        customer.businessName ||
                        customer.name}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        (customer.customerType || customer.type) === 'NATURAL'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {(customer.customerType || customer.type) === 'NATURAL' ? 'Persona Natural' : 'Empresa'}
                      </span>
                    </td>
                    <td className="p-3 text-gray-600">{customer.email}</td>
                    <td className="p-3 text-gray-600">{customer.phone}</td>
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
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600 py-8 text-center">
            {customers.length === 0 ? 'No hay clientes registrados' : 'No se encontraron clientes que coincidan con los filtros'}
          </p>
        )}
      </div>

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
