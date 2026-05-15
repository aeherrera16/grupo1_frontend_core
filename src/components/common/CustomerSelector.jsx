import { useState, useEffect, useRef, useCallback } from 'react';
import { searchCustomer } from '../../api/customerApi';
import { inputClass } from '../PageShell';

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function buildDisplayName(customer) {
  if (customer.fullName) return customer.fullName;
  if (customer.firstName || customer.lastName) {
    return `${customer.firstName ?? ''} ${customer.lastName ?? ''}`.trim();
  }
  if (customer.businessName) return customer.businessName;
  return String(customer.id);
}

function buildIdentification(customer) {
  return customer.identificationNumber ?? customer.identification ?? '';
}

function buildType(customer) {
  return customer.customerType ?? customer.type ?? '';
}

const ID_TYPES = [
  { value: 'CEDULA', label: 'Cédula' },
  { value: 'RUC', label: 'RUC' },
  { value: 'PASAPORTE', label: 'Pasaporte' },
];

const selectClass =
  'rounded-sm border border-slate-300 bg-white px-2 py-2.5 text-sm outline-none transition focus:border-banker-blue focus:ring-2 focus:ring-banker-blue/15';

// ─── Component ───────────────────────────────────────────────────────────────

export function CustomerSelector({ value, onChange, error }) {
  const [idType, setIdType] = useState('CEDULA');
  const [inputValue, setInputValue] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [selectedName, setSelectedName] = useState('');
  const [noResults, setNoResults] = useState(false);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const debouncedTerm = useDebounce(inputValue, 300);

  // Sync external value reset (e.g. parent resets to null)
  useEffect(() => {
    if (!value) {
      setSelectedName('');
      setInputValue('');
      setResults([]);
      setOpen(false);
      setNoResults(false);
    }
  }, [value]);

  const doSearch = useCallback(async (type, number) => {
    const clean = number.trim();
    if (!clean) {
      setResults([]);
      setOpen(false);
      setNoResults(false);
      return;
    }
    setLoading(true);
    setNoResults(false);
    setOpen(false);
    try {
      const response = await searchCustomer(type, clean);
      const customer = response.data;
      if (customer) {
        setResults([customer]);
        setOpen(true);
      } else {
        setResults([]);
        setNoResults(true);
      }
      setActiveIndex(-1);
    } catch {
      setResults([]);
      setOpen(false);
      setNoResults(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-search with debounce when number input changes
  useEffect(() => {
    if (value) return;
    doSearch(idType, debouncedTerm);
  }, [debouncedTerm, idType, value, doSearch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleSelect = useCallback((customer) => {
    const name = buildDisplayName(customer);
    const identification = buildIdentification(customer);
    const type = buildType(customer);
    setSelectedName(name);
    setInputValue('');
    setResults([]);
    setOpen(false);
    setActiveIndex(-1);
    setNoResults(false);
    onChange({ id: customer.id, name, identification, type });
  }, [onChange]);

  const handleClear = useCallback(() => {
    setSelectedName('');
    setInputValue('');
    setResults([]);
    setOpen(false);
    setNoResults(false);
    onChange(null);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [onChange]);

  const handleInputChange = (e) => {
    if (value) {
      onChange(null);
      setSelectedName('');
    }
    setInputValue(e.target.value);
    setNoResults(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (open && activeIndex >= 0) {
        e.preventDefault();
        handleSelect(results[activeIndex]);
        return;
      }
      if (!value) {
        e.preventDefault();
        doSearch(idType, inputValue);
      }
      return;
    }
    if (!open || results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const handleTypeChange = (e) => {
    setIdType(e.target.value);
    if (value) {
      onChange(null);
      setSelectedName('');
    }
    setResults([]);
    setOpen(false);
    setNoResults(false);
  };

  const displayValue = value ? (selectedName || value.name || '') : inputValue;
  const baseInputClass =
    inputClass + (error ? ' border-red-400 focus:border-red-500 focus:ring-red-200/40' : '');

  return (
    <div ref={containerRef} className="relative">
      {/* Type selector + number input + search button */}
      <div className="flex gap-2">
        <select
          value={idType}
          onChange={handleTypeChange}
          disabled={!!value}
          className={`${selectClass} shrink-0 ${value ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {ID_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>

        <div className="relative flex-1 flex items-center">
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={open}
            aria-controls="customer-selector-listbox"
            aria-activedescendant={activeIndex >= 0 ? `customer-option-${activeIndex}` : undefined}
            className={`${baseInputClass} pr-8`}
            value={displayValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => { if (!value && results.length > 0) setOpen(true); }}
            placeholder="Número de identificación..."
            autoComplete="off"
          />

          <span className="absolute right-2 flex items-center">
            {loading && (
              <svg className="w-4 h-4 animate-spin text-slate-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            )}
            {!loading && value && (
              <button
                type="button"
                aria-label="Limpiar selección"
                onClick={handleClear}
                className="text-slate-400 hover:text-slate-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-banker-blue rounded"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </span>
        </div>

        {!value && (
          <button
            type="button"
            onClick={() => doSearch(idType, inputValue)}
            disabled={loading || !inputValue.trim()}
            className="shrink-0 px-3 py-2 text-sm font-semibold bg-banker-blue text-white rounded-sm hover:bg-banker-navy disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Buscar
          </button>
        )}
      </div>

      {/* Dropdown results */}
      {!value && open && results.length > 0 && (
        <ul
          id="customer-selector-listbox"
          role="listbox"
          aria-label="Resultados de clientes"
          className="absolute z-50 mt-1 w-full rounded-sm border border-slate-200 bg-white shadow-lg shadow-slate-200/60 overflow-hidden"
        >
          {results.map((customer, index) => {
            const name = buildDisplayName(customer);
            const identification = buildIdentification(customer);
            const type = buildType(customer);
            const isActive = index === activeIndex;
            return (
              <li
                key={customer.id}
                id={`customer-option-${index}`}
                role="option"
                aria-selected={isActive}
                className={`flex items-center justify-between gap-4 px-4 py-3 cursor-pointer text-sm transition-colors
                  ${isActive ? 'bg-banker-blue/5 text-banker-navy' : 'text-slate-700 hover:bg-slate-50'}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(customer)}
                onMouseEnter={() => setActiveIndex(index)}
              >
                <div className="min-w-0">
                  <span className="font-bold block truncate">{name}</span>
                  {identification && (
                    <span className="text-[11px] font-mono text-slate-400">{identification}</span>
                  )}
                </div>
                {type && (
                  <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide
                    ${type === 'NATURAL' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>
                    {type === 'JURIDICO' ? 'JURÍDICO' : type}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* No results hint */}
      {!value && noResults && !loading && inputValue.trim() && (
        <div className="absolute z-50 mt-1 w-full rounded-sm border border-slate-200 bg-white px-4 py-3 text-sm text-slate-400 shadow-lg">
          Cliente no encontrado
        </div>
      )}

      {error && (
        <p className="mt-1 text-xs font-semibold text-red-600">{error}</p>
      )}
    </div>
  );
}
