import { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { ENDPOINTS } from '../config/environment';

export function HolidaysPage() {
  const [formDate, setFormDate] = useState('');
  const [isBusinessDayInfo, setIsBusinessDayInfo] = useState(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');

  const handleDateChange = async (date) => {
    setFormDate(date);
    setIsBusinessDayInfo(null);
    setError('');

    if (date) {
      setChecking(true);
      try {
        const response = await axiosInstance.get(
          ENDPOINTS.HOLIDAYS.CHECK_BUSINESS_DAY(date)
        );
        setIsBusinessDayInfo(response.data);
      } catch (err) {
        setError('Error al verificar día hábil');
      } finally {
        setChecking(false);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Gestión de Feriados</h1>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-bold mb-4">Verificar Día Hábil</h3>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Fecha</label>
          <input
            type="date"
            value={formDate}
            onChange={(e) => handleDateChange(e.target.value)}
            disabled={checking}
            className="w-full p-2 border rounded"
          />
        </div>

        {error && (
          <div className="bg-red-100 text-red-800 p-4 rounded mb-6">
            {error}
          </div>
        )}

        {isBusinessDayInfo && (
          <div className={`p-4 rounded mb-6 ${
            isBusinessDayInfo.businessDay
              ? 'bg-green-100 text-green-800'
              : 'bg-orange-100 text-orange-800'
          }`}>
            <p className="font-semibold text-lg">
              {isBusinessDayInfo.businessDay
                ? '✓ Es día hábil'
                : '✗ No es día hábil (feriado o fin de semana)'}
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded">
        <p className="text-yellow-800 font-semibold text-lg mb-2">⚠️ Funcionalidad en desarrollo</p>
        <p className="text-yellow-700">Los endpoints para crear, obtener todos y eliminar feriados aún no están implementados en el backend. Solo está disponible la verificación de día hábil.</p>
      </div>
    </div>
  );
}
