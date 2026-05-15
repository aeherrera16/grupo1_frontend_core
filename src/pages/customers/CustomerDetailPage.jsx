import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCustomer } from '../../api/customerApi';
import { getAccountsByCustomer } from '../../api/accountApi';
import { formatCurrency, formatDate } from '../../helpers/formatters';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export const CustomerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const customerResponse = await getCustomer(id);
        setCustomer(customerResponse.data);

        const accountsResponse = await getAccountsByCustomer(id);
        setAccounts(accountsResponse.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Error al cargar cliente');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <LoadingSpinner fullPage={true} />;

  if (error) {
    return (
      <div className="bg-red-100 text-red-800 p-4 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-600 hover:text-blue-800"
      >
        ← Volver
      </button>

      {customer && (
        <>
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h1 className="text-3xl font-bold mb-4">
              {customer.fullName ||
                (customer.firstName ? `${customer.firstName} ${customer.lastName || ''}`.trim() : null) ||
                customer.businessName ||
                customer.name}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-gray-600 text-sm">Tipo de Cliente</p>
                <p className="font-semibold">
                  {customer.customerType === 'NATURAL' || customer.type === 'NATURAL' ? 'Persona Natural' :
                   customer.customerType === 'JURIDICO' || customer.type === 'JURIDICO' ? 'Persona Jurídica' :
                   customer.customerType || customer.type}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Identificación</p>
                <p className="font-semibold">{customer.identification}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Estado</p>
                <StatusBadge status={customer.status} />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Email</p>
                <p className="font-semibold">{customer.email}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Teléfono</p>
                <p className="font-semibold">{customer.phone}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Dirección</p>
                <p className="font-semibold">{customer.address}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Cuentas</h2>
              <button
                onClick={() => navigate(`/cuentas/nueva?customerId=${id}`)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                + Nueva Cuenta
              </button>
            </div>

            {accounts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="p-3">Número de Cuenta</th>
                      <th className="p-3">Tipo</th>
                      <th className="p-3">Sucursal</th>
                      <th className="p-3">Saldo</th>
                      <th className="p-3">Estado</th>
                      <th className="p-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.map((account) => (
                      <tr key={account.accountNumber} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-semibold">{account.accountNumber}</td>
                        <td className="p-3">{account.accountSubtypeDescription}</td>
                        <td className="p-3">{account.branchName}</td>
                        <td className="p-3">{formatCurrency(account.availableBalance)}</td>
                        <td className="p-3">
                          <StatusBadge status={account.status} />
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => navigate(`/cuentas/${account.accountNumber}`)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Ver
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-600 py-4">No hay cuentas para este cliente</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CustomerDetailPage;
