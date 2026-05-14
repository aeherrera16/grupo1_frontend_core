import { useState, useEffect } from 'react';
import { PageShell, Panel, primaryButtonClass, inputClass, Field } from '../components/PageShell';
import { getHolidays, createHoliday, deleteHoliday, isBusinessDay } from '../services/apiClient';

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="rounded-lg bg-white p-6 shadow-xl max-w-md">
        <p className="text-sm text-slate-700">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition"
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition"
            onClick={onConfirm}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

export function HolidaysPage() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formDate, setFormDate] = useState('');
  const [formName, setFormName] = useState('');
  const [formIsWeekend, setFormIsWeekend] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [isBusinessDayInfo, setIsBusinessDayInfo] = useState(null);

  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadHolidays();
  }, []);

  const loadHolidays = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getHolidays();
      setHolidays(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = async (date) => {
    setFormDate(date);
    if (date) {
      try {
        const info = await isBusinessDay(date);
        setIsBusinessDayInfo(info);
      } catch (err) {
        setIsBusinessDayInfo(null);
      }
    }
  };

  const handleCreateHoliday = async () => {
    if (!formDate || !formName.trim()) {
      setCreateError('Completa la fecha y el nombre del feriado');
      return;
    }

    setCreating(true);
    setCreateError('');
    try {
      await createHoliday({
        holidayDate: formDate,
        name: formName,
        isWeekend: formIsWeekend,
      });
      setFormDate('');
      setFormName('');
      setFormIsWeekend(false);
      setIsBusinessDayInfo(null);
      await loadHolidays();
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteHoliday = async (date) => {
    setDeleting(true);
    try {
      await deleteHoliday(date);
      setDeleteConfirm(null);
      await loadHolidays();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <PageShell
      title="Gestión de feriados"
      description="Configura los días feriados del año para que el Switch procese correctamente los pagos masivos."
    >
      <div className="grid gap-6 xl:grid-cols-2">
        {/* AGREGAR FERIADO */}
        <Panel title="Agregar feriado">
          <div className="grid gap-4">
            <Field label="Fecha del feriado">
              <input
                className={inputClass}
                type="date"
                value={formDate}
                onChange={(e) => handleDateChange(e.target.value)}
              />
            </Field>
            <Field label="Nombre del feriado">
              <input
                className={inputClass}
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Ej: Navidad, Año Nuevo"
              />
            </Field>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={formIsWeekend}
                onChange={(e) => setFormIsWeekend(e.target.checked)}
              />
              ¿Es fin de semana?
            </label>

            {formDate && isBusinessDayInfo && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold text-slate-600">Información de la fecha:</p>
                <p className="text-sm text-slate-700 mt-1">
                  {isBusinessDayInfo.businessDay
                    ? '✓ Es día hábil'
                    : '✗ No es día hábil (feriado o fin de semana)'}
                </p>
              </div>
            )}

            {createError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-xs font-semibold text-red-700">{createError}</p>
              </div>
            )}

            <button
              className={`${primaryButtonClass} w-full`}
              disabled={creating || !formDate || !formName.trim()}
              onClick={handleCreateHoliday}
            >
              {creating ? 'Agregando...' : 'Agregar feriado'}
            </button>
          </div>
        </Panel>

        {/* LISTA DE FERIADOS */}
        <Panel title="Feriados del año">
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-xs font-semibold text-red-700">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <p className="text-sm text-slate-600">Cargando feriados...</p>
            </div>
          ) : holidays.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-slate-600">No hay feriados registrados</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto space-y-2">
              {holidays.map((holiday) => (
                <div
                  key={holiday.holidayDate}
                  className="flex items-center justify-between rounded-lg border border-slate-200 p-3 hover:bg-slate-50 transition"
                >
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">{holiday.name}</p>
                    <p className="text-xs text-slate-600 mt-1">
                      {new Date(holiday.holidayDate + 'T00:00:00').toLocaleDateString('es-EC', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    {holiday.isWeekend && (
                      <span className="inline-block mt-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                        Fin de semana
                      </span>
                    )}
                  </div>
                  <button
                    className="ml-2 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition"
                    onClick={() => setDeleteConfirm(holiday.holidayDate)}
                    disabled={deleting}
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      {deleteConfirm && (
        <ConfirmDialog
          message={`¿Deseas eliminar este feriado? Esta acción no se puede deshacer.`}
          onConfirm={() => handleDeleteHoliday(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </PageShell>
  );
}
