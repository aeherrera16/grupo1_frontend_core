import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createAccount } from '../../api/accountApi';
import { searchCustomer, getCustomer } from '../../api/customerApi';
import { getAllBranches } from '../../api/branchApi';
import { validateCurrency } from '../../helpers/validators';
import { ACCOUNT_TYPES } from '../../constants/accountTypes';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export const AccountCreatePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefilledCustomerId = searchParams.get('customerId');

  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [identificationType, setIdentificationType] = useState('CEDULA');
  const [identificationNumber, setIdentificationNumber] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const [formData, setFormData] = useState({
    customerId: '',
    accountSubtypeId: 1,
    branchId: '',
    initialBalance: '',
    isFavorite: false
  });

  // Si viene un customerId en los parámetros de búsqueda, cargarlo
  useEffect(() => {
    if (prefilledCustomerId) {
      setFormData(prev => ({ ...prev, customerId: prefilledCustomerId }));
    }
  }, [prefilledCustomerId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const branchesResponse = await getAllBranches();
        setBranches(branchesResponse.data || []);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar datos del formulario');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!identificationNumber.trim()) {
      setSearchError('Ingrese un número de identificación');
      return;
    }

    setSearching(true);
    setSearchError('');
    setSelectedCustomer(null);
    try {
      const response = await searchCustomer(identificationType, identificationNumber);
      setSelectedCustomer(response.data);
      setFormData(prev => ({ ...prev, customerId: response.data.id }));
      setSearchError('');
    } catch (err) {
      let errorMessage = 'Error al buscar cliente';
      if (err.response?.status === 404) {
        errorMessage = `No se encontró cliente con ${identificationType.toLowerCase()}: ${identificationNumber}`;
      } else if (err.response?.status === 400) {
        errorMessage = err.response?.data?.message || 'Datos inválidos';
      } else if (!err.response) {
        errorMessage = 'No se puede conectar al servidor';
      } else {
        errorMessage = err.response?.data?.message || errorMessage;
      }
      setSearchError(errorMessage);
      setSelectedCustomer(null);
    } finally {
      setSearching(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    if (!selectedCustomer || !formData.customerId) {
      setError('Debe buscar y seleccionar un cliente');
      return false;
    }

    if (!formData.branchId) {
      setError('Seleccione una sucursal');
      return false;
    }

    if (formData.initialBalance && !validateCurrency(formData.initialBalance)) {
      setError('Saldo inicial inválido');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload = {
        customerId: parseInt(formData.customerId),
        accountSubtypeId: parseInt(formData.accountSubtypeId),
        branchId: parseInt(formData.branchId),
        initialBalance: formData.initialBalance ? parseFloat(formData.initialBalance) : 0,
        isFavorite: formData.isFavorite
      };

      const response = await createAccount(payload);
      navigate(`/cuentas/${response.data.accountNumber}`);
    } catch (err) {
      let errorMessage = 'Error al crear cuenta';

      if (err.response?.status === 400) {
        errorMessage = err.response?.data?.message || 'Los datos ingresados no son válidos';
      } else if (err.response?.status === 404) {
        errorMessage = 'Cliente o sucursal no encontrado';
      } else if (err.response?.status === 500) {
        errorMessage = 'Error en el servidor. Intente más tarde';
      } else if (!err.response) {
        errorMessage = 'No se puede conectar al servidor';
      } else {
        errorMessage = err.response?.data?.message || errorMessage;
      }

      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage={true} />;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Crear Nueva Cuenta</h1>

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

      {/* Sección de búsqueda de cliente */}
      {!selectedCustomer && (
        <form onSubmit={handleSearch} className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-bold mb-4">Seleccionar Cliente</h2>
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
            disabled={searching}
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {searching ? 'Buscando...' : 'Buscar Cliente'}
          </button>
        </form>
      )}

      {searchError && (
        <div className="bg-gradient-to-br from-orange-50 to-red-50 border-l-4 border-orange-500 p-4 rounded-lg mb-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-semibold text-gray-900">Error en búsqueda</p>
              <p className="text-gray-700 text-sm mt-1">{searchError}</p>
            </div>
          </div>
        </div>
      )}

      {selectedCustomer && (
        <div className="bg-green-50 border border-green-200 p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-bold mb-4">Cliente Seleccionado</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-gray-600 text-sm">Nombre</p>
              <p className="font-semibold">{selectedCustomer.name || selectedCustomer.businessName}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Tipo</p>
              <p className="font-semibold">{selectedCustomer.type}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Identificación</p>
              <p className="font-semibold">{selectedCustomer.identification}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Email</p>
              <p className="font-semibold">{selectedCustomer.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedCustomer(null);
              setIdentificationNumber('');
              setSearchError('');
            }}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Cambiar Cliente
          </button>
        </div>
      )}

      {!selectedCustomer && (
        <div className="bg-blue-50 border border-blue-300 p-4 rounded-lg mb-6">
          <p className="text-blue-800">👆 Busque y seleccione un cliente arriba para continuar</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow" style={{ opacity: selectedCustomer ? 1 : 0.6, pointerEvents: selectedCustomer ? 'auto' : 'none' }}>
        {/* Cliente ya seleccionado */}
        {selectedCustomer && (
          <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-gray-600">Cliente seleccionado: <span className="font-semibold">{selectedCustomer.name || selectedCustomer.businessName}</span></p>
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Tipo de Cuenta *</label>
          <select
            name="accountSubtypeId"
            value={formData.accountSubtypeId}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          >
            {ACCOUNT_TYPES.map(at => (
              <option key={at.id} value={at.id}>{at.name}</option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Sucursal *</label>
          <select
            name="branchId"
            value={formData.branchId}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Seleccionar...</option>
            {branches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Saldo Inicial</label>
          <input
            type="number"
            name="initialBalance"
            value={formData.initialBalance}
            onChange={handleInputChange}
            placeholder="0.00"
            step="0.01"
            min="0"
            className="w-full p-2 border rounded"
          />
          <p className="text-gray-600 text-sm mt-1">Monto inicial en la cuenta (opcional)</p>
        </div>

        <div className="mb-6 flex items-center">
          <input
            type="checkbox"
            id="isFavorite"
            name="isFavorite"
            checked={formData.isFavorite}
            onChange={handleInputChange}
            className="mr-3"
          />
          <label htmlFor="isFavorite" className="text-sm">Marcar como cuenta favorita</label>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {submitting ? 'Creando...' : 'Crear Cuenta'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 bg-gray-600 text-white p-2 rounded hover:bg-gray-700"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default AccountCreatePage;
