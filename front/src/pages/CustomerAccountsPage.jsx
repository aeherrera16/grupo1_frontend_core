import { useState, useEffect } from 'react';
import { Field, inputClass, PageShell, Panel, primaryButtonClass } from '../components/PageShell';
import { useAuth } from '../hooks/useAuth';
import { getAccountByNumber, getAccountsByCustomerId, getCustomerByIdentification, getTransactions, setFavoriteAccount, changeAccountStatus } from '../services/apiClient';

export function CustomerAccountsPage() {
  const { user, portal } = useAuth();
  const isStaff = portal === 'operador' || portal === 'cajero';

  
  const [accountNumber, setAccountNumber] = useState('');
  const [searching, setSearching] = useState(false);

  
  const [customerAccounts, setCustomerAccounts] = useState([]);
  const [selectedAccountNumber, setSelectedAccountNumber] = useState('');
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState(null);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (isStaff) {
      setLoadingAccounts(false);
      return;
    }

    const loadCustomerAccounts = async () => {
      if (!user?.identificacion) {
         setLoadingAccounts(false);
         return;
      }
      setLoadingAccounts(true);
      setError('');
      try {
        const customer = await getCustomerByIdentification(
          user.identificationType || 'CEDULA',
          user.identificacion
        );
        const accounts = await getAccountsByCustomerId(customer.id);
        setCustomerAccounts(accounts);

        if (accounts.length > 0) {
          
          const favorite = accounts.find(a => a.isFavorite);
          const initialAcc = favorite ? favorite.accountNumber : accounts[0].accountNumber;
          setSelectedAccountNumber(initialAcc);
          await fetchAccountDetails(initialAcc);
        }
      } catch (err) {
        console.error("Error loading accounts:", err);
        setError("No pudimos cargar tus cuentas. Verifica tu conexión.");
      } finally {
        setLoadingAccounts(false);
      }
    };

    loadCustomerAccounts();
  }, [user, portal, isStaff]);

  
  useEffect(() => {
    const activeAcc = isStaff ? (result?.accountNumber) : selectedAccountNumber;
    if (!activeAcc) return;

    const interval = setInterval(() => {
      fetchAccountDetails(activeAcc, true);
    }, 10000);
    return () => clearInterval(interval);
  }, [selectedAccountNumber, result?.accountNumber, isStaff]);

  const fetchAccountDetails = async (accNumber, isSilent = false) => {
    try {
      const account = await getAccountByNumber(accNumber);
      setResult(account);
      const txHistory = await getTransactions(accNumber);
      setHistory(txHistory);
    } catch (err) {
      if (!isSilent) setError(err.message);
    }
  };

  const handleSearch = async () => {
    setSearching(true);
    setError('');
    setResult(null);
    setHistory(null);
    try {
      await fetchAccountDetails(accountNumber);
    } catch (err) {
      setError(err.message);
    } finally {
      setSearching(false);
    }
  };

  const handleAccountChange = async (accNumber) => {
    setSelectedAccountNumber(accNumber);
    await fetchAccountDetails(accNumber);
  };

  const handleStatusChange = async (action) => {
    if (!result?.accountNumber) return;
    setSearching(true);
    setError('');
    try {
      await changeAccountStatus(result.accountNumber, action);
      await fetchAccountDetails(result.accountNumber);
      showToastNotification(`Cuenta actualizada a estado: ${action.toUpperCase()}`);
    } catch (err) {
      setError("Error al cambiar estado: " + err.message);
    } finally {
      setSearching(false);
    }
  };

  const handleSetFavorite = async () => {
    if (!result?.accountNumber) return;
    try {
      await setFavoriteAccount(result.accountNumber);
      
      await fetchAccountDetails(result.accountNumber);
      
      setCustomerAccounts(prev => prev.map(acc => ({
        ...acc,
        isFavorite: acc.accountNumber === result.accountNumber
      })));
      showToastNotification("Cuenta marcada como favorita con éxito");
    } catch (err) {
      setError("No se pudo marcar la cuenta como favorita: " + err.message);
    }
  };

  const showToastNotification = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleShare = () => {
    if (result?.accountNumber) {
      navigator.clipboard.writeText(result.accountNumber);
      showToastNotification("Número de cuenta copiado al portapapeles");
    }
  };

  
  if (isStaff) {
    return (
      <PageShell title="Consulta de Cuenta" description="Módulo de consulta rápida para atención en ventanilla.">
        <Panel title="Búsqueda de Cuenta">
          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <Field label="Número de cuenta bancaria">
              <input
                className={inputClass}
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Ej: UIO-100001"
              />
            </Field>
            <div className="flex items-end">
              <button
                className={`${primaryButtonClass} !w-auto px-8`}
                disabled={searching || !accountNumber}
                onClick={handleSearch}
              >
                {searching ? '...' : 'CONSULTAR'}
              </button>
            </div>
          </div>
        </Panel>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 font-bold text-sm">
             ✗ {error}
          </div>
        )}

        {result && (
          <div className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
             <Panel title="Información del Producto">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                   <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Titular</p>
                      <p className="text-lg font-black text-slate-900 leading-tight uppercase">{result.customerFullName}</p>
                   </div>
                   <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Producto</p>
                      <p className="text-lg font-black text-slate-900 leading-tight">{result.accountSubtypeDescription}</p>
                   </div>
                   <div className="bg-[#006644]/5 p-4 rounded-2xl border border-[#006644]/10">
                      <p className="text-[10px] font-black text-[#006644] uppercase tracking-widest mb-1">Saldo Disponible</p>
                      <p className="text-2xl font-black text-[#006644]">${result.availableBalance?.toLocaleString('es-EC', { minimumFractionDigits: 2 })}</p>
                   </div>
                   <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estado</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-black ${
                        result.status === 'ACTIVO' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>{result.status}</span>
                   </div>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Acciones de Gestión Operativa</p>
                   <div className="flex flex-wrap gap-4">
                      {result.status !== 'ACTIVO' && (
                        <button onClick={() => handleStatusChange('ACTIVO')} className="px-6 py-3 bg-green-600 text-white text-[11px] font-black uppercase rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-900/10">Reactivar Cuenta</button>
                      )}
                      {result.status === 'ACTIVO' && (
                        <>
                          <button onClick={() => handleStatusChange('inactivate')} className="px-6 py-3 bg-slate-100 text-slate-600 text-[11px] font-black uppercase rounded-xl hover:bg-slate-200 transition-all">Inactivar</button>
                          <button onClick={() => handleStatusChange('block')} className="px-6 py-3 bg-red-50 text-red-600 text-[11px] font-black uppercase rounded-xl hover:bg-red-100 transition-all">Bloquear</button>
                          <button onClick={() => handleStatusChange('suspend')} className="px-6 py-3 bg-orange-50 text-orange-600 text-[11px] font-black uppercase rounded-xl hover:bg-orange-100 transition-all">Suspender</button>
                        </>
                      )}
                   </div>
                </div>
             </Panel>
          </div>
        )}
      </PageShell>
    );
  }

  
  if (loadingAccounts) {
    return (
      <PageShell title="Cargando tus productos..." description="">
        <div className="flex flex-col items-center justify-center p-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
           <div className="w-12 h-12 border-4 border-[#006644] border-t-transparent rounded-full animate-spin mb-4"></div>
           <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Sincronizando con el Core...</p>
        </div>
      </PageShell>
    );
  }

  return (
    <div className="max-w-6xl p-8 mx-auto mt-6">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Hola, {user?.name?.split(' ')[0]}</h1>
        <p className="text-slate-500 mt-1 font-medium">Aquí tienes el resumen consolidado de tus cuentas.</p>
      </div>

      {customerAccounts.length > 1 && (
        <div className="mb-8 p-6 bg-[#006644] rounded-3xl shadow-xl shadow-green-900/10">
          <label className="block text-[10px] font-black text-green-100 uppercase tracking-widest mb-3">Cambiar de cuenta activa</label>
          <select
            className="w-full bg-white/10 border-none text-white font-bold rounded-2xl px-4 py-3 focus:ring-2 focus:ring-white/20"
            value={selectedAccountNumber}
            onChange={(e) => handleAccountChange(e.target.value)}
          >
            {customerAccounts.map((acc) => (
              <option key={acc.accountNumber} value={acc.accountNumber} className="text-slate-900">
                {acc.accountNumber} - {acc.accountSubtypeDescription}
              </option>
            ))}
          </select>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 font-bold text-sm">✗ {error}</div>
      )}

      {result && (
        <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200/50 mb-10 transition-all hover:shadow-slate-200/80">
          <div className="p-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="flex items-start gap-6">
                <div className="p-5 bg-green-50 rounded-[2rem] border border-green-100">
                  <svg className="w-10 h-10 text-[#006644]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-2xl font-black text-slate-900">{result.accountSubtypeDescription}</h2>
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black rounded-full uppercase">{result.status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-bold text-[#006644] tracking-tight">{result.accountNumber}</p>
                    {result.isFavorite && (
                      <span title="Cuenta Favorita para recaudaciones" className="text-yellow-500 animate-bounce">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-bold uppercase mt-1 tracking-widest">{result.branchName || 'Sede Principal'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 md:text-right">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Saldo Contable</p>
                  <p className="text-xl font-bold text-slate-400">${result.accountingBalance?.toLocaleString('es-EC', { minimumFractionDigits: 2 })}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-[#006644] uppercase tracking-widest mb-1">Saldo Disponible</p>
                  <p className="text-4xl font-black text-slate-900 tracking-tighter">${result.availableBalance?.toLocaleString('es-EC', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="px-10 py-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-6">
            {!result.isFavorite && (
              <button onClick={handleSetFavorite} className="flex items-center gap-2 text-[11px] font-black text-yellow-600 hover:text-yellow-700 uppercase tracking-widest transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.921-.755 1.688-1.54 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.784.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                Marcar como Favorita
              </button>
            )}
            <button onClick={handleShare} className="flex items-center gap-2 text-[11px] font-black text-slate-400 hover:text-[#006644] uppercase tracking-widest transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
              Compartir
            </button>
            <button onClick={() => setShowDetails(true)} className="flex items-center gap-2 text-[11px] font-black text-slate-400 hover:text-[#006644] uppercase tracking-widest transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Ver Detalle
            </button>
          </div>
        </div>
      )}

      {history && (
        <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
          <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Últimos Movimientos</h3>
            <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full">Actualizado recién</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50/50 text-slate-400 uppercase text-[10px] font-black tracking-widest">
                <tr>
                  <th className="px-8 py-4">Fecha y Hora</th>
                  <th className="px-8 py-4">Movimiento</th>
                  <th className="px-8 py-4">Concepto</th>
                  <th className="px-8 py-4 text-right">Monto</th>
                  <th className="px-8 py-4 text-right">Saldo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {history.map((tx, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-8 py-5 text-slate-400 font-bold">{new Date(tx.transactionDate).toLocaleString('es-EC')}</td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 text-[10px] font-black rounded-lg ${tx.movementType === 'CREDITO' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {tx.movementType}
                      </span>
                    </td>
                    <td className="px-8 py-5 font-bold text-slate-700 uppercase tracking-tight">{tx.message || tx.description}</td>
                    <td className={`px-8 py-5 text-right font-black ${tx.movementType === 'CREDITO' ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.movementType === 'CREDITO' ? '+' : '-'}${tx.amount?.toFixed(2)}
                    </td>
                    <td className="px-8 py-5 text-right font-bold text-slate-400">${tx.resultingBalance?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {}
      {showDetails && result && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowDetails(false)} />
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden relative z-10 animate-in zoom-in-95 duration-300">
            <div className="bg-[#006644] p-8 text-white">
              <h3 className="text-2xl font-black tracking-tight">Detalles del Producto</h3>
              <p className="text-green-100 text-xs font-bold uppercase tracking-widest mt-1">Información Técnica del Core</p>
            </div>
            <div className="p-8 space-y-4">
               {[
                 { label: 'Titular', value: result.customerFullName },
                 { label: 'Número de Cuenta', value: result.accountNumber },
                 { label: 'Tipo de Cuenta', value: result.accountSubtypeDescription },
                 { label: 'Sucursal Gestión', value: result.branchName },
                 { label: 'Estado Operativo', value: result.status, isBadge: true }
               ].map((item, i) => (
                 <div key={i} className="flex justify-between items-center border-b border-slate-50 pb-4">
                   <span className="text-slate-400 text-[11px] font-black uppercase tracking-widest">{item.label}</span>
                   {item.isBadge ? (
                     <span className="bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full text-[10px] font-black">{item.value}</span>
                   ) : (
                     <span className="font-bold text-slate-800 text-sm">{item.value}</span>
                   )}
                 </div>
               ))}
               <div className="flex justify-between items-center pt-2">
                 <span className="text-slate-400 text-[11px] font-black uppercase tracking-widest">Saldo Disponible</span>
                 <span className="font-black text-[#006644] text-2xl tracking-tighter">${result.availableBalance?.toFixed(2)}</span>
               </div>
            </div>
            <div className="p-8 pt-0">
               <button onClick={() => setShowDetails(false)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all">CERRAR DETALLES</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
