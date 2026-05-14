import { useState } from 'react';
import { Field, inputClass, PageShell, Panel, primaryButtonClass, secondaryButtonClass } from '../components/PageShell';
import { getAccountByNumber, changeAccountStatus } from '../services/apiClient';

const statusColors = {
  ACTIVO: 'bg-green-100 text-green-800 border-green-300',
  BLOQUEADO: 'bg-red-100 text-red-800 border-red-300',
  SUSPENDIDO: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  INACTIVO: 'bg-gray-100 text-gray-800 border-gray-300',
};

const statusLabels = {
  ACTIVO: 'Activo',
  BLOQUEADO: 'Bloqueado',
  SUSPENDIDO: 'Suspendido',
  INACTIVO: 'Inactivo',
};

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="rounded-lg bg-white p-6 shadow-xl max-w-md">
        <p className="text-sm text-slate-700">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition"
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition"
            onClick={onConfirm}
          >
            Confirmar
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

function AccountInfo({ account }) {
  return (
    <div className="mt-4 rounded-lg border border-slate-200 p-4 space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-slate-600">Número de cuenta:</span>
        <span className="text-sm font-semibold text-slate-900">{account.accountNumber}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-slate-600">Cliente:</span>
        <span className="text-sm font-semibold text-slate-900">{account.customerName}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-slate-600">Sucursal:</span>
        <span className="text-sm font-semibold text-slate-900">{account.branchName}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-slate-600">Saldo disponible:</span>
        <span className="text-sm font-semibold text-slate-900">${account.availableBalance?.toLocaleString('es-EC', { minimumFractionDigits: 2 })}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-slate-600">Saldo contable:</span>
        <span className="text-sm font-semibold text-slate-900">${account.accountingBalance?.toLocaleString('es-EC', { minimumFractionDigits: 2 })}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-slate-600">Estado:</span>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[account.status] || 'bg-slate-100'}`}>
          {statusLabels[account.status] || account.status}
        </span>
      </div>
    </div>
  );
}

export function AccountOperationsPage() {
  const [accountNumber, setAccountNumber] = useState('');
  const [account, setAccount] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(null);

  const handleConsult = async () => {
    setLoading(true);
    setError('');
    setAccount(null);
    try {
      const result = await getAccountByNumber(accountNumber);
      setAccount(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const changeStatus = async (action) => {
    setLoading(true);
    setError('');
    try {
      const result = await changeAccountStatus(accountNumber, action);
      setAccount(result);
      setConfirmDialog(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (action, message) => {
    setConfirmDialog({ action, message });
  };

  const confirmAction = () => {
    if (confirmDialog) {
      changeStatus(confirmDialog.action);
    }
  };

  const getAvailableActions = () => {
    if (!account) return [];

    const actions = [];

    if (account.status === 'ACTIVO') {
      actions.push(
        { label: 'Bloquear', action: 'block', color: 'bg-red-600 hover:bg-red-700', message: '¿Deseas bloquear esta cuenta? No será posible realizar operaciones.' },
        { label: 'Suspender', action: 'suspend', color: 'bg-yellow-600 hover:bg-yellow-700', message: '¿Deseas suspender esta cuenta? No se aceptarán créditos.' },
        { label: 'Inactivar', action: 'inactivate', color: 'bg-gray-600 hover:bg-gray-700', message: '¿Deseas inactivar esta cuenta? Quedará archivada.' }
      );
    }

    if (account.status === 'BLOQUEADO' || account.status === 'SUSPENDIDO' || account.status === 'INACTIVO') {
      actions.push(
        { label: 'Reactivar', action: 'activate', color: 'bg-green-600 hover:bg-green-700', message: `¿Deseas reactivar esta cuenta desde el estado ${statusLabels[account.status]}?` }
      );
    }

    return actions;
  };

  const availableActions = getAvailableActions();

  return (
    <PageShell
      title="Gestión de cuentas"
      description="El operador administra estados de cuenta; no registra movimientos de caja."
    >
      <Panel title="Consulta y cambio de estado">
        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
          <Field label="Número de cuenta">
            <input
              className={inputClass}
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Ej: 001-ABC123DEF456"
            />
          </Field>
          <div className="flex items-end">
            <button
              className={primaryButtonClass}
              disabled={loading || !accountNumber}
              onClick={handleConsult}
            >
              Consultar
            </button>
          </div>
        </div>

        {account && <AccountInfo account={account} />}

        {account && availableActions.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-3">
            {availableActions.map(({ label, action, color, message }) => (
              <button
                key={action}
                className={`${color} px-4 py-2 rounded-lg text-sm font-semibold text-white transition`}
                disabled={loading}
                onClick={() => handleActionClick(action, message)}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {account && availableActions.length === 0 && (
          <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-600">No hay acciones disponibles para esta cuenta en su estado actual.</p>
          </div>
        )}

        {error && <ErrorMessage message={error} />}
      </Panel>

      {confirmDialog && (
        <ConfirmDialog
          message={confirmDialog.message}
          onConfirm={confirmAction}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
    </PageShell>
  );
}
