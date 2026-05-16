import { useState, useEffect } from 'react';
import { Info, AlertTriangle, Lock } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createAccount, getAccountsByCustomer } from '../../api/accountApi';
import { getCustomer } from '../../api/customerApi';
import { getAllBranches } from '../../api/branchApi';
import { validateCurrency } from '../../helpers/validators';
import { ACCOUNT_TYPES } from '../../constants/accountTypes';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { CustomerSelector } from '../../components/common/CustomerSelector';
import BackButton from '../../components/ui/BackButton';
const ACCOUNT_MINIMUMS = { 1: 10, 2: 100, 3: 0 };

function formatCustomerType(type) {
  if (type === 'NATURAL') return 'Persona Natural';
  if (type === 'JURIDICO') return 'Persona Jurídica';
  return type || '';
}

function buildCustomerName(customer) {
  return (
    customer.fullName ||
    (customer.firstName
      ? `${customer.firstName} ${customer.lastName || ''}`.trim()
      : null) ||
    customer.legalName ||
    customer.businessName ||
    customer.name ||
    ''
  );
}

export const AccountCreatePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefilledCustomerId = searchParams.get('customerId');

  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [branchError, setBranchError] = useState('');

  const [customerSelectorValue, setCustomerSelectorValue] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerAccounts, setCustomerAccounts] = useState([]);
  const [customerLoading, setCustomerLoading] = useState(false);

  const [formData, setFormData] = useState({
    customerId: '',
    accountSubtypeId: '1',
    branchId: '',
    initialBalance: '',
    isFavorite: false,
  });

  // Prefetch customer when ?customerId=X is present in URL
  useEffect(() => {
    if (!prefilledCustomerId) return;

    const prefillCustomer = async () => {
      setCustomerLoading(true);
      try {
        const resp = await getCustomer(prefilledCustomerId);
        const customerData = resp.data;
        setSelectedCustomer(customerData);

        const name = buildCustomerName(customerData);
        const identification =
          customerData.identificationNumber || customerData.identification || '';
        setCustomerSelectorValue({ id: customerData.id, name, identification });
        setFormData((prev) => ({ ...prev, customerId: customerData.id }));

        try {
          const accountsResp = await getAccountsByCustomer(customerData.id);
          setCustomerAccounts(accountsResp.data || []);
        } catch {
          setCustomerAccounts([]);
        }
      } catch {
        // silent — user can still search manually
      } finally {
        setCustomerLoading(false);
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
      } catch {
        setError('Error al cargar datos del formulario');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCustomerChange = async (customerInfo) => {
    setError('');
    if (!customerInfo) {
      setCustomerSelectorValue(null);
      setSelectedCustomer(null);
      setCustomerAccounts([]);
      setFormData((prev) => ({ ...prev, customerId: '' }));
      return;
    }

    setCustomerSelectorValue(customerInfo);
    setFormData((prev) => ({ ...prev, customerId: customerInfo.id }));
    setCustomerLoading(true);

    try {
      const resp = await getCustomer(customerInfo.id);
      const customerData = resp.data;
      setSelectedCustomer(customerData);

      try {
        const accountsResp = await getAccountsByCustomer(customerData.id);
        setCustomerAccounts(accountsResp.data || []);
      } catch {
        setCustomerAccounts([]);
      }
    } catch {
      setSelectedCustomer(null);
    } finally {
      setCustomerLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'branchId') setBranchError('');
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const validateForm = () => {
    if (!selectedCustomer || !formData.customerId) {
      setError('Debe buscar y seleccionar un cliente');
      return false;
    }

    const kycAprobado =
      selectedCustomer.status === 'APROBADO' ||
      selectedCustomer.status === 'ACTIVO';
    if (!kycAprobado) {
      setError('Este cliente no está habilitado para abrir cuentas. Completa el proceso de verificación antes de continuar.');
      return false;
    }

    if (!formData.branchId) {
      setBranchError('Seleccione una sucursal');
      return false;
    }

    const accountSubtypeId = parseInt(formData.accountSubtypeId);
    const existingAccount = customerAccounts.find(
      (acc) => parseInt(acc.accountSubtypeId) === accountSubtypeId,
    );
    if (existingAccount) {
      setError(
        'El cliente ya tiene una cuenta de este tipo. No es posible crear más de una cuenta del mismo tipo.',
      );
      return false;
    }

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
      setError(
        `El monto inicial mínimo para este tipo de cuenta es $${minAmount} USD`,
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBranchError('');

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload = {
        customerId: parseInt(formData.customerId),
        accountSubtypeId: parseInt(formData.accountSubtypeId),
        branchId: parseInt(formData.branchId),
        initialBalance: formData.initialBalance
          ? parseFloat(formData.initialBalance)
          : 0,
        isFavorite: formData.isFavorite,
      };

      const response = await createAccount(payload);
      navigate(`/cuentas/${response.data.accountNumber}`);
    } catch (err) {
      let errorMessage = 'Error al crear cuenta';

      if (err.response?.status === 400) {
        errorMessage =
          err.response?.data?.message || 'Los datos ingresados no son válidos';
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

  const customerName = selectedCustomer ? buildCustomerName(selectedCustomer) : '';
  const kycAprobado =
    selectedCustomer &&
    (selectedCustomer.status === 'APROBADO' ||
      selectedCustomer.status === 'ACTIVO');

  return (
    <div className="max-w-2xl mx-auto">
      <BackButton to={prefilledCustomerId ? `/clientes/${prefilledCustomerId}` : '/clientes'} />
      <h1 className="text-3xl font-bold mb-6">Crear Nueva Cuenta</h1>

      {error && (
        <div className="bg-gradient-to-br from-orange-50 to-red-50 border-l-4 border-orange-500 p-4 rounded-lg mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} strokeWidth={1.5} color="#ea580c" />
            <div>
              <p className="font-semibold text-gray-900">Error</p>
              <p className="text-gray-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Customer Selector */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-bold mb-4">Seleccionar Cliente</h2>
        {customerLoading ? (
          <LoadingSpinner />
        ) : (
          <CustomerSelector
            value={customerSelectorValue}
            onChange={handleCustomerChange}
          />
        )}
      </div>

      {selectedCustomer && (
        <>
          <div
            className={`border p-6 rounded-lg shadow mb-6 ${
              kycAprobado
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <h2 className="text-lg font-bold mb-4">Cliente Seleccionado</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-gray-600 text-sm">Nombre</p>
                <p className="font-semibold">{customerName}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Tipo</p>
                <p className="font-semibold">{formatCustomerType(selectedCustomer.type || selectedCustomer.customerType || selectedCustomer.typeEntity || customerSelectorValue?.type)}</p>
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
                <p className="text-gray-600 text-sm">Estado</p>
                <p
                  className={`font-semibold ${
                    kycAprobado ? 'text-green-700' : 'text-red-700'
                  }`}
                >
                  {kycAprobado ? 'Habilitado para creación de cuenta' : 'No habilitado para creación de cuenta'}
                </p>
              </div>
            </div>
          </div>

          {!kycAprobado && (
            <div className="bg-red-50 border-l-4 border-red-600 p-5 rounded-lg mb-6">
              <div className="flex items-start gap-3">
                <Lock size={20} strokeWidth={1.5} color="#dc2626" />
                <div>
                  <p className="font-bold text-red-800">Cliente no habilitado</p>
                  <p className="text-red-700 text-sm mt-1">
                    Este cliente no está habilitado para abrir cuentas. Verifica
                    que esté habilitado y completa el proceso de verificación
                    antes de continuar.
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {!customerSelectorValue && !customerLoading && (
        <div className="bg-blue-50 border border-blue-300 p-4 rounded-lg mb-6 flex items-center gap-3">
          <Info size={18} strokeWidth={1.5} color="#1d4ed8" />
          <p className="text-blue-800">
            Busque y seleccione un cliente arriba para continuar
          </p>
        </div>
      )}

      {selectedCustomer && kycAprobado && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
          <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-gray-600">
              Cliente seleccionado:{' '}
              <span className="font-semibold">{customerName}</span>
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Tipo: {formatCustomerType(selectedCustomer.type || customerSelectorValue?.type)}
            </p>
            <p className={`text-xs mt-0.5 ${kycAprobado ? 'text-green-700' : 'text-red-600'}`}>
              {kycAprobado ? 'Habilitado para creación de cuenta' : 'No habilitado para creación de cuenta'}
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Tipo de Cuenta *
            </label>
            <select
              name="accountSubtypeId"
              value={formData.accountSubtypeId}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            >
              {ACCOUNT_TYPES.map((at) => (
                <option key={at.id} value={at.id}>
                  {at.name}
                </option>
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
              className={`w-full p-2 border rounded ${branchError ? 'border-red-500' : ''}`}
              required
            >
              <option value="">Seleccione una sucursal</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            {branchError && (
              <p className="text-red-600 text-sm mt-1">{branchError}</p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Saldo Inicial *
            </label>
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
              Monto mínimo: $
              {ACCOUNT_MINIMUMS[parseInt(formData.accountSubtypeId)] ?? 0} USD
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
            <label htmlFor="isFavorite" className="text-sm">
              Marcar como cuenta favorita
            </label>
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
