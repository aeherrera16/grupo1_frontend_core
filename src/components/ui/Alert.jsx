export function Alert({ type = 'info', title, message, children, dismissible = false, onDismiss }) {
  const icons = {
    info: '🛈',
    success: '✓',
    warning: '⚠',
    danger: '⚠',
  };

  return (
    <div className={`alert alert-${type} flex items-start gap-3`}>
      <span className="text-lg flex-shrink-0">{icons[type]}</span>
      <div className="flex-1">
        {title && <strong className="block">{title}</strong>}
        {message && <p className="mt-1">{message}</p>}
        {children}
      </div>
      {dismissible && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 text-gray-500 hover:text-gray-700 transition"
          aria-label="Dismiss"
        >
          ✕
        </button>
      )}
    </div>
  );
}
