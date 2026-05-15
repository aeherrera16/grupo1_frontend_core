import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCustomer, searchCustomer } from '../../api/customerApi';
// import { getCustomerSubtypes } from '../../api/customerApi'; // No implementado en backend aún
import { getAllBranches } from '../../api/branchApi';
import { getAccountsByCustomer } from '../../api/accountApi';
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

  const [legalRepType, setLegalRepType] = useState('CEDULA');
  const [legalRepNumber, setLegalRepNumber] = useState('');
  const [selectedRepresentative, setSelectedRepresentative] = useState(null);
  const [searchingRep, setSearchingRep] = useState(false);
  const [searchErrorRep, setSearchErrorRep] = useState('');

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
        // getCustomerSubtypes no implementado en backend aún
        // const subtypesResponse = await getCustomerSubtypes();
        // setSubtypes(subtypesResponse.data || []);

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

  const handleSearchRepresentative = async () => {
    if (!legalRepNumber.trim()) {
      setSearchErrorRep('Ingrese un número de identificación');
      return;
    }

    setSearchingRep(true);
    setSearchErrorRep('');
    setSelectedRepresentative(null);

    try {
      const customer = await searchCustomer(legalRepType, legalRepNumber);

      // Validar que sea Persona Natural
      if (customer.data.type !== 'NATURAL') {
        setSearchErrorRep('El representante legal debe ser una Persona Natural');
        setSelectedRepresentative(null);
        return;
      }

      // Validar que tenga al menos una cuenta
      const accountsResponse = await getAccountsByCustomer(customer.data.id);
      const accounts = accountsResponse.data || [];

      if (accounts.length === 0) {
        setSearchErrorRep('El representante legal debe tener al menos una cuenta activa en el sistema');
        setSelectedRepresentative(null);
        return;
      }

      setSelectedRepresentative({
        ...customer.data,
        accountCount: accounts.length
      });
      setFormData(prev => ({ ...prev, legalRepresentativeId: customer.data.id.toString() }));
      setSearchErrorRep('');
    } catch (err) {
      let errorMessage = 'Error al buscar representante';
      if (err.response?.status === 404) {
        errorMessage = `No se encontró persona natural con ${legalRepType.toLowerCase()}: ${legalRepNumber}`;
      } else if (err.response?.status === 400) {
        errorMessage = err.response?.data?.message || 'Datos inválidos';
      } else if (!err.response) {
        errorMessage = 'No se puede conectar al servidor';
      } else {
        errorMessage = err.response?.data?.message || errorMessage;
      }
      setSearchErrorRep(errorMessage);
      setSelectedRepresentative(null);
    } finally {
      setSearchingRep(false);
    }
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
      // Si se intenta guardar con representante legal, debe estar validado
      if (legalRepNumber.trim() && !selectedRepresentative) {
        setError('El representante legal debe ser validado correctamente. Busque una Persona Natural con al menos una cuenta activa');
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
      let errorMessage = 'Error al crear cliente';

      if (err.response?.status === 400) {
        errorMessage = err.response?.data?.message || 'Los datos ingresados no son válidos. Verifique que la identificación sea única';
      } else if (err.response?.status === 409) {
        errorMessage = 'Este cliente ya existe en el sistema';
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
      <h1 className="text-3xl font-bold mb-6">Crear Nuevo Cliente</h1>

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
            </div>

            {/* Búsqueda de Representante Legal */}
            <hr className="my-4" />
            <h3 className="font-bold mb-4">Representante Legal (Opcional)</h3>

            {!selectedRepresentative && (
              <div className="mb-4">
                <p className="text-gray-600 text-sm mb-3">Búsque una Persona Natural con al menos una cuenta activa</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Tipo de Identificación</label>
                    <select
                      value={legalRepType}
                      onChange={(e) => setLegalRepType(e.target.value)}
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
                      value={legalRepNumber}
                      onChange={(e) => setLegalRepNumber(e.target.value)}
                      placeholder="Ingrese el número"
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSearchRepresentative}
                  disabled={searchingRep}
                  className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {searchingRep ? 'Buscando...' : 'Buscar Representante'}
                </button>
              </div>
            )}

            {searchErrorRep && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-4">
                <p className="font-semibold text-red-800 text-sm">❌ {searchErrorRep}</p>
              </div>
            )}

            {selectedRepresentative && (
              <div className="bg-white border-2 border-green-300 p-4 rounded mb-4">
                <h4 className="font-bold text-green-700 mb-3">✅ Representante Validado</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-gray-600 text-sm">Nombre</p>
                    <p className="font-semibold">{selectedRepresentative.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Identificación</p>
                    <p className="font-semibold">{selectedRepresentative.identification}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Tipo</p>
                    <p className="font-semibold">{selectedRepresentative.type}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Cuentas Activas</p>
                    <p className="font-semibold text-green-600">{selectedRepresentative.accountCount}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRepresentative(null);
                    setLegalRepNumber('');
                    setSearchErrorRep('');
                    setFormData(prev => ({ ...prev, legalRepresentativeId: '' }));
                  }}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm"
                >
                  Cambiar Representante
                </button>
              </div>
            )}
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
