import { useState, useEffect } from 'react';
import { Field, inputClass, PageShell, Panel, primaryButtonClass, ResultBox } from '../components/PageShell';
import {
  getCustomerByIdentification,
  createCustomer as createCustomerApi,
  createAccount as createAccountApi,
  getBranches,
  getAccountSubtypes,
  getCustomerSubtypes,
} from '../services/apiClient';

const emptyCustomer = {
  identificationType: 'CEDULA',
  identification: '',
  customerType: 'NATURAL',
  firstName: '',
  lastName: '',
  birthDate: '',
  legalName: '',
  constitutionDate: '',
  email: '',
  mobilePhone: '',
  address: '',
  customerSubtypeId: '',
};

const emptyAccount = {
  customerId: '',
  accountSubtypeId: '',
  branchId: '',
  isFavorite: false,
};

export function CustomerOnboardingPage() {
  const [lookup, setLookup] = useState({ type: 'CEDULA', number: '' });
  const [customer, setCustomer] = useState(emptyCustomer);
  const [account, setAccount] = useState(emptyAccount);
  
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Catálogos
  const [branches, setBranches] = useState([]);
  const [customerSubtypes, setCustomerSubtypes] = useState([]);
  const [accountSubtypes, setAccountSubtypes] = useState([]);

  useEffect(() => {
    loadCatalogs();
  }, []);

  const loadCatalogs = async () => {
    try {
      const [b, cs, as] = await Promise.all([
        getBranches(),
        getCustomerSubtypes(),
        getAccountSubtypes()
      ]);
      setBranches(Array.isArray(b) ? b : []);
      setCustomerSubtypes(Array.isArray(cs) ? cs : []);
      setAccountSubtypes(Array.isArray(as) ? as : []);
    } catch (err) {
      console.error("Error cargando catálogos:", err);
    }
  };

  const handleLookup = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await getCustomerByIdentification(lookup.type, lookup.number);
      setResult(res);
      if (res && res.id) {
        selectCustomer(res);
      }
    } catch (err) {
      setError("Cliente no encontrado o error en la búsqueda.");
      setSelectedCustomer(null);
    } finally {
      setLoading(false);
    }
  };

  const selectCustomer = (c) => {
    setSelectedCustomer(c);
    setAccount(prev => ({ ...prev, customerId: c.id }));
    setTimeout(() => {
      document.getElementById('apertura-panel')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleCreateCustomer = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await createCustomerApi({
        ...customer,
        customerSubtypeId: customer.customerSubtypeId ? Number(customer.customerSubtypeId) : null,
      });
      setResult(res);
      if (res && res.id) selectCustomer(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await createAccountApi({
        ...account,
        customerId: Number(account.customerId),
        accountSubtypeId: Number(account.accountSubtypeId),
        branchId: Number(account.branchId),
      });
      setResult(res);
      alert("¡Cuenta creada con éxito!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell
      title="Gestión de Onboarding"
      description="Flujo bancario: Identificación del titular y apertura de productos financieros."
    >
      <div className="grid gap-8 xl:grid-cols-2">
        {/* PANEL 1: BÚSQUEDA */}
        <Panel title="1. Identificación del Titular">
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block tracking-widest">Documento</label>
              <select className={inputClass} value={lookup.type} onChange={(e) => setLookup({ ...lookup, type: e.target.value })}>
                <option value="CEDULA">Cédula de Identidad</option>
                <option value="RUC">RUC (Empresas)</option>
                <option value="PASAPORTE">Pasaporte</option>
              </select>
            </div>
            <div className="flex-[2]">
              <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block tracking-widest">Número de Identificación</label>
              <div className="flex gap-2">
                <input className={inputClass} placeholder="Ingrese número..." value={lookup.number} onChange={(e) => setLookup({ ...lookup, number: e.target.value })} />
                <button className={`${primaryButtonClass} !w-auto px-6`} disabled={loading || !lookup.number} onClick={handleLookup}>
                  {loading ? '...' : 'BUSCAR'}
                </button>
              </div>
            </div>
          </div>

          {selectedCustomer && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-2xl flex justify-between items-center animate-in fade-in zoom-in duration-300">
              <div>
                <p className="text-[10px] font-black text-green-600 uppercase tracking-tighter">Titular Identificado</p>
                <p className="text-lg font-black text-green-900">{selectedCustomer.firstName ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}` : selectedCustomer.legalName}</p>
                <p className="text-xs text-green-700 font-medium">{selectedCustomer.identificationType}: {selectedCustomer.identification}</p>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="text-green-800 hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          )}
        </Panel>

        {/* PANEL 2: REGISTRO SI NO EXISTE */}
        <Panel title="2. Registro de Nuevo Cliente" className={selectedCustomer ? 'opacity-40 grayscale pointer-events-none' : ''}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Tipo de Titular">
              <select className={inputClass} value={customer.customerType} onChange={(e) => setCustomer({ ...customer, customerType: e.target.value })}>
                <option value="NATURAL">Persona Natural</option>
                <option value="JURIDICO">Persona Jurídica</option>
              </select>
            </Field>
            <Field label="Identificación">
              <input className={inputClass} value={customer.identification} onChange={(e) => setCustomer({ ...customer, identification: e.target.value })} placeholder="Ej: 1712345678" />
            </Field>

            {customer.customerType === 'NATURAL' ? (
              <>
                <Field label="Nombres">
                  <input className={inputClass} value={customer.firstName} onChange={(e) => setCustomer({ ...customer, firstName: e.target.value })} />
                </Field>
                <Field label="Apellidos">
                  <input className={inputClass} value={customer.lastName} onChange={(e) => setCustomer({ ...customer, lastName: e.target.value })} />
                </Field>
                <Field label="Fecha de Nacimiento">
                  <input className={inputClass} type="date" value={customer.birthDate} onChange={(e) => setCustomer({ ...customer, birthDate: e.target.value })} />
                </Field>
              </>
            ) : (
              <>
                <Field label="Razón Social">
                  <input className={inputClass} value={customer.legalName} onChange={(e) => setCustomer({ ...customer, legalName: e.target.value })} />
                </Field>
                <Field label="Fecha de Constitución">
                  <input className={inputClass} type="date" value={customer.constitutionDate} onChange={(e) => setCustomer({ ...customer, constitutionDate: e.target.value })} />
                </Field>
              </>
            )}

            <Field label="Segmento de Cliente">
              <select className={inputClass} value={customer.customerSubtypeId} onChange={(e) => setCustomer({ ...customer, customerSubtypeId: e.target.value })}>
                <option value="">Seleccione Segmento...</option>
                {customerSubtypes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
            <Field label="Correo Electrónico">
              <input className={inputClass} type="email" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} />
            </Field>
          </div>
          <button className={`${primaryButtonClass} mt-6`} disabled={loading || selectedCustomer} onClick={handleCreateCustomer}>
            {loading ? 'CREANDO...' : 'REGISTRAR Y SELECCIONAR TITULAR'}
          </button>
        </Panel>

        {/* PANEL 3: APERTURA DE CUENTA */}
        <div id="apertura-panel">
          <Panel title="3. Apertura de Producto" className={!selectedCustomer ? 'opacity-40 grayscale pointer-events-none' : 'border-2 border-green-500 shadow-xl shadow-green-900/5'}>
            <div className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Producto para:</p>
                <p className="text-xl font-black text-slate-900">{selectedCustomer ? (selectedCustomer.firstName ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}` : selectedCustomer.legalName) : '---'}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Tipo de Cuenta Bancaria">
                  <select className={inputClass} value={account.accountSubtypeId} onChange={(e) => setAccount({ ...account, accountSubtypeId: e.target.value })}>
                    <option value="">Seleccione Producto...</option>
                    {accountSubtypes.map(s => <option key={s.id} value={s.id}>{s.name} ({s.customerType})</option>)}
                  </select>
                </Field>
                <Field label="Sucursal de Apertura">
                  <select className={inputClass} value={account.branchId} onChange={(e) => setAccount({ ...account, branchId: e.target.value })}>
                    <option value="">Seleccione Oficina...</option>
                    {branches.map(b => <option key={b.id} value={b.id}>{b.name} ({b.branchCode})</option>)}
                  </select>
                </Field>
              </div>

              <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <input type="checkbox" checked={account.isFavorite} onChange={(e) => setAccount({ ...account, isFavorite: e.target.checked })} className="w-4 h-4 accent-[#006644]" />
                <label>Marcar como favorita para recaudaciones automáticas</label>
              </div>

              <button className={`${primaryButtonClass} py-5 text-lg shadow-2xl`} disabled={loading || !selectedCustomer || !account.accountSubtypeId || !account.branchId} onClick={handleCreateAccount}>
                {loading ? 'PROCESANDO...' : 'CONFIRMAR APERTURA AUTOMÁTICA'}
              </button>
            </div>
          </Panel>
        </div>

        {/* PANEL 4: SUCURSALES (CONSULTA) */}
        <Panel title="Información de Oficinas">
          <div className="overflow-hidden rounded-2xl border border-slate-200">
             <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="p-4 font-black text-slate-500 uppercase tracking-widest text-[10px]">Cód. Sucursal</th>
                    <th className="p-4 font-black text-slate-500 uppercase tracking-widest text-[10px]">Nombre de Oficina</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {branches.length === 0 ? (
                    <tr><td colSpan="2" className="p-8 text-center text-slate-400 italic">Cargando datos de oficinas...</td></tr>
                  ) : (
                    branches.map(b => (
                      <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-bold text-[#006644]">{b.branchCode}</td>
                        <td className="p-4 text-slate-700 font-medium">{b.name}</td>
                      </tr>
                    ))
                  )}
                </tbody>
             </table>
          </div>
        </Panel>
      </div>

      <div className="mt-8">
        <ResultBox result={result} error={error} />
      </div>
    </PageShell>
  );
}
