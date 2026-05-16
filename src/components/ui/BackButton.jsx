import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function BackButton({ to = -1 }) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate(to)}
      className="mb-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded text-sm font-medium transition-colors"
    >
      <ArrowLeft size={16} strokeWidth={2} />
      Volver
    </button>
  );
}
