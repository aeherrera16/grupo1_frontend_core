import { useState, useRef } from 'react';
import { Field, inputClass, PageShell, Panel, primaryButtonClass } from '../components/PageShell';
import { credit, debit, transfer } from '../services/apiClient';

const initialForm = {
  operation: 'credits',
  accountNumber: '',
  originAccountNumber: '',
  destinationAccountNumber: '',
  amount: '',
};

const operationConfig = {
  credits: { label: 'Depósito', subtypeCode: 'DEPOSITO' },
  debits: { label: 'Retiro', subtypeCode: 'RETIRO_ATM' },
  transfers: { label: 'Transferencia', subtypeCode: 'TRANSFER' },
};

function ReceiptView({ transaction, operationType, onNewTransaction }) {
  const handlePrint = () => {
    window.print();
  };

  const operationLabel = operationConfig[operationType]?.label || operationType;

  return (
    <div className="print:hidden flex flex-col items-center justify-center py-12">
      <div className="w-full max-w-md rounded-lg border-2 border-green-400 bg-green-50 p-8 shadow-lg">
        <div className="text-center">
          <div className="mb-4 text-4xl font-bold text-green-600">✓</div>
          <h2 className="text-2xl font-bold text-banker-navy">Operación exitosa</h2>
          <p className="mt-1 text-sm text-slate-600">{operationLabel} registrado correctamente</p>
        </div>

        <div className="mt-8 space-y-3 border-t-2 border-green-200 pt-6">
          <div className="flex justify-between">
            <span className="text-sm font-medium text-slate-600">Transacción ID:</span>
            <span className="text-sm font-semibold text-slate-900">{transaction.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium text-slate-600">Monto:</span>
            <span className="text-sm font-semibold text-slate-900">
              ${transaction.amount?.toLocaleString('es-EC', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium text-slate-600">Saldo resultante:</span>
            <span className="text-sm font-semibold text-slate-900">
              ${transaction.resultingBalance?.toLocaleString('es-EC', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium text-slate-600">Fecha y hora:</span>
            <span className="text-sm font-semibold text-slate-900">
              {new Date(transaction.transactionDate).toLocaleString('es-EC')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium text-slate-600">UUID:</span>
            <span className="text-xs font-mono text-slate-600">{transaction.transactionUuid}</span>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <button
            className="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
            onClick={handlePrint}
          >
            Imprimir comprobante
          </button>
          <button
            className="w-full rounded-lg border-2 border-banker-blue px-4 py-2 font-semibold text-banker-blue transition hover:bg-slate-50"
            onClick={onNewTransaction}
          >
            Nuevo movimiento
          </button>
        </div>
      </div>
    </div>
  );
}

function ErrorMessage({ message }) {
  return (
    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
      <p className="text-sm font-semibold text-red-700">✗ {message}</p>
    </div>
  );
}

export function CashierPage() {
  const txUuidRef = useRef(null);
  const [form, setForm] = useState(initialForm);
  const [transaction, setTransaction] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Generar UUID una sola vez al montar
  if (!txUuidRef.current) {
    txUuidRef.current = crypto.randomUUID().toString().replace(/-/g, '');
  }

  const isTransfer = form.operation === 'transfers';

  const handleOperationChange = (newOp) => {
    setForm({
      operation: newOp,
      accountNumber: '',
      originAccountNumber: '',
      destinationAccountNumber: '',
      amount: '',
    });
    setError('');
  };

  const validateForm = () => {
    if (!form.amount || Number(form.amount) <= 0) {
      setError('El monto debe ser mayor a 0');
      return false;
    }

    if (isTransfer) {
      if (!form.originAccountNumber?.trim() || !form.destinationAccountNumber?.trim()) {
        setError('Ingresa las cuentas origen y destino');
        return false;
      }
    } else {
      if (!form.accountNumber?.trim()) {
        setError('Ingresa el número de cuenta');
        return false;
      }
    }

    return true;
  };

  const submitTransaction = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setTransaction(null);

    try {
      let result;
      const amount = Number(form.amount);

      if (form.operation === 'credits') {
        result = await credit(form.accountNumber, amount);
      } else if (form.operation === 'debits') {
        result = await debit(form.accountNumber, amount);
      } else if (form.operation === 'transfers') {
        result = await transfer(form.originAccountNumber, form.destinationAccountNumber, amount, txUuidRef.current);
      }

      setTransaction(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNewTransaction = () => {
    txUuidRef.current = crypto.randomUUID().toString().replace(/-/g, '');
    setForm(initialForm);
    setTransaction(null);
    setError('');
  };

  // Si hay transacción exitosa, mostrar comprobante
  if (transaction) {
    return (
      <PageShell
        title="Ventanilla"
        description="El cajero registra créditos, débitos y transferencias; no crea clientes ni administra estados de cuenta."
      >
        <ReceiptView
          transaction={transaction}
          operationType={form.operation}
          onNewTransaction={handleNewTransaction}
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Ventanilla"
      description="El cajero registra créditos, débitos y transferencias; no crea clientes ni administra estados de cuenta."
    >
      <Panel title="Registro de movimiento">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Tipo de operación">
            <select
              className={inputClass}
              value={form.operation}
              onChange={(e) => handleOperationChange(e.target.value)}
              disabled={loading}
            >
              <option value="credits">Depósito (crédito)</option>
              <option value="debits">Retiro (débito)</option>
              <option value="transfers">Transferencia</option>
            </select>
          </Field>

          {!isTransfer && (
            <Field label="Número de cuenta">
              <input
                className={inputClass}
                value={form.accountNumber}
                onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                placeholder="Ej: 001-ABC123"
              />
            </Field>
          )}

          {isTransfer && (
            <>
              <Field label="Cuenta origen">
                <input
                  className={inputClass}
                  value={form.originAccountNumber}
                  onChange={(e) => setForm({ ...form, originAccountNumber: e.target.value })}
                  placeholder="Ej: 001-ABC123"
                />
              </Field>
              <Field label="Cuenta destino">
                <input
                  className={inputClass}
                  value={form.destinationAccountNumber}
                  onChange={(e) => setForm({ ...form, destinationAccountNumber: e.target.value })}
                  placeholder="Ej: 001-XYZ789"
                />
              </Field>
            </>
          )}

          <Field label="Monto">
            <input
              className={inputClass}
              type="number"
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="0.00"
            />
          </Field>

          <Field label="Subtipo de transacción">
            <div className={`${inputClass} flex items-center bg-slate-100 text-slate-600`}>
              {operationConfig[form.operation]?.subtypeCode || 'N/A'}
            </div>
          </Field>
        </div>

        <button
          className={`${primaryButtonClass} mt-6 w-full`}
          disabled={loading || !form.amount}
          onClick={submitTransaction}
        >
          {loading ? 'Procesando...' : 'Registrar movimiento'}
        </button>

        {error && <ErrorMessage message={error} />}
      </Panel>
    </PageShell>
  );
}
