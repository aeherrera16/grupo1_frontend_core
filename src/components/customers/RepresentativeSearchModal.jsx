import { useState, useEffect, useRef, useCallback } from 'react';
import { searchCustomer } from '../../api/customerApi';
import { getAccountsByCustomer } from '../../api/accountApi';

const RepresentativeSearchModal = ({ isOpen, onClose, onSelect }) => {
  const [searchType, setSearchType] = useState('CEDULA');
  const [searchQuery, setSearchQuery] = useState('');
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const searchRequestRef = useRef(0);

  useEffect(() => {
    if (isOpen) {
      searchRequestRef.current += 1;
      setSearchQuery('');
      setResult(null);
      setSearched(false);
      setError('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const performSearch = useCallback(async (type, query) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return;
    }

    const requestId = searchRequestRef.current + 1;
    searchRequestRef.current = requestId;
    setLoading(true);
    setError('');
    setResult(null);
    setSearched(false);

    try {
      const customerRes = await searchCustomer(type, trimmedQuery);
      if (searchRequestRef.current !== requestId) return;
      const customer = customerRes.data;

      if (customer.customerType !== 'NATURAL') {
        setError('La identificación corresponde a una Persona Jurídica. Solo se permiten Personas Naturales como representante legal.');
        setSearched(true);
        return;
      }

      const accountsRes = await getAccountsByCustomer(customer.id);
      if (searchRequestRef.current !== requestId) return;
      const accounts = accountsRes.data || [];

      if (accounts.length === 0) {
        setError('Esta persona natural no tiene cuentas activas en el sistema. Debe crear una cuenta antes de usarla como representante.');
        setSearched(true);
        return;
      }

      setResult({ ...customer, accounts });
      setSearched(true);
    } catch (err) {
      if (searchRequestRef.current !== requestId) return;
      if (err.response?.status === 404) {
        setError(`No se encontró cliente con ${type.toLowerCase()}: ${trimmedQuery}`);
      } else if (!err.response) {
        setError('No se puede conectar al servidor');
      } else {
        setError(err.response?.data?.message || 'Error al buscar representante');
      }
      setSearched(true);
    } finally {
      if (searchRequestRef.current === requestId) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;

    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) {
      searchRequestRef.current += 1;
      setResult(null);
      setSearched(false);
      setLoading(false);
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      performSearch(searchType, trimmedQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [isOpen, searchQuery, searchType, performSearch]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setError('Ingrese un número de identificación');
      return;
    }

    await performSearch(searchType, searchQuery);
  };

  const handleSelect = () => {
    if (!result) return;
    onSelect(result);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop — z-index 20, por debajo del sidebar (z-40) */}
      <div
        className="fixed inset-0 bg-slate-900/40"
        style={{ zIndex: 20 }}
        onClick={onClose}
      />

      {/* Caja del modal — z-index 30, por debajo del sidebar (z-40) */}
      <div
        className="fixed inset-0 flex items-center justify-center pointer-events-none"
        style={{ zIndex: 30 }}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Buscar Representante Legal</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Personas Naturales con al menos una cuenta activa
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Cerrar modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search form */}
          <div className="p-6">
            <form onSubmit={handleSearch} className="flex gap-2 mb-5">
              <select
                value={searchType}
                onChange={(e) => { setSearchType(e.target.value); setResult(null); setSearched(false); setError(''); }}
                className="px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition shrink-0"
              >
                <option value="CEDULA">Cédula</option>
                <option value="PASAPORTE">Pasaporte</option>
              </select>
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setError(''); }}
                placeholder="Número de identificación"
                className="flex-1 px-3 py-2.5 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2.5 bg-blue-700 text-white text-sm font-semibold rounded-lg hover:bg-blue-800 disabled:bg-slate-400 transition-colors shrink-0"
              >
                {loading ? (
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : 'Buscar'}
              </button>
            </form>

            {/* Error / No results */}
            {error && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4 flex items-start gap-3">
                <svg className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-orange-800">Sin resultados válidos</p>
                  <p className="text-sm text-orange-700 mt-0.5">{error}</p>
                  {error.includes('no tiene cuentas') && (
                    <p className="text-xs text-orange-600 mt-2 font-medium">
                      No hay representantes disponibles. Antes debe crear una persona natural con una cuenta activa.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Empty state after search */}
            {searched && !result && !error && (
              <div className="text-center py-8">
                <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z" />
                </svg>
                <p className="text-sm font-medium text-slate-500">No hay representantes disponibles</p>
                <p className="text-xs text-slate-400 mt-1">
                  Antes debe crear una persona natural con una cuenta activa.
                </p>
              </div>
            )}

            {/* Result card */}
            {result && (
              <div className="border-2 border-blue-200 bg-blue-50 rounded-xl p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{result.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {result.identificationType} · {result.identification}
                      </p>
                      <span className="inline-block mt-1.5 text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                        {result.accounts.length} cuenta{result.accounts.length !== 1 ? 's' : ''} activa{result.accounts.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleSelect}
                    className="shrink-0 px-4 py-2 text-sm font-semibold text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors"
                  >
                    Seleccionar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end px-6 pb-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default RepresentativeSearchModal;
