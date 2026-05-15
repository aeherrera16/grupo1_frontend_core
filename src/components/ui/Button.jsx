export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  ...props
}) {
  const baseClasses = 'font-medium rounded-lg transition duration-200 cursor-pointer';

  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'px-4 py-2 bg-red-600 text-white hover:bg-red-700 shadow-sm',
    success: 'px-4 py-2 bg-green-600 text-white hover:bg-green-700 shadow-sm',
    outline: 'px-4 py-2 border-2 border-gray-300 text-gray-700 hover:border-gray-400 bg-white',
  };

  const sizes = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabledClasses} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
