import { useState, useEffect, useRef, useCallback } from 'react';
import { getCustomerByIdentification } from '../../services/apiClient';
import { inputClass } from '../PageShell';

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

async function searchCustomers(term) {
  const clean = term.trim();
  if (!clean) return [];

  if (/^\d{10,13}$/.test(clean)) {
    const type = clean.length === 13 ? 'RUC' : 'CEDULA';
    try {
      const customer = await getCustomerByIdentification(type, clean);
      return customer ? [customer] : [];
    } catch {
      return [];
    }
  }

  return [];
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

export function CustomerSelector({ value, onChange, error }) {
  const [inputValue, setInputValue] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [selectedName, setSelectedName] = useState('');

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
    }
  }, [value]);

  // Search whenever debounced term changes and no customer is locked in
  useEffect(() => {
    if (value) return;
    if (!debouncedTerm.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    searchCustomers(debouncedTerm).then((list) => {
      if (cancelled) return;
      setResults(list.slice(0, 5));
      setOpen(list.length > 0);
      setActiveIndex(-1);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [debouncedTerm, value]);

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
    setSelectedName(name);
    setInputValue('');
    setResults([]);
    setOpen(false);
    setActiveIndex(-1);
    onChange({ id: customer.id, name, identification });
  }, [onChange]);

  const handleClear = useCallback(() => {
    setSelectedName('');
    setInputValue('');
    setResults([]);
    setOpen(false);
    onChange(null);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [onChange]);

  const handleInputChange = (e) => {
    if (value) {
      onChange(null);
      setSelectedName('');
    }
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (!open || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(results[activeIndex]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  // Use value.name as fallback so prefilled values display correctly
  const displayValue = value ? (selectedName || value.name || '') : inputValue;

  const baseInputClass = inputClass + (error ? ' border-red-400 focus:border-red-500 focus:ring-red-200/40' : '');

  return (
    <div ref={containerRef} className="relative">
      <div className="relative flex items-center">
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
          placeholder="Buscar por cédula, RUC o nombre..."
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

      {open && results.length > 0 && (
        <ul
          id="customer-selector-listbox"
          role="listbox"
          aria-label="Resultados de clientes"
          className="absolute z-50 mt-1 w-full rounded-sm border border-slate-200 bg-white shadow-lg shadow-slate-200/60 overflow-hidden"
        >
          {results.map((customer, index) => {
            const name = buildDisplayName(customer);
            const identification = buildIdentification(customer);
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
                <span className="font-bold truncate">{name}</span>
                {identification && (
                  <span className="shrink-0 text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    {identification}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {open && results.length === 0 && !loading && debouncedTerm.trim() && (
        <div className="absolute z-50 mt-1 w-full rounded-sm border border-slate-200 bg-white px-4 py-3 text-sm text-slate-400 shadow-lg">
          No se encontraron clientes para <span className="font-bold text-slate-600">"{debouncedTerm}"</span>
        </div>
      )}

      {error && (
        <p className="mt-1 text-xs font-semibold text-red-600">{error}</p>
      )}
    </div>
  );
}
