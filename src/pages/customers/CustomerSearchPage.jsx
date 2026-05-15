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

  const hasSearched = searchResult !== null || error !== '';

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Búsqueda de Clientes</h1>
          <p className="text-sm text-slate-500 mt-0.5">Localice un cliente por tipo y número de identificación</p>
        </div>
        <button
          onClick={() => navigate('/clientes/nuevo')}
          className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 font-medium text-sm transition-colors"
        >
          + Nuevo Cliente
        </button>
      </div>

      {/* Search Card */}
      <div className="bg-white rounded-xl shadow-md border border-slate-100 p-8 mb-6">
        <form onSubmit={handleSearch}>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            {/* Tipo de Identificación */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Tipo de Identificación
              </label>
              <select
                value={identificationType}
                onChange={(e) => setIdentificationType(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                <option value="CEDULA">Cédula</option>
                <option value="RUC">RUC</option>
                <option value="PASAPORTE">Pasaporte</option>
              </select>
            </div>

            {/* Número */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Número de Identificación
              </label>
              <input
                type="text"
                value={identificationNumber}
                onChange={(e) => setIdentificationNumber(e.target.value)}
                placeholder="Ej. 1234567890"
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            {/* Botón Buscar */}
            <div className="flex-1 md:flex-none md:w-40">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-2.5 bg-blue-700 text-white text-sm font-semibold rounded-lg hover:bg-blue-800 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Área de resultados — solo visible tras una búsqueda */}
      {hasSearched && (
        <div>
          {error && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 mb-4 flex items-start gap-3">
              <svg className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-orange-800">Sin resultados</p>
                <p className="text-sm text-orange-700 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {loading && <LoadingSpinner fullPage={false} size="lg" />}

          {searchResult && (
            <div className="bg-white rounded-xl shadow-md border border-slate-100 p-8">
              <h2 className="text-base font-bold text-slate-700 uppercase tracking-wide mb-5">
                Resultado de la búsqueda
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4 mb-6">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Nombre</p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">
                    {searchResult.fullName ||
                      (searchResult.firstName ? `${searchResult.firstName} ${searchResult.lastName || ''}`.trim() : null) ||
                      searchResult.businessName ||
                      searchResult.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Tipo de Cliente</p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">
                    {searchResult.customerType === 'NATURAL' || searchResult.type === 'NATURAL' ? 'Persona Natural' :
                     searchResult.customerType === 'JURIDICO' || searchResult.type === 'JURIDICO' ? 'Persona Jurídica' :
                     searchResult.customerType || searchResult.type}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Estado KYC</p>
                  <span className={`inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    searchResult.status === 'APROBADO' || searchResult.status === 'ACTIVO'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {searchResult.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Email</p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">{searchResult.email}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Teléfono</p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">{searchResult.mobilePhone}</p>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-5 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate(`/clientes/${searchResult.id}`)}
                  className="flex-1 sm:flex-none sm:w-40 px-4 py-2.5 bg-blue-700 text-white text-sm font-semibold rounded-lg hover:bg-blue-800 transition-colors text-center"
                >
                  Ver Detalle
                </button>
                <button
                  onClick={() => navigate(`/cuentas/nueva?customerId=${searchResult.id}`)}
                  disabled={searchResult.status !== 'APROBADO' && searchResult.status !== 'ACTIVO'}
                  className={`flex-1 sm:flex-none sm:w-40 px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors text-center ${
                    searchResult.status === 'APROBADO' || searchResult.status === 'ACTIVO'
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                  title={searchResult.status !== 'APROBADO' && searchResult.status !== 'ACTIVO' ? 'El cliente necesita KYC aprobado para crear cuenta' : ''}
                >
                  Nueva Cuenta
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerSearchPage;
