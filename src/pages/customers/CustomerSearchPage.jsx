import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchCustomer } from '../../api/customerApi';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export const CustomerSearchPage = () => {
  const [identificationType, setIdentificationType] = useState('CEDULA');
  const [identificationNumber, setIdentificationNumber] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!identificationNumber.trim()) {
      setError('Ingrese un número de identificación');
      return;
    }

    setLoading(true);
    setError('');
    setSearchResult(null);
    try {
      const response = await searchCustomer(identificationType, identificationNumber);
      setSearchResult(response.data);
      setError('');
    } catch (err) {
      // Manejo inteligente de errores
      let errorMessage = 'Error al buscar cliente';

      if (err.response?.status === 404) {
        errorMessage = `No se encontró cliente con ${identificationType.toLowerCase()}: ${identificationNumber}`;
      } else if (err.response?.status === 400) {
        errorMessage = err.response?.data?.message || 'Datos inválidos. Verifique el número de identificación';
      } else if (err.response?.status === 500) {
        errorMessage = 'Error en el servidor. Intente más tarde';
      } else if (!err.response) {
        errorMessage = 'No se puede conectar al servidor';
      } else {
        errorMessage = err.response?.data?.message || errorMessage;
      }

      setError(errorMessage);
      setSearchResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Búsqueda de Clientes</h1>

      <form onSubmit={handleSearch} className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Tipo de Identificación</label>
            <select
              value={identificationType}
              onChange={(e) => setIdentificationType(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="CEDULA">Cédula</option>
              <option value="RUC">RUC</option>
              <option value="PASAPORTE">Pasaporte</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Número</label>
            <input
              type="text"
              value={identificationNumber}
              onChange={(e) => setIdentificationNumber(e.target.value)}
              placeholder="Ingrese el número"
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {error && (
        <div className="bg-gradient-to-br from-orange-50 to-red-50 border-l-4 border-orange-500 p-4 rounded-lg mb-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-semibold text-gray-900">Búsqueda sin resultados</p>
              <p className="text-gray-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {loading && <LoadingSpinner fullPage={false} size="lg" />}

      {searchResult && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Resultado de la búsqueda</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-gray-600">Nombre</p>
              <p className="font-semibold">{searchResult.name || searchResult.businessName}</p>
            </div>
            <div>
              <p className="text-gray-600">Tipo</p>
              <p className="font-semibold">{searchResult.type}</p>
            </div>
            <div>
              <p className="text-gray-600">Email</p>
              <p className="font-semibold">{searchResult.email}</p>
            </div>
            <div>
              <p className="text-gray-600">Teléfono</p>
              <p className="font-semibold">{searchResult.phone}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/clientes/${searchResult.id}`)}
              className="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
            >
              Ver Detalle
            </button>
            <button
              onClick={() => navigate(`/cuentas/nueva?customerId=${searchResult.id}`)}
              className="flex-1 bg-green-600 text-white p-2 rounded hover:bg-green-700"
            >
              Nueva Cuenta
            </button>
            <button
              onClick={() => navigate('/clientes/nuevo')}
              className="flex-1 bg-gray-600 text-white p-2 rounded hover:bg-gray-700"
            >
              Nuevo Cliente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerSearchPage;
