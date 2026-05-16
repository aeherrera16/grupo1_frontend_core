import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAccount, activateAccount, inactivateAccount, blockAccount, suspendAccount } from '../../api/accountApi';
import { getTransactionHistory } from '../../api/transactionApi';
import { formatCurrency, formatDate, formatDateTime, formatStatus } from '../../helpers/formatters';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { useConfirm } from '../../hooks/useConfirm';

export const AccountDetailPage = () => {
  const { accountNumber } = useParams();
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [historyError, setHistoryError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  const { confirm, modalProps } = useConfirm();

  const fetchAccount = async () => {
    setHistoryError(null);
    try {
      const accountResponse = await getAccount(accountNumber);
      setAccount(accountResponse.data);

      try {
        const transactionsResponse = await getTransactionHistory(accountNumber);
        setTransactions((transactionsResponse.data || []).slice(0, 10));
      } catch (txErr) {
        if (import.meta.env.DEV) {
          console.warn('No se pudo cargar el historial de transacciones:', txErr);
        }
        setTransactions([]);
        setHistoryError('No se pudo cargar el historial. Intente más tarde.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar cuenta');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccount();
  }, [accountNumber]);

  const handleStatusChange = async (action, apiCall, successMessage) => {
    const confirmed = await confirm({
      title: 'Confirmar acción',
      message: `¿Estás seguro de ${action} esta cuenta?`,
    });
    if (!confirmed) return;

    setActionLoading(true);
    setActionMessage(null);
    try {
      await apiCall(accountNumber);
      await fetchAccount();
      setActionMessage({ type: 'success', text: successMessage });
    } catch (err) {
      const status = err.response?.status;
      let text;
      if (status === 403) {
        text = `No tienes permiso para ${action} cuentas. El backend ha rechazado la petición (403). Contacta al administrador del sistema.`;
      } else if (status === 404) {
        text = 'Cuenta no encontrada.';
      } else {
        text = `Error al ${action}: ${err.response?.data?.message || err.message}`;
      }
      setActionMessage({ type: 'error', text });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage={true} />;

  if (error) {
    return (
      <div className="bg-red-100 text-red-800 p-4 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-600 hover:text-blue-800"
      >
        ← Volver
      </button>

      {account && (
        <>
          {/* Header */}
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{accountNumber}</h1>
                <p className="text-gray-600">{account.customerFullName}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate(`/cuentas/${accountNumber}/disponibilidad`)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Ver Disponibilidad
                </button>
                <StatusBadge status={account.status} />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-gray-600 text-sm">Tipo de Cuenta</p>
                <p className="font-semibold">{account.accountSubtypeDescription}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Sucursal</p>
                <p className="font-semibold">{account.branchName}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Saldo Contable</p>
                <p className="font-semibold text-lg">{formatCurrency(account.accountingBalance)}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Saldo Disponible</p>
                <p className="font-semibold text-lg">{formatCurrency(account.availableBalance)}</p>
              </div>
            </div>
          </div>

          {/* Botones de Cambio de Estado */}
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h3 className="font-bold mb-4">Cambiar Estado</h3>

            {actionMessage && (
              <div
                className={`p-3 rounded mb-4 text-sm ${
                  actionMessage.type === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {actionMessage.text}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleStatusChange('activar', activateAccount, 'Cuenta activada correctamente')}
                disabled={account.status === 'ACTIVA' || actionLoading}
                className="bg-green-800 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Activar
              </button>
              <button
                onClick={() => handleStatusChange('inactivar', inactivateAccount, 'Cuenta inactivada correctamente')}
                disabled={account.status === 'INACTIVO' || actionLoading}
                className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Inactivar
              </button>
              <button
                onClick={() => handleStatusChange('bloquear', blockAccount, 'Cuenta bloqueada correctamente')}
                disabled={account.status === 'BLOQUEADO' || actionLoading}
                className="bg-red-900 text-white px-4 py-2 rounded hover:bg-red-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Bloquear
              </button>
              <button
                onClick={() => handleStatusChange('suspender', suspendAccount, 'Cuenta suspendida correctamente')}
                disabled={account.status === 'SUSPENDIDO' || actionLoading}
                className="bg-red-900 text-white px-4 py-2 rounded hover:bg-red-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Suspender
              </button>
            </div>
          </div>

          {/* Transacciones Recientes */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Últimas Transacciones</h2>
              <button
                onClick={() => navigate(`/transacciones/historial/${accountNumber}`)}
                className="text-blue-600 hover:text-blue-800"
              >
                Ver Historial Completo →
              </button>
            </div>

            {historyError ? (
              <p className="text-red-600 py-4 text-center">{historyError}</p>
            ) : transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="p-3">Fecha</th>
                      <th className="p-3">Tipo</th>
                      <th className="p-3">Monto</th>
                      <th className="p-3">Saldo</th>
                      <th className="p-3">Estado</th>
                      <th className="p-3">Descripción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="p-3">{formatDateTime(tx.date)}</td>
                        <td className="p-3">
                          <span className={tx.type === 'DEBITO' ? 'text-red-600' : 'text-green-600'}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="p-3">{formatCurrency(tx.amount)}</td>
                        <td className="p-3">{formatCurrency(tx.resultingBalance)}</td>
                        <td className="p-3">
                          <StatusBadge status={tx.status} />
                        </td>
                        <td className="p-3 text-gray-600">{tx.message || tx.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-600 py-4">No hay transacciones recientes</p>
            )}
          </div>
        </>
      )}

      <ConfirmModal {...modalProps} confirmText="Sí, confirmar" />
    </div>
  );
};

export default AccountDetailPage;
