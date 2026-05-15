import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createAccount, getAccountsByCustomer } from '../../api/accountApi';
import { searchCustomer, getCustomer } from '../../api/customerApi';
import { getAllBranches } from '../../api/branchApi';
import { validateCurrency } from '../../helpers/validators';
import { ACCOUNT_TYPES } from '../../constants/accountTypes';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const ACCOUNT_MINIMUMS = { 1: 10, 2: 100, 3: 0 };

export const AccountCreatePage = () => {
  console.log('🔥 AccountCreatePage cargado con cambios nuevos v2');
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
  const [customerAccounts, setCustomerAccounts] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const [formData, setFormData] = useState({
    customerId: '',
    accountSubtypeId: 1,
    branchId: '',
    initialBalance: '',
    isFavorite: false
  });

  // Si viene un customerId en los parámetros de búsqueda, precargar cliente
  useEffect(() => {
    if (!prefilledCustomerId) return;

    const prefillCustomer = async () => {
      setSearching(true);
      try {
        const customerResp = await getCustomer(prefilledCustomerId);
        const customerData = customerResp.data;
        setSelectedCustomer(customerData);
        setFormData(prev => ({ ...prev, customerId: customerData.id }));

        // Cargar cuentas del cliente
        try {
          const accountsResp = await getAccountsByCustomer(customerData.id);
          setCustomerAccounts(accountsResp.data || []);
        } catch {
          setCustomerAccounts([]);
        }
      } catch {
        // Silenciosamente ignorar error si no se puede cargar
      } finally {
        setSearching(false);
      }
    };

    prefillCustomer();
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
    setCustomerAccounts([]);
    try {
      const response = await searchCustomer(identificationType, identificationNumber);
      const customerData = response.data;
      setSelectedCustomer(customerData);
      setFormData(prev => ({ ...prev, customerId: customerData.id }));
      setSearchError('');

      // Cargar cuentas del cliente para validar duplicados
      try {
        const accountsResp = await getAccountsByCustomer(customerData.id);
        setCustomerAccounts(accountsResp.data || []);
      } catch {
        setCustomerAccounts([]);
      }
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

    // Validación KYC
    if (selectedCustomer.status !== 'APROBADO') {
      setError('El cliente debe tener estado KYC aprobado para crear una cuenta');
      return false;
    }

    if (!formData.branchId) {
      setError('Seleccione una sucursal');
      return false;
    }

    // Validación de cuenta duplicada
    const accountSubtypeId = parseInt(formData.accountSubtypeId);
    const existingAccount = customerAccounts.find(
      acc => parseInt(acc.accountSubtypeId) === accountSubtypeId
    );
    if (existingAccount) {
      setError('El cliente ya tiene una cuenta de este tipo. No es posible crear más de una cuenta del mismo tipo.');
      return false;
    }

    // Validación de monto mínimo
    const minAmount = ACCOUNT_MINIMUMS[accountSubtypeId] ?? 0;
    if (!formData.initialBalance) {
      setError(`El monto inicial es requerido. Mínimo: $${minAmount} USD`);
      return false;
    }

    const amount = parseFloat(formData.initialBalance);
    if (isNaN(amount) || !validateCurrency(formData.initialBalance)) {
      setError('Saldo inicial inválido');
      return false;
    }

    if (amount < minAmount) {
      setError(`El monto inicial mínimo para este tipo de cuenta es $${minAmount} USD`);
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
        <>
          <div className={`border p-6 rounded-lg shadow mb-6 ${
            selectedCustomer.status === 'APROBADO'
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}>
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
              <div>
                <p className="text-gray-600 text-sm">Estado KYC</p>
                <p className={`font-semibold ${
                  selectedCustomer.status === 'APROBADO'
                    ? 'text-green-700'
                    : 'text-red-700'
                }`}>
                  {selectedCustomer.status}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedCustomer(null);
                setIdentificationNumber('');
                setSearchError('');
                setCustomerAccounts([]);
              }}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Cambiar Cliente
            </button>
          </div>

          {selectedCustomer.status !== 'APROBADO' && (
            <div className="bg-red-50 border-l-4 border-red-600 p-5 rounded-lg mb-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔒</span>
                <div>
                  <p className="font-bold text-red-800">KYC no aprobado</p>
                  <p className="text-red-700 text-sm mt-1">
                    El cliente debe tener estado KYC "APROBADO" para abrir una cuenta.
                    Por favor, completa el proceso de KYC antes de continuar.
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {!selectedCustomer && (
        <div className="bg-blue-50 border border-blue-300 p-4 rounded-lg mb-6">
          <p className="text-blue-800">👆 Busque y seleccione un cliente arriba para continuar</p>
        </div>
      )}

      {selectedCustomer && selectedCustomer.status === 'APROBADO' && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
          {/* Cliente ya seleccionado */}
          <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-gray-600">Cliente seleccionado: <span className="font-semibold">{selectedCustomer.name || selectedCustomer.businessName}</span></p>
          </div>

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
            <label className="block text-sm font-medium mb-2">Moneda</label>
            <input
              type="text"
              value="USD"
              readOnly
              className="w-full p-2 border rounded bg-gray-100 text-gray-600 cursor-not-allowed"
            />
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
            <label className="block text-sm font-medium mb-2">Saldo Inicial *</label>
            <input
              type="number"
              name="initialBalance"
              value={formData.initialBalance}
              onChange={handleInputChange}
              placeholder="0.00"
              step="0.01"
              min={ACCOUNT_MINIMUMS[parseInt(formData.accountSubtypeId)] ?? 0}
              className="w-full p-2 border rounded"
              required
            />
            <p className="text-gray-600 text-sm mt-1">
              Monto mínimo: ${ACCOUNT_MINIMUMS[parseInt(formData.accountSubtypeId)] ?? 0} USD
            </p>
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
      )}
    </div>
  );
};

export default AccountCreatePage;
