import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAccountAvailability } from '../../api/accountApi';
import { formatCurrency } from '../../helpers/formatters';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export const AccountAvailabilityPage = () => {
  const { accountNumber } = useParams();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await getAccountAvailability(accountNumber);
        setBalance(response.data || {});
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Error al cargar disponibilidad de saldo');
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, [accountNumber]);

  if (loading) return <LoadingSpinner fullPage={true} />;

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-blue-600 hover:text-blue-800"
        >
          ← Volver
        </button>
        <div className="bg-red-100 text-red-800 p-4 rounded">
          {error}
        </div>
      </div>
    );
  }

  const accountingBalance = Number(balance?.accountingBalance ?? balance?.saldoContable ?? 0);
  const availableBalance = Number(balance?.availableBalance ?? balance?.saldoDisponible ?? 0);
  const blockedAmount = accountingBalance - availableBalance;

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-600 hover:text-blue-800"
      >
        ← Volver
      </button>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Disponibilidad de Saldo</h1>
          <p className="text-gray-600">Cuenta {accountNumber}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-gray-600 text-sm">Saldo Contable</p>
            <p className="font-semibold text-2xl">{formatCurrency(accountingBalance)}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Saldo Disponible</p>
            <p className="font-semibold text-2xl">{formatCurrency(availableBalance)}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Monto Bloqueado</p>
            <p className="font-semibold text-2xl">{formatCurrency(blockedAmount)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountAvailabilityPage;
