import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { debit, credit, transfer } from '../../api/transactionApi';
import { validateCurrency } from '../../helpers/validators';
import { formatCurrency } from '../../helpers/formatters';

export const TransactionFormPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('debit');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const [debitForm, setDebitForm] = useState({
    accountNumber: '',
    amount: '',
    description: ''
  });

  const [creditForm, setCreditForm] = useState({
    accountNumber: '',
    amount: '',
    description: ''
  });

  const [transferForm, setTransferForm] = useState({
    sourceAccount: '',
    destinationAccount: '',
    beneficiaryName: '',
    amount: '',
    description: ''
  });

  const validateForm = (form, type) => {
    if (type === 'transfer') {
      if (!form.sourceAccount || !form.destinationAccount) {
        setError('Ingrese cuentas válidas');
        return false;
      }
      if (form.sourceAccount === form.destinationAccount) {
        setError('Las cuentas no pueden ser iguales');
        return false;
      }
    } else {
      if (!form.accountNumber) {
        setError('Ingrese el número de cuenta');
        return false;
      }
    }

    if (!form.amount || !validateCurrency(form.amount)) {
      setError('Monto inválido');
      return false;
    }

    return true;
  };

  const handleDebit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(null);

    if (!validateForm(debitForm, 'debit')) return;

    setLoading(true);
    try {
      const response = await debit({
        accountNumber: debitForm.accountNumber,
        amount: parseFloat(debitForm.amount),
        description: debitForm.description || 'Débito'
      });

      setSuccess({
        message: 'Débito realizado exitosamente',
        transactionId: response.data.transactionId,
        resultingBalance: response.data.resultingBalance
      });

      setDebitForm({ accountNumber: '', amount: '', description: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Error al procesar débito');
    } finally {
      setLoading(false);
    }
  };

  const handleCredit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(null);

    if (!validateForm(creditForm, 'credit')) return;

    setLoading(true);
    try {
      const response = await credit({
        accountNumber: creditForm.accountNumber,
        amount: parseFloat(creditForm.amount),
        description: creditForm.description || 'Crédito'
      });

      setSuccess({
        message: 'Crédito realizado exitosamente',
        transactionId: response.data.transactionId,
        resultingBalance: response.data.resultingBalance
      });

      setCreditForm({ accountNumber: '', amount: '', description: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Error al procesar crédito');
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(null);

    if (!validateForm(transferForm, 'transfer')) return;

    setLoading(true);
    try {
      const response = await transfer({
        sourceAccount: transferForm.sourceAccount,
        destinationAccount: transferForm.destinationAccount,
        beneficiaryName: transferForm.beneficiaryName,
        amount: parseFloat(transferForm.amount),
        description: transferForm.description || 'Transferencia'
      });

      setSuccess({
        message: 'Transferencia realizada exitosamente',
        transactionId: response.data.transactionId,
        resultingBalance: response.data.resultingBalance
      });

      setTransferForm({
        sourceAccount: '',
        destinationAccount: '',
        beneficiaryName: '',
        amount: '',
        description: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Error al procesar transferencia');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Nueva Transacción</h1>

      {error && (
        <div className="bg-red-100 text-red-800 p-4 rounded mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 text-green-800 p-4 rounded mb-6">
          <p className="font-semibold">{success.message}</p>
          <p className="text-sm mt-2">ID Transacción: {success.transactionId}</p>
          <p className="text-sm">Saldo resultante: {formatCurrency(success.resultingBalance)}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('debit')}
            className={`flex-1 p-4 font-semibold ${
              activeTab === 'debit'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Débito
          </button>
          <button
            onClick={() => setActiveTab('credit')}
            className={`flex-1 p-4 font-semibold ${
              activeTab === 'credit'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Crédito
          </button>
          <button
            onClick={() => setActiveTab('transfer')}
            className={`flex-1 p-4 font-semibold ${
              activeTab === 'transfer'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Transferencia
          </button>
        </div>

        <div className="p-6">
          {/* Tab: Débito */}
          {activeTab === 'debit' && (
            <form onSubmit={handleDebit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Número de Cuenta *</label>
                <input
                  type="text"
                  value={debitForm.accountNumber}
                  onChange={(e) => setDebitForm(prev => ({ ...prev, accountNumber: e.target.value }))}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Monto *</label>
                <input
                  type="number"
                  value={debitForm.amount}
                  onChange={(e) => setDebitForm(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Descripción</label>
                <textarea
                  value={debitForm.description}
                  onChange={(e) => setDebitForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 border rounded"
                  rows="3"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 text-white p-2 rounded hover:bg-red-700 disabled:bg-gray-400"
              >
                {loading ? 'Procesando...' : 'Realizar Débito'}
              </button>
            </form>
          )}

          {/* Tab: Crédito */}
          {activeTab === 'credit' && (
            <form onSubmit={handleCredit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Número de Cuenta *</label>
                <input
                  type="text"
                  value={creditForm.accountNumber}
                  onChange={(e) => setCreditForm(prev => ({ ...prev, accountNumber: e.target.value }))}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Monto *</label>
                <input
                  type="number"
                  value={creditForm.amount}
                  onChange={(e) => setCreditForm(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Descripción</label>
                <textarea
                  value={creditForm.description}
                  onChange={(e) => setCreditForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 border rounded"
                  rows="3"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 disabled:bg-gray-400"
              >
                {loading ? 'Procesando...' : 'Realizar Crédito'}
              </button>
            </form>
          )}

          {/* Tab: Transferencia */}
          {activeTab === 'transfer' && (
            <form onSubmit={handleTransfer} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Cuenta Origen *</label>
                  <input
                    type="text"
                    value={transferForm.sourceAccount}
                    onChange={(e) => setTransferForm(prev => ({ ...prev, sourceAccount: e.target.value }))}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Cuenta Destino *</label>
                  <input
                    type="text"
                    value={transferForm.destinationAccount}
                    onChange={(e) => setTransferForm(prev => ({ ...prev, destinationAccount: e.target.value }))}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Nombre del Beneficiario</label>
                <input
                  type="text"
                  value={transferForm.beneficiaryName}
                  onChange={(e) => setTransferForm(prev => ({ ...prev, beneficiaryName: e.target.value }))}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Monto *</label>
                <input
                  type="number"
                  value={transferForm.amount}
                  onChange={(e) => setTransferForm(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Descripción</label>
                <textarea
                  value={transferForm.description}
                  onChange={(e) => setTransferForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 border rounded"
                  rows="3"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Procesando...' : 'Realizar Transferencia'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionFormPage;
