import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { debit, credit, transfer } from '../../api/transactionApi';
import { getAccount } from '../../api/accountApi';
import { validateCurrency } from '../../helpers/validators';
import { formatCurrency } from '../../helpers/formatters';
import { DEBIT_SUBTYPES, CREDIT_SUBTYPES } from '../../constants/transactionSubtypes';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const emptyInfo = { checking: false, found: null, holder: '', status: '', error: '' };

const SpinIcon = () => (
  <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
  </svg>
);

const ErrIcon = () => (
  <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
      clipRule="evenodd"
    />
  </svg>
);

const OkIcon = () => (
  <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const AccountFeedback = ({ info, requireActive = false }) => {
  if (info.checking) {
    return (
      <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500">
        <SpinIcon /> Verificando cuenta...
      </div>
    );
  }

  if (info.found === null) return null;

  if (!info.found) {
    return (
      <p className="flex items-center gap-1.5 mt-1.5 text-xs text-red-600">
        <ErrIcon /> Cuenta no encontrada
      </p>
    );
  }

  const isActive = info.status === 'ACTIVO';

  if (requireActive && !isActive) {
    return (
      <div className="mt-1.5 space-y-0.5">
        <p className="flex items-center gap-1.5 text-xs text-slate-600">
          <svg className="w-3.5 h-3.5 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Titular: {info.holder}
        </p>
        <p className="flex items-center gap-1.5 text-xs text-red-600">
          <ErrIcon /> Cuenta {info.status?.toLowerCase()} — no puede usarse como origen
        </p>
      </div>
    );
  }

  return (
    <p className="flex items-center gap-1.5 mt-1.5 text-xs text-emerald-700">
      <OkIcon /> Titular: {info.holder}
    </p>
  );
};

export const TransactionFormPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('transfer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [success, setSuccess] = useState(null);

  const [debitAccInfo, setDebitAccInfo] = useState(emptyInfo);
  const [creditAccInfo, setCreditAccInfo] = useState(emptyInfo);
  const [sourceInfo, setSourceInfo] = useState(emptyInfo);
  const [destInfo, setDestInfo] = useState(emptyInfo);

  const [debitForm, setDebitForm] = useState({
    accountNumber: '',
    amount: '',
    description: '',
    subtypeCode: DEBIT_SUBTYPES[0]?.code || '',
  });

  const [creditForm, setCreditForm] = useState({
    accountNumber: '',
    amount: '',
    description: '',
    subtypeCode: CREDIT_SUBTYPES[0]?.code || '',
  });

  const [transferForm, setTransferForm] = useState({
    sourceAccount: '',
    destinationAccount: '',
    beneficiaryName: '',
    amount: '',
    description: '',
  });

  const checkAccount = useCallback(async (accountNumber, setInfo) => {
    const num = accountNumber?.trim();

    if (!num) return;

    setInfo({ checking: true, found: null, holder: '', status: '', error: '' });

    try {
      const res = await getAccount(num);
      const acc = res.data;

      setInfo({
        checking: false,
        found: true,
        holder: acc.customerFullName || '',
        status: acc.status || '',
        error: '',
      });
    } catch (err) {
      const msg = err.response?.status === 404 ? 'Cuenta no encontrada' : 'Error al verificar la cuenta';

      setInfo({
        checking: false,
        found: false,
        holder: '',
        status: '',
        error: msg,
      });
    }
  }, []);

  const isSameAccount =
    transferForm.sourceAccount &&
    transferForm.destinationAccount &&
    transferForm.sourceAccount === transferForm.destinationAccount;

  const isTransferReady =
    !isSameAccount &&
    sourceInfo.found === true &&
    sourceInfo.status === 'ACTIVO' &&
    destInfo.found === true &&
    !!transferForm.amount &&
    validateCurrency(transferForm.amount) &&
    parseFloat(transferForm.amount) > 0;

  const showTransferHint =
    !isTransferReady &&
    (sourceInfo.found !== null || destInfo.found !== null);

  const fieldCls = (hasError = false) =>
    `w-full px-3 py-2.5 border rounded-lg text-sm text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
      hasError ? 'border-red-400 bg-red-50' : 'border-slate-300'
    }`;

  const validateAmount = (amount) => {
    if (!amount || !validateCurrency(amount) || Number(amount) <= 0) {
      setFieldError('El monto debe ser mayor a cero.');
      return false;
    }

    return true;
  };

  const handleAmountChange = (value, setForm) => {
    if (value === '' || Number(value) >= 0) {
      setFieldError('');
      setForm(prev => ({ ...prev, amount: value }));
    }
  };

  const renderButtonContent = (text) => {
    if (!loading) return text;

    return (
      <div className="flex items-center justify-center gap-2">
        <LoadingSpinner fullPage={false} size="sm" />
        Procesando...
      </div>
    );
  };

  const renderAmountError = () => {
    if (!fieldError) return null;

    return (
      <p className="mt-1 text-sm text-red-600">
        {fieldError}
      </p>
    );
  };

  const handleDebit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldError('');
    setSuccess(null);

    if (!debitForm.accountNumber) {
      setError('Ingrese el número de cuenta');
      return;
    }

    if (debitAccInfo.found === false) {
      setError('La cuenta no existe o no pudo ser verificada');
      return;
    }

    if (debitAccInfo.found === true && debitAccInfo.status !== 'ACTIVO') {
      setError('La cuenta no está activa. No se puede realizar el débito');
      return;
    }

    if (!validateAmount(debitForm.amount)) return;

    setLoading(true);

    try {
      const response = await debit({
        accountNumber: debitForm.accountNumber,
        amount: parseFloat(debitForm.amount),
        subtypeCode: debitForm.subtypeCode,
        transactionUuid: crypto.randomUUID(),
        description: debitForm.description || 'Débito',
      });

      setSuccess({
        message: 'Débito realizado exitosamente',
        transactionId: response.data.transactionId,
        resultingBalance: response.data.resultingBalance,
      });

      setDebitForm({
        accountNumber: '',
        amount: '',
        description: '',
        subtypeCode: DEBIT_SUBTYPES[0]?.code || '',
      });
      setDebitAccInfo(emptyInfo);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al procesar débito');
    } finally {
      setLoading(false);
    }
  };

  const handleCredit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldError('');
    setSuccess(null);

    if (!creditForm.accountNumber) {
      setError('Ingrese el número de cuenta');
      return;
    }

    if (creditAccInfo.found === false) {
      setError('La cuenta no existe o no pudo ser verificada');
      return;
    }

    if (!validateAmount(creditForm.amount)) return;

    setLoading(true);

    try {
      const response = await credit({
        accountNumber: creditForm.accountNumber,
        amount: parseFloat(creditForm.amount),
        subtypeCode: creditForm.subtypeCode,
        transactionUuid: crypto.randomUUID(),
        description: creditForm.description || 'Crédito',
      });

      setSuccess({
        message: 'Crédito realizado exitosamente',
        transactionId: response.data.transactionId,
        resultingBalance: response.data.resultingBalance,
      });

      setCreditForm({
        accountNumber: '',
        amount: '',
        description: '',
        subtypeCode: CREDIT_SUBTYPES[0]?.code || '',
      });
      setCreditAccInfo(emptyInfo);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al procesar crédito');
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setError('');
    setFieldError('');
    setSuccess(null);

    if (!validateAmount(transferForm.amount)) return;

    if (isSameAccount) {
      setError('No se puede transferir a la misma cuenta');
      return;
    }

    if (!isTransferReady) {
      setError('Verifique que ambas cuentas sean válidas y el monto sea correcto');
      return;
    }

    setLoading(true);

    try {
      const response = await transfer({
        originAccountNumber: transferForm.sourceAccount,
        destinationAccountNumber: transferForm.destinationAccount,
        amount: parseFloat(transferForm.amount),
        transactionUuid: crypto.randomUUID(),
        subtypeCode: 'TRANSFER',
        description: transferForm.description || 'Transferencia',
      });

      setSuccess({
        message: 'Transferencia realizada exitosamente',
        transactionId: response.data.transactionId,
        resultingBalance: response.data.resultingBalance,
      });

      setTransferForm({
        sourceAccount: '',
        destinationAccount: '',
        beneficiaryName: '',
        amount: '',
        description: '',
      });
      setSourceInfo(emptyInfo);
      setDestInfo(emptyInfo);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al procesar transferencia');
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setError('');
    setFieldError('');
    setSuccess(null);
  };

  const Label = ({ children, required }) => (
    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
      {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div>
          <h1 className="text-2xl font-bold text-slate-800">Nueva Transacción</h1>
          <p className="text-sm text-slate-500 mt-0.5">Débito, crédito o transferencia entre cuentas</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-5">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-4 h-4 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-sm font-semibold text-green-800">{success.message}</p>
          </div>
          <p className="text-xs text-green-700 ml-6">ID: {success.transactionId}</p>
          <p className="text-xs text-green-700 ml-6">Saldo resultante: {formatCurrency(success.resultingBalance)}</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-100">
        <div className="flex border-b border-slate-100">
          {[
            { id: 'debit', label: 'Débito', active: 'border-red-500 text-red-600' },
            { id: 'credit', label: 'Crédito', active: 'border-green-500 text-green-600' },
            { id: 'transfer', label: 'Transferencia', active: 'border-blue-600 text-blue-700' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => switchTab(tab.id)}
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors border-b-2 ${
                activeTab === tab.id
                  ? tab.active
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'debit' && (
            <form onSubmit={handleDebit} className="space-y-4">
              <div>
                <Label required>Número de Cuenta</Label>
                <input
                  type="text"
                  value={debitForm.accountNumber}
                  onChange={(e) => {
                    setDebitForm(prev => ({ ...prev, accountNumber: e.target.value }));
                    setDebitAccInfo(emptyInfo);
                  }}
                  onBlur={() => checkAccount(debitForm.accountNumber, setDebitAccInfo)}
                  placeholder="Ingrese el número de cuenta"
                  className={fieldCls(debitAccInfo.found === false)}
                />
                <AccountFeedback info={debitAccInfo} requireActive />
              </div>

              <div>
                <Label required>Tipo de Débito</Label>
                <select
                  value={debitForm.subtypeCode}
                  onChange={(e) => setDebitForm(prev => ({ ...prev, subtypeCode: e.target.value }))}
                  className={fieldCls()}
                >
                  {DEBIT_SUBTYPES.map((subtype) => (
                    <option key={subtype.code} value={subtype.code}>
                      {subtype.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label required>Monto</Label>
                <input
                  type="number"
                  value={debitForm.amount}
                  onChange={(e) => handleAmountChange(e.target.value, setDebitForm)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className={fieldCls()}
                />
                {renderAmountError()}
              </div>

              <div>
                <Label>Descripción</Label>
                <textarea
                  value={debitForm.description}
                  onChange={(e) => setDebitForm(prev => ({ ...prev, description: e.target.value }))}
                  className={fieldCls()}
                  rows={3}
                  placeholder="Descripción opcional"
                />
              </div>

              <button
                type="submit"
                disabled={loading || debitAccInfo.checking || (debitAccInfo.found === true && debitAccInfo.status !== 'ACTIVO')}
                className="w-full py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {renderButtonContent('Realizar Débito')}
              </button>
            </form>
          )}

          {activeTab === 'credit' && (
            <form onSubmit={handleCredit} className="space-y-4">
              <div>
                <Label required>Número de Cuenta</Label>
                <input
                  type="text"
                  value={creditForm.accountNumber}
                  onChange={(e) => {
                    setCreditForm(prev => ({ ...prev, accountNumber: e.target.value }));
                    setCreditAccInfo(emptyInfo);
                  }}
                  onBlur={() => checkAccount(creditForm.accountNumber, setCreditAccInfo)}
                  placeholder="Ingrese el número de cuenta"
                  className={fieldCls(creditAccInfo.found === false)}
                />
                <AccountFeedback info={creditAccInfo} />
              </div>

              <div>
                <Label required>Tipo de Crédito</Label>
                <select
                  value={creditForm.subtypeCode}
                  onChange={(e) => setCreditForm(prev => ({ ...prev, subtypeCode: e.target.value }))}
                  className={fieldCls()}
                >
                  {CREDIT_SUBTYPES.map((subtype) => (
                    <option key={subtype.code} value={subtype.code}>
                      {subtype.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label required>Monto</Label>
                <input
                  type="number"
                  value={creditForm.amount}
                  onChange={(e) => handleAmountChange(e.target.value, setCreditForm)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className={fieldCls()}
                />
                {renderAmountError()}
              </div>

              <div>
                <Label>Descripción</Label>
                <textarea
                  value={creditForm.description}
                  onChange={(e) => setCreditForm(prev => ({ ...prev, description: e.target.value }))}
                  className={fieldCls()}
                  rows={3}
                  placeholder="Descripción opcional"
                />
              </div>

              <button
                type="submit"
                disabled={loading || creditAccInfo.checking}
                className="w-full py-2.5 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {renderButtonContent('Realizar Crédito')}
              </button>
            </form>
          )}

          {activeTab === 'transfer' && (
            <form onSubmit={handleTransfer} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label required>Cuenta Origen</Label>
                  <input
                    type="text"
                    value={transferForm.sourceAccount}
                    onChange={(e) => {
                      setTransferForm(prev => ({ ...prev, sourceAccount: e.target.value }));
                      setSourceInfo(emptyInfo);
                    }}
                    onBlur={() => checkAccount(transferForm.sourceAccount, setSourceInfo)}
                    placeholder="Número de cuenta origen"
                    className={fieldCls(
                      sourceInfo.found === false ||
                      (sourceInfo.found === true && sourceInfo.status !== 'ACTIVO')
                    )}
                  />
                  <AccountFeedback info={sourceInfo} requireActive />
                </div>

                <div>
                  <Label required>Cuenta Destino</Label>
                  <input
                    type="text"
                    value={transferForm.destinationAccount}
                    onChange={(e) => {
                      setTransferForm(prev => ({ ...prev, destinationAccount: e.target.value }));
                      setDestInfo(emptyInfo);
                    }}
                    onBlur={() => checkAccount(transferForm.destinationAccount, setDestInfo)}
                    placeholder="Número de cuenta destino"
                    className={fieldCls(destInfo.found === false || !!isSameAccount)}
                  />
                  <AccountFeedback info={destInfo} />
                  {isSameAccount && (
                    <p className="flex items-center gap-1.5 mt-1.5 text-xs text-red-600">
                      <ErrIcon /> No se puede transferir a la misma cuenta
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label required>Monto</Label>
                <input
                  type="number"
                  value={transferForm.amount}
                  onChange={(e) => handleAmountChange(e.target.value, setTransferForm)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className={fieldCls()}
                />
                {renderAmountError()}
              </div>

              <div>
                <Label>Descripción</Label>
                <textarea
                  value={transferForm.description}
                  onChange={(e) => setTransferForm(prev => ({ ...prev, description: e.target.value }))}
                  className={fieldCls()}
                  rows={3}
                  placeholder="Descripción opcional"
                />
              </div>

              {showTransferHint && (
                <div className="flex items-start gap-2 bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600">
                  <svg className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>

                  <div className="space-y-0.5">
                    {sourceInfo.found !== true && !sourceInfo.checking && (
                      <p>• Cuenta origen: {sourceInfo.found === false ? 'no encontrada' : 'pendiente de verificar'}</p>
                    )}
                    {sourceInfo.found === true && sourceInfo.status !== 'ACTIVO' && (
                      <p>• Cuenta origen está {sourceInfo.status?.toLowerCase()}</p>
                    )}
                    {destInfo.found !== true && !destInfo.checking && (
                      <p>• Cuenta destino: {destInfo.found === false ? 'no encontrada' : 'pendiente de verificar'}</p>
                    )}
                    {isSameAccount && <p>• Origen y destino son la misma cuenta</p>}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !isTransferReady}
                className="w-full py-2.5 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {renderButtonContent('Realizar Transferencia')}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionFormPage;