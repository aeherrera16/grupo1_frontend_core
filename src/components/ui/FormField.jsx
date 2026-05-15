export function FormField({
  label,
  error,
  required = false,
  children,
  helperText,
  className = ''
}) {
  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="text-red-600 text-sm mt-1">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-gray-500 text-sm mt-1">{helperText}</p>
      )}
    </div>
  );
}

export function Input({
  label,
  error,
  required = false,
  helperText,
  ...props
}) {
  return (
    <FormField label={label} error={error} required={required} helperText={helperText}>
      <input className="form-input" {...props} />
    </FormField>
  );
}

export function Select({
  label,
  error,
  required = false,
  helperText,
  options = [],
  ...props
}) {
  return (
    <FormField label={label} error={error} required={required} helperText={helperText}>
      <select className="form-select" {...props}>
        <option value="">Seleccionar...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </FormField>
  );
}

export function Textarea({
  label,
  error,
  required = false,
  helperText,
  ...props
}) {
  return (
    <FormField label={label} error={error} required={required} helperText={helperText}>
      <textarea className="form-textarea" {...props}></textarea>
    </FormField>
  );
}
