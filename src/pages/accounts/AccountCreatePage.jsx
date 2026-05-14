import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createAccount } from '../../api/accountApi';
import { getCustomer } from '../../api/customerApi';
import { getAllBranches } from '../../api/branchApi';
import { validateCurrency } from '../../helpers/validators';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const ACCOUNT_TYPES = [
  { id: 'AHORROS', name: 'Cuenta de Ahorros' },
  { id: 'CORRIENTE', name: 'Cuenta Corriente' },
  { id: 'DEPOSITO', name: 'Depósito a Plazo' }
];

export const AccountCreatePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefilledCustomerId = searchParams.get('customerId');

  const [customers, setCustomers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    customerId: prefilledCustomerId || '',
    accountType: 'AHORROS',
    branchId: '',
    initialBalance: '',
    isFavorite: false
  });

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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    if (!formData.customerId) {
      setError('Seleccione un cliente');
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
        accountType: formData.accountType,
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
        <div className="bg-red-100 text-red-800 p-4 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Cliente *</label>
          <input
            type="text"
            placeholder="ID del cliente"
            value={formData.customerId}
            onChange={(e) => setFormData(prev => ({ ...prev, customerId: e.target.value }))}
            className="w-full p-2 border rounded"
            required
          />
          <p className="text-gray-600 text-sm mt-1">
            {prefilledCustomerId && 'Cliente pre-seleccionado desde búsqueda'}
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Tipo de Cuenta *</label>
          <select
            name="accountType"
            value={formData.accountType}
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
