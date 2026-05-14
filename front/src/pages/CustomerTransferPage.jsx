import { useState, useRef, useEffect } from 'react';
import { Field, inputClass, PageShell, Panel, primaryButtonClass } from '../components/PageShell';
import { transfer, getAccountByNumber, getAccountsByCustomerId, getCustomerByIdentification } from '../services/apiClient';
import { useAuth } from '../hooks/useAuth';

const emptyForm = (origin) => ({
  originAccountNumber: origin,
  destinationAccountNumber: '',
  amount: '',
  description: 'TRANSFERENCIA ENTRE CUENTAS',
  subtypeCode: 'TRANSFER'
});

export function CustomerTransferPage() {
  const { user } = useAuth();
  const [customerAccounts, setCustomerAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  const [form, setForm] = useState(emptyForm(''));
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [destinationInfo, setDestinationInfo] = useState(null);
  const txUuidRef = useRef(crypto.randomUUID());

  // Cargar cuentas reales del cliente al montar
  useEffect(() => {
    const loadAccounts = async () => {
      if (!user?.identificacion) {
        setLoadingAccounts(false);
        return;
      }
      setLoadingAccounts(true);
      try {
        const customer = await getCustomerByIdentification(
          user.identificationType || 'CEDULA',
          user.identificacion
        );
        const accounts = await getAccountsByCustomerId(customer.id);
        setCustomerAccounts(accounts);
        if (accounts.length > 0) {
          setForm(emptyForm(accounts[0].accountNumber));
        }
      } catch (err) {
        console.error("Error loading accounts for transfer:", err);
        setError("Error cargando tus cuentas origen.");
      } finally {
        setLoadingAccounts(false);
      }
    };

    loadAccounts();
  }, [user]);

  const resetForm = () => {
    if (customerAccounts.length > 0) {
      setForm(emptyForm(customerAccounts[0].accountNumber));
    } else {
      setForm(emptyForm(''));
    }
    setResult(null);
    setError('');
    setDestinationInfo(null);
    txUuidRef.current = crypto.randomUUID();
  };

  const validateDestination = async () => {
    if (!form.destinationAccountNumber) return;
    try {
      const data = await getAccountByNumber(form.destinationAccountNumber);
      setDestinationInfo(data.customerFullName || 'Titular encontrado');
      setError('');
    } catch {
      setDestinationInfo(null);
      setError('Cuenta destino no encontrada en el Core');
    }
  };

  const submitTransfer = async () => {
    if (loading || result) return;
    setLoading(true);
    setError('');
    try {
      const res = await transfer(
        form.originAccountNumber,
        form.destinationAccountNumber,
        Number(form.amount),
        txUuidRef.current
      );
      setResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const w = window.open('', '_blank');
    w.document.write(`
      <html>
      <head>
        <title>Comprobante de Transferencia</title>
        <style>
          *{margin:0;padding:0;box-sizing:border-box}
          body{font-family:'Segoe UI',sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f5f5f5}
          .card{background:white;border-radius:16px;overflow:hidden;width:380px;box-shadow:0 8px 32px rgba(0,0,0,0.12)}
          .header{background:#006644;padding:24px;text-align:center;color:white}
          .header h1{font-size:18px;font-weight:700;letter-spacing:1px}
          .header .icon{font-size:32px;margin-bottom:8px}
          .header p{font-size:12px;opacity:0.8;margin-top:4px}
          .body{padding:24px}
          .row{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #f0f0f0}
          .row:last-child{border-bottom:none}
          .label{color:#888;font-size:12px}
          .value{font-size:13px;font-weight:600;color:#111;text-align:right}
          .amount{font-size:22px;font-weight:800;color:#006644}
          .footer{background:#f9f9f9;padding:12px;text-align:center;font-size:10px;color:#aaa;border-top:1px solid #eee}
          @media print{body{background:white}.card{box-shadow:none;border-radius:0;width:100%}}
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <div class="icon">✅</div>
            <h1>BancoBanQuito EN LÍNEA</h1>
            <p>Comprobante de Transferencia</p>
            <p>${new Date(result.transactionDate).toLocaleString()}</p>
          </div>
          <div class="body">
            <div class="row"><span class="label">Monto enviado</span><span class="amount">$${result.amount?.toFixed(2)}</span></div>
            <div class="row"><span class="label">Cuenta Origen</span><span class="value">${form.originAccountNumber}</span></div>
            <div class="row"><span class="label">Cuenta Destino</span><span class="value">${form.destinationAccountNumber}</span></div>
            <div class="row"><span class="label">Beneficiario</span><span class="value">${destinationInfo || 'N/A'}</span></div>
            <div class="row"><span class="label">Concepto</span><span class="value">${form.description.toUpperCase()}</span></div>
            <div class="row"><span class="label">Referencia</span><span class="value">${result.transactionUuid?.slice(-8).toUpperCase()}</span></div>
          </div>
          <div class="footer">Documento generado digitalmente — Información confidencial — BancoBanQuito</div>
        </div>
        <script>window.onload=()=>window.print();<\/script>
      </body>
      </html>
    `);
    w.document.close();
  };

  const isFormValid =
    form.originAccountNumber &&
    form.destinationAccountNumber &&
    form.amount &&
    Number(form.amount) > 0 &&
    destinationInfo;

  if (loadingAccounts) {
    return (
      <PageShell title="Transferencias" description="">
        <div className="flex flex-col items-center justify-center p-20">
           <div className="w-10 h-10 border-4 border-[#006644] border-t-transparent rounded-full animate-spin mb-4"></div>
           <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Cargando tus cuentas bancarias...</p>
        </div>
      </PageShell>
    );
  }

  if (customerAccounts.length === 0) {
    return (
      <PageShell title="Transferencias" description="">
        <Panel title="Sin cuentas disponibles">
          <p className="text-slate-600">No se encontraron cuentas asociadas para realizar transferencias.</p>
        </Panel>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Transferencias"
      description="Envía dinero de forma segura entre cuentas del BancoBanQuito."
    >
      {!result && (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Panel title="Nueva Transferencia">
            <div className="grid gap-6 md:grid-cols-2">
              <Field label="Cuenta de Origen">
                <select
                  className={`${inputClass} !bg-slate-50 font-bold`}
                  value={form.originAccountNumber}
                  onChange={(e) => setForm({ ...form, originAccountNumber: e.target.value })}
                >
                  {customerAccounts.map((acc) => (
                    <option key={acc.accountNumber} value={acc.accountNumber}>
                      {acc.accountSubtypeDescription} — {acc.accountNumber}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Cuenta de Destino">
                <div className="flex gap-2">
                  <input
                    className={`${inputClass} flex-1`}
                    value={form.destinationAccountNumber}
                    onChange={(e) => {
                      setForm({ ...form, destinationAccountNumber: e.target.value });
                      setDestinationInfo(null);
                    }}
                    placeholder="Ej: UIO-123456"
                  />
                  <button
                    className={`${primaryButtonClass} !w-auto px-6 bg-[#006644] hover:bg-[#004d33]`}
                    onClick={validateDestination}
                    disabled={!form.destinationAccountNumber}
                  >
                    VALIDAR
                  </button>
                </div>
                {destinationInfo && (
                  <p className="mt-2 text-[11px] text-green-700 font-black uppercase tracking-tighter bg-green-50 px-3 py-1 rounded-lg border border-green-100 animate-in zoom-in-95">
                    ✓ Titular: {destinationInfo}
                  </p>
                )}
              </Field>

              <Field label="Monto a Transferir ($)">
                <input
                  className={`${inputClass} text-2xl font-black text-[#006644]`}
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="0.00"
                />
              </Field>

              <Field label="Concepto / Descripción">
                <input
                  className={inputClass}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </Field>
            </div>

            <button
              className={`${primaryButtonClass} mt-8 py-5 text-lg shadow-xl shadow-green-900/10`}
              disabled={loading || !isFormValid}
              onClick={submitTransfer}
            >
              {loading ? 'PROCESANDO TRANSFERENCIA...' : 'CONFIRMAR Y ENVIAR DINERO'}
            </button>
          </Panel>
        </div>
      )}

      {error && !result && (
        <div className="mt-6 max-w-lg mx-auto bg-red-50 border border-red-200 rounded-2xl p-5 flex gap-4 items-start animate-in shake duration-500">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <div>
            <p className="font-black text-red-700 uppercase text-xs tracking-widest">Error Transaccional</p>
            <p className="mt-1 text-sm text-red-600 font-medium">{error}</p>
          </div>
        </div>
      )}

      {result && (
        <div className="mt-8 max-w-md mx-auto animate-in zoom-in-95 duration-500">
          <div className="bg-white border border-gray-200 rounded-[3rem] shadow-2xl overflow-hidden relative">
            <div className="bg-[#006644] px-6 py-10 text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-white/30">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight uppercase">¡Éxito!</h2>
              <p className="text-green-100 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Transferencia Procesada</p>
            </div>
            
            <div className="p-8 space-y-4">
              {[
                ['Monto', `$${result.amount?.toFixed(2)}`, true],
                ['Origen', form.originAccountNumber],
                ['Destino', form.destinationAccountNumber],
                ['Titular', destinationInfo || 'N/A'],
                ['Referencia', result.transactionUuid?.slice(-8).toUpperCase()]
              ].map(([label, val, highlight], i) => (
                <div key={i} className="flex justify-between items-center border-b border-slate-50 pb-3 last:border-none">
                  <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{label}</span>
                  <span className={highlight ? 'text-2xl font-black text-[#006644] tracking-tighter' : 'font-bold text-slate-800 text-sm'}>{val}</span>
                </div>
              ))}
            </div>

            <div className="p-8 pt-0 flex flex-col gap-3">
              <button onClick={handlePrint} className="w-full py-4 rounded-2xl border-2 border-[#006644] text-[#006644] font-black text-xs uppercase tracking-widest hover:bg-green-50 transition-all active:scale-[0.98]">Imprimir Comprobante</button>
              <button onClick={resetForm} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-[0.98]">Nueva Transferencia</button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
