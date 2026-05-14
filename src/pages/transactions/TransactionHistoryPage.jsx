import { useNavigate } from 'react-router-dom';
// import { getTransactionHistory } from '../../api/transactionApi'; // No implementado en backend aún

export const TransactionHistoryPage = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-600 hover:text-blue-800"
      >
        ← Volver
      </button>

      <h1 className="text-3xl font-bold mb-6">Historial de Transacciones</h1>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded">
        <p className="text-yellow-800 font-semibold text-lg mb-2">⚠️ Funcionalidad en desarrollo</p>
        <p className="text-yellow-700">El endpoint de historial de transacciones aún no está implementado en el backend. Esta funcionalidad estará disponible próximamente.</p>
      </div>
    </div>
  );
};

export default TransactionHistoryPage;
