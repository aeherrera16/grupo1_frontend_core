import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCustomer, getCustomerSubtypes } from '../../api/customerApi';
import { getAllBranches } from '../../api/branchApi';
import { validateEmail, validatePhone, validateIdentification } from '../../helpers/validators';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export const CustomerCreatePage = () => {
  const navigate = useNavigate();
  const [customerType, setCustomerType] = useState('NATURAL');
  const [subtypes, setSubtypes] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    identificationType: 'CEDULA',
    identificationNumber: '',
    subtypeId: '',
    branchId: '',
    email: '',
    phone: '',
    address: '',
    // NATURAL
    firstName: '',
    lastName: '',
    birthDate: '',
    // JURIDICO
    businessName: '',
    incorporationDate: '',
    legalRepresentativeId: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const subtypesResponse = await getCustomerSubtypes();
        setSubtypes(subtypesResponse.data || []);

        const branchesResponse = await getAllBranches();
        setBranches(branchesResponse.data || []);
      } catch (err) {
        setError('Error al cargar datos del formulario');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.identificationNumber) {
      setError('Ingrese el número de identificación');
      return false;
    }

    if (!validateIdentification(formData.identificationType, formData.identificationNumber)) {
      setError('Número de identificación inválido');
      return false;
    }

    if (!formData.email || !validateEmail(formData.email)) {
      setError('Email inválido');
      return false;
    }

    if (!formData.phone || !validatePhone(formData.phone)) {
      setError('Teléfono inválido');
      return false;
    }

    if (customerType === 'NATURAL') {
      if (!formData.firstName || !formData.lastName) {
        setError('Nombre y apellido son requeridos');
        return false;
      }
      if (!formData.birthDate) {
        setError('Fecha de nacimiento es requerida');
        return false;
      }
    } else {
      if (!formData.businessName) {
        setError('Razón social es requerida');
        return false;
      }
      if (!formData.incorporationDate) {
        setError('Fecha de constitución es requerida');
        return false;
      }
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
        type: customerType,
        identificationType: formData.identificationType,
        identification: formData.identificationNumber,
        subtypeId: formData.subtypeId,
        branchId: formData.branchId,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
      };

      if (customerType === 'NATURAL') {
        payload.firstName = formData.firstName;
        payload.lastName = formData.lastName;
        payload.birthDate = formData.birthDate;
      } else {
        payload.businessName = formData.businessName;
        payload.incorporationDate = formData.incorporationDate;
        if (formData.legalRepresentativeId) {
          payload.legalRepresentativeId = formData.legalRepresentativeId;
        }
      }

      const response = await createCustomer(payload);
      navigate(`/clientes/${response.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear cliente');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage={true} />;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Crear Nuevo Cliente</h1>

      {error && (
        <div className="bg-red-100 text-red-800 p-4 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
        {/* Tipo de Cliente */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Tipo de Cliente</label>
          <select
            value={customerType}
            onChange={(e) => setCustomerType(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="NATURAL">Persona Natural</option>
            <option value="JURIDICO">Persona Jurídica</option>
          </select>
        </div>

        {/* Campos Base */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Tipo de Identificación</label>
            <select
              name="identificationType"
              value={formData.identificationType}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            >
              <option value="CEDULA">Cédula</option>
              <option value="RUC">RUC</option>
              <option value="PASAPORTE">Pasaporte</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Número de Identificación</label>
            <input
              type="text"
              name="identificationNumber"
              value={formData.identificationNumber}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Subtipo</label>
            <select
              name="subtypeId"
              value={formData.subtypeId}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Seleccionar...</option>
              {subtypes.map(st => (
                <option key={st.id} value={st.id}>{st.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Sucursal</label>
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
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Teléfono</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Dirección</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Campos Condicionales - NATURAL */}
        {customerType === 'NATURAL' && (
          <div className="mb-6 p-4 bg-blue-50 rounded">
            <h3 className="font-bold mb-4">Datos Personales</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nombre</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Apellido</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Fecha de Nacimiento</label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Campos Condicionales - JURIDICO */}
        {customerType === 'JURIDICO' && (
          <div className="mb-6 p-4 bg-green-50 rounded">
            <h3 className="font-bold mb-4">Datos Empresariales</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Razón Social</label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Fecha de Constitución</label>
                <input
                  type="date"
                  name="incorporationDate"
                  value={formData.incorporationDate}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Representante Legal (Opcional)</label>
                <input
                  type="text"
                  name="legalRepresentativeId"
                  value={formData.legalRepresentativeId}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  placeholder="ID del representante legal"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {submitting ? 'Creando...' : 'Crear Cliente'}
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

export default CustomerCreatePage;
