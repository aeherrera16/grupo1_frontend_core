import { useState, useEffect } from 'react';
import { Field, inputClass, PageShell, Panel, primaryButtonClass, secondaryButtonClass } from '../components/PageShell';
import { getPaymentBatches, uploadPaymentBatch, downloadComprobante, downloadNovedades } from '../services/apiClient';

function ErrorMessage({ message }) {
  return (
    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
      <p className="text-sm font-semibold text-red-700">✗ {message}</p>
    </div>
  );
}

function SuccessMessage({ message }) {
  return (
    <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
      <p className="text-sm font-semibold text-green-700">✓ {message}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const statusColors = {
    PROCESADO: 'bg-green-100 text-green-800',
    RECHAZADO: 'bg-red-100 text-red-800',
    ENCOLADO: 'bg-yellow-100 text-yellow-800',
    'En Proceso': 'bg-blue-100 text-blue-800',
    Validado: 'bg-cyan-100 text-cyan-800',
    Recibido: 'bg-slate-100 text-slate-800',
  };

  const colorClass = statusColors[status] || 'bg-slate-100 text-slate-800';
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${colorClass}`}>
      {status}
    </span>
  );
}

export function PagosMasivosPage() {
  const [file, setFile] = useState(null);
  const [batchId, setBatchId] = useState('');
  const [batches, setBatches] = useState([]);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [batchesLoading, setBatchesLoading] = useState(true);
  const [batchesError, setBatchesError] = useState('');
  const [downloadingBatchId, setDownloadingBatchId] = useState(null);

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    setBatchesLoading(true);
    setBatchesError('');
    try {
      const data = await getPaymentBatches();
      setBatches(Array.isArray(data) ? data : data.batches || []);
    } catch (err) {
      setBatchesError(err.message);
    } finally {
      setBatchesLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploadLoading(true);
    setUploadError('');
    setUploadSuccess('');
    try {
      await uploadPaymentBatch(file, 'PORTAL');
      setUploadSuccess(`Archivo "${file.name}" validado y cargado correctamente`);
      setFile(null);
      await loadBatches();
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDownload = async (batchIdToDownload, type) => {
    setDownloadingBatchId(batchIdToDownload);
    try {
      if (type === 'comprobante') {
        await downloadComprobante(batchIdToDownload);
      } else {
        await downloadNovedades(batchIdToDownload);
      }
    } catch (err) {
      alert(`Error descargando ${type}: ${err.message}`);
    } finally {
      setDownloadingBatchId(null);
    }
  };

  return (
    <PageShell
      title="Pagos masivos"
      description="Supervisión de lotes recibidos por Portal Web o SFTP, con validación RF-02 y procesamiento por batch."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* PANEL DE CARGA */}
        <Panel title="Carga por Portal Web">
          <div className="rounded-lg border border-dashed border-slate-300 p-5">
            <Field label="Archivo CSV">
              <input
                className={inputClass}
                type="file"
                accept=".csv,text/csv"
                onChange={(event) => setFile(event.target.files?.[0] || null)}
                disabled={uploadLoading}
              />
            </Field>
            <p className="mt-3 text-sm text-slate-600">
              Formato esperado: cabecera con RUC, tipo de servicio, fecha, cuenta origen, total de registros y monto total; detalle línea por línea.
            </p>
            <button
              className={`${primaryButtonClass} mt-5 w-full`}
              disabled={uploadLoading || !file}
              onClick={handleUpload}
            >
              {uploadLoading ? 'Validando...' : 'Validar y cargar'}
            </button>
          </div>
          {uploadSuccess && <SuccessMessage message={uploadSuccess} />}
          {uploadError && <ErrorMessage message={uploadError} />}
        </Panel>

        {/* PANEL DE DESCARGA RÁPIDA */}
        <Panel title="Descarga rápida">
          <div className="flex flex-col gap-3">
            <Field label="ID lote">
              <input
                className={inputClass}
                value={batchId}
                onChange={(event) => setBatchId(event.target.value)}
                placeholder="Ej: 12345"
              />
            </Field>
            <button
              className={`${primaryButtonClass} w-full text-sm`}
              disabled={!batchId || downloadingBatchId === batchId}
              onClick={() => handleDownload(batchId, 'comprobante')}
            >
              {downloadingBatchId === batchId ? 'Descargando...' : 'Comprobante'}
            </button>
            <button
              className={`${secondaryButtonClass} w-full text-sm`}
              disabled={!batchId || downloadingBatchId === batchId}
              onClick={() => handleDownload(batchId, 'novedades')}
            >
              {downloadingBatchId === batchId ? 'Descargando...' : 'Novedades'}
            </button>
          </div>
        </Panel>
      </div>

      {/* TABLA DE LOTES */}
      <Panel title="Historial de lotes">
        {batchesLoading ? (
          <div className="text-center py-8 text-slate-600">Cargando lotes...</div>
        ) : batchesError ? (
          <ErrorMessage message={batchesError} />
        ) : batches.length === 0 ? (
          <div className="text-center py-8 text-slate-600">No hay lotes registrados</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900">ID lote</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900">Fecha</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900">Estado</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-900">Total</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-900">Válidos</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-900">Rechazados</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-900">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((batch) => (
                  <tr key={batch.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-slate-900">{batch.id}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {batch.date ? new Date(batch.date).toLocaleDateString('es-EC') : 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={batch.status} />
                    </td>
                    <td className="px-4 py-3 text-right text-slate-900 font-semibold">
                      {batch.totalRecords || 0}
                    </td>
                    <td className="px-4 py-3 text-right text-green-700 font-semibold">
                      {batch.validRecords || 0}
                    </td>
                    <td className="px-4 py-3 text-right text-red-700 font-semibold">
                      {batch.rejectedRecords || 0}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                          disabled={downloadingBatchId === batch.id}
                          onClick={() => handleDownload(batch.id, 'comprobante')}
                        >
                          Comprobante
                        </button>
                        <button
                          className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50"
                          disabled={downloadingBatchId === batch.id}
                          onClick={() => handleDownload(batch.id, 'novedades')}
                        >
                          Novedades
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* INFO REFERENCE */}
      <Panel title="Referencia de estados">
        <div className="grid gap-3 text-sm text-slate-700">
          <p><strong>Estados del lote:</strong> Recibido, Validado, En Proceso, Procesado, Rechazado, Encolado.</p>
          <p><strong>Estados del detalle:</strong> Pendiente, Exitoso, Rechazado.</p>
          <p><strong>Canales del Switch:</strong> Portal Web y SFTP Seguro.</p>
        </div>
      </Panel>
    </PageShell>
  );
}
