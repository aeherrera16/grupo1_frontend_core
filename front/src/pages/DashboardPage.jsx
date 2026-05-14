import { useAuth } from '../hooks/useAuth';
import { useAccounts } from '../hooks/useAccounts';
import { AccountCard } from '../components/AccountCard';
import { AccountCardSkeleton } from '../components/AccountCardSkeleton';

export function DashboardPage() {
  const { user } = useAuth();
  const customerId = user?.id ? parseInt(user.id) : null;
  const { accounts, isLoading, error } = useAccounts(customerId);

  const calculateTotalBalance = () => {
    return accounts.reduce((sum, acc) => sum + (acc.availableBalance || 0), 0);
  };

  const calculateTotalAccountingBalance = () => {
    return accounts.reduce((sum, acc) => sum + (acc.accountingBalance || 0), 0);
  };

  const activeAccounts = accounts.filter(acc => acc.status === 'ACTIVO').length;

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-banker-navy mb-2">
          Dashboard
        </h1>
        <p className="text-banker-gray mb-8">
          Bienvenido, {user?.name}
        </p>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-banker-blue">
            <p className="text-banker-gray text-sm font-semibold">Saldo Disponible Total</p>
            <p className="text-3xl font-bold text-banker-navy mt-2">
              ${calculateTotalBalance().toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-banker-blue">
            <p className="text-banker-gray text-sm font-semibold">Saldo Contable</p>
            <p className="text-3xl font-bold text-banker-navy mt-2">
              ${calculateTotalAccountingBalance().toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-banker-blue">
            <p className="text-banker-gray text-sm font-semibold">Cuentas Activas</p>
            <p className="text-3xl font-bold text-banker-navy mt-2">{activeAccounts}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-banker-blue">
            <p className="text-banker-gray text-sm font-semibold">Total Cuentas</p>
            <p className="text-3xl font-bold text-banker-navy mt-2">{accounts.length}</p>
          </div>
        </div>

        {/* Accounts Section */}
        <div>
          <h2 className="text-2xl font-bold text-banker-navy mb-6">Mis Cuentas</h2>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <p className="text-red-700 font-semibold">Error al cargar cuentas</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <AccountCardSkeleton key={i} />
              ))}
            </div>
          ) : accounts.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-banker-gray text-lg">No tienes cuentas registradas</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {accounts.map((account) => (
                <AccountCard key={account.id} account={account} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
