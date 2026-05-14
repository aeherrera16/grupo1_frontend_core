import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTransactionHistory } from '../../api/transactionApi';
import { formatCurrency, formatDateTime } from '../../helpers/formatters';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export const TransactionHistoryPage = () => {
  const { accountNumber } = useParams();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({
    type: '',
    status: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await getTransactionHistory(accountNumber);
        setTransactions(response.data || []);
        setFilteredTransactions(response.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Error al cargar historial');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [accountNumber]);

  useEffect(() => {
    applyFilters();
  }, [filters, transactions]);

  const applyFilters = () => {
    let filtered = transactions;

    if (filters.type) {
      filtered = filtered.filter(t => t.type === filters.type);
    }

    if (filters.status) {
      filtered = filtered.filter(t => t.status === filters.status);
    }

    if (filters.startDate) {
      filtered = filtered.filter(t => new Date(t.date) >= new Date(filters.startDate));
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(t => new Date(t.date) <= endDate);
    }

    setFilteredTransactions(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      type: '',
      status: '',
      startDate: '',
      endDate: ''
    });
  };

  if (loading) return <LoadingSpinner fullPage={true} />;

  return (
    <div className="max-w-6xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-600 hover:text-blue-800"
      >
        ← Volver
      </button>

      <h1 className="text-3xl font-bold mb-6">Historial de Transacciones</h1>
      <p className="text-gray-600 mb-6">Cuenta: {accountNumber}</p>

      {error && (
        <div className="bg-red-100 text-red-800 p-4 rounded mb-6">
          {error}
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="font-bold mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Tipo de Movimiento</label>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
            >
              <option value="">Todos</option>
              <option value="DEBITO">Débito</option>
              <option value="CREDITO">Crédito</option>
              <option value="TRANSFERENCIA">Transferencia</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Estado</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
            >
              <option value="">Todos</option>
              <option value="COMPLETADA">Completada</option>
              <option value="RECHAZADA">Rechazada</option>
              <option value="PENDIENTE">Pendiente</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Desde</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Hasta</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
        <button
          onClick={handleClearFilters}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          Limpiar filtros
        </button>
      </div>

      {/* Tabla de Transacciones */}
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-600 mb-4">
          Total: {filteredTransactions.length} transacción(es)
        </p>

        {filteredTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="p-3">Fecha/Hora</th>
                  <th className="p-3">Tipo</th>
                  <th className="p-3">Monto</th>
                  <th className="p-3">Saldo Resultante</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3">Descripción</th>
                  <th className="p-3">ID Transacción</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-sm">{formatDateTime(transaction.date)}</td>
                    <td className="p-3">
                      <span className={`font-semibold ${
                        transaction.type === 'DEBITO' ? 'text-red-600' :
                        transaction.type === 'CREDITO' ? 'text-green-600' :
                        'text-blue-600'
                      }`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="p-3 font-semibold">{formatCurrency(transaction.amount)}</td>
                    <td className="p-3">{formatCurrency(transaction.resultingBalance)}</td>
                    <td className="p-3">
                      <StatusBadge status={transaction.status} />
                    </td>
                    <td className="p-3 text-gray-600">{transaction.description}</td>
                    <td className="p-3 text-xs text-gray-500 break-all">{transaction.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600 py-8 text-center">
            No hay transacciones que coincidan con los filtros
          </p>
        )}
      </div>
    </div>
  );
};

export default TransactionHistoryPage;
