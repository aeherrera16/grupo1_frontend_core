export function AccountCard({ account }) {
  const getStatusBadge = (status) => {
    const statusConfig = {
      ACTIVO: { bg: 'bg-green-100', text: 'text-green-800', label: 'Activa' },
      INACTIVO: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Inactiva' },
      BLOQUEADO: { bg: 'bg-red-100', text: 'text-red-800', label: 'Bloqueada' },
      SUSPENDIDO: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Suspendida' },
    };
    return statusConfig[status] || statusConfig.INACTIVO;
  };

  const statusConfig = getStatusBadge(account.status);

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border-l-4 border-banker-blue p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <p className="text-sm text-banker-gray font-semibold uppercase tracking-wide">
            Número de Cuenta
          </p>
          <p className="text-xl font-bold text-banker-navy mt-1">
            {account.accountNumber}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
          {statusConfig.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-xs text-banker-gray uppercase tracking-wide font-semibold">
            Tipo
          </p>
          <p className="text-sm font-medium text-banker-navy mt-1">
            {account.accountSubtypeDescription}
          </p>
        </div>
        <div>
          <p className="text-xs text-banker-gray uppercase tracking-wide font-semibold">
            Sucursal
          </p>
          <p className="text-sm font-medium text-banker-navy mt-1">
            {account.branchName}
          </p>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4 mb-4">
        <p className="text-xs text-banker-gray uppercase tracking-wide font-semibold mb-3">
          Saldos
        </p>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-banker-gray">Saldo Contable:</span>
            <span className="text-sm font-semibold text-banker-navy">
              ${account.accountingBalance?.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="bg-gradient-to-r from-banker-blue/10 to-banker-gold/10 rounded-lg p-3">
            <p className="text-xs text-banker-gray uppercase tracking-wide font-semibold mb-1">
              Saldo Disponible
            </p>
            <p className="text-2xl font-bold text-banker-blue">
              ${account.availableBalance?.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      <div className="text-xs text-banker-gray pt-2">
        Abierta: {new Date(account.openingDate).toLocaleDateString('es-EC')}
        {account.isFavorite && (
          <span className="ml-2 inline-block text-banker-gold">★ Favorita</span>
        )}
      </div>
    </div>
  );
}
