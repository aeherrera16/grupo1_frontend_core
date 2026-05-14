import { useState } from 'react';
import { Field, inputClass, PageShell, Panel, primaryButtonClass } from '../components/PageShell';
import { getCustomerByIdentification, createWebCredential } from '../services/apiClient';

function ErrorMessage({ message }) {
  return (
    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
      <p className="text-sm font-semibold text-red-700">✗ {message}</p>
    </div>
  );
}

function SuccessMessage({ message }) {
  return (
    <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
      <p className="text-sm font-semibold text-green-700">✓ {message}</p>
    </div>
  );
}

export function CredentialsPage() {
  const [searchType, setSearchType] = useState('CEDULA');
  const [searchNumber, setSearchNumber] = useState('');
  const [foundCustomer, setFoundCustomer] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  const [form, setForm] = useState({ customerId: '', username: '', password: '' });
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  const handleSearch = async () => {
    setSearchLoading(true);
    setSearchError('');
    setFoundCustomer(null);
    setForm({ customerId: '', username: '', password: '' });
    try {
      const customer = await getCustomerByIdentification(searchType, searchNumber);
      setFoundCustomer(customer);
      setForm({ customerId: String(customer.id), username: '', password: '' });
    } catch (err) {
      setSearchError(err.message);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleCreateCredential = async () => {
    if (!form.customerId || !form.username || !form.password) {
      setCreateError('Completa todos los campos');
      return;
    }

    setCreateLoading(true);
    setCreateError('');
    setCreateSuccess('');
    try {
      await createWebCredential({
        customerId: Number(form.customerId),
        username: form.username,
        password: form.password,
      });
      setCreateSuccess(`Credencial creada para ${form.username}`);
      setForm({ customerId: foundCustomer?.id || '', username: '', password: '' });
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <PageShell
      title="Credenciales web"
      description="Crea accesos web para clientes. Primero busca el cliente por identificación."
    >
      <div className="grid gap-6 xl:grid-cols-2">
        {/* BUSCAR CLIENTE */}
        <Panel title="1. Buscar cliente">
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Tipo de identificación">
              <select
                className={inputClass}
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
              >
                <option value="CEDULA">Cédula</option>
                <option value="RUC">RUC</option>
                <option value="PASAPORTE">Pasaporte</option>
              </select>
            </Field>
            <Field label="Número">
              <input
                className={inputClass}
                value={searchNumber}
                onChange={(e) => setSearchNumber(e.target.value)}
                placeholder="Ej: 0912345678"
              />
            </Field>
            <div className="flex items-end">
              <button
                className={primaryButtonClass}
                disabled={searchLoading || !searchNumber}
                onClick={handleSearch}
              >
                Buscar
              </button>
            </div>
          </div>

          {foundCustomer && (
            <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
              <p className="text-sm font-semibold text-green-700">✓ Cliente encontrado</p>
              <div className="mt-2 space-y-1 text-sm text-green-800">
                <p><strong>Nombre:</strong> {foundCustomer.firstName || foundCustomer.legalName}</p>
                <p><strong>ID:</strong> {foundCustomer.id}</p>
              </div>
            </div>
          )}

          {searchError && <ErrorMessage message={searchError} />}
        </Panel>

        {/* CREAR CREDENCIAL */}
        <Panel title="2. Crear credencial">
          <div className="grid gap-4">
            {foundCustomer ? (
              <>
                <div className="rounded-lg bg-slate-100 p-3 text-sm font-semibold text-slate-800">
                  Cliente: {foundCustomer.firstName || foundCustomer.legalName}
                </div>
                <Field label="Usuario">
                  <input
                    className={inputClass}
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    placeholder="Ej: juan.perez"
                  />
                </Field>
                <Field label="Contraseña temporal">
                  <input
                    className={inputClass}
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Contraseña inicial"
                  />
                </Field>
                <button
                  className={`${primaryButtonClass} w-full`}
                  disabled={createLoading || !form.username || !form.password}
                  onClick={handleCreateCredential}
                >
                  {createLoading ? 'Creando...' : 'Crear credencial'}
                </button>
              </>
            ) : (
              <div className="rounded-lg bg-slate-50 p-4 text-center text-sm text-slate-600">
                Busca un cliente primero
              </div>
            )}

            {createSuccess && <SuccessMessage message={createSuccess} />}
            {createError && <ErrorMessage message={createError} />}
          </div>
        </Panel>
      </div>
    </PageShell>
  );
}
