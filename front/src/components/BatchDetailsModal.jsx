import { useEffect } from 'react';
import { useBatchDetails } from '../hooks/useBatchDetails';

export function BatchDetailsModal({ batchId, isOpen, onClose }) {
  const {
    batchDetails,
    isLoadingDetails,
    isDownloadingComprobante,
    isDownloadingNovedades,
    error,
    fetchBatchDetails,
    downloadComprobante,
    downloadNovedades,
    clearError,
    reset,
  } = useBatchDetails();

  useEffect(() => {
    if (isOpen && batchId) {
      fetchBatchDetails(batchId);
    } else {
      reset();
    }
  }, [isOpen, batchId, fetchBatchDetails, reset]);

  const handleDownloadComprobante = async () => {
    try {
      await downloadComprobante(batchId);
    } catch (err) {
      console.error('Error downloading comprobante:', err);
    }
  };

  const handleDownloadNovedades = async () => {
    try {
      await downloadNovedades(batchId);
    } catch (err) {
      console.error('Error downloading novedades:', err);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-red-900 to-red-800 text-white p-8 flex justify-between items-center border-b border-red-700">
          <div>
            <p className="text-red-200 text-sm uppercase tracking-widest font-semibold mb-1">Detalle del Lote</p>
            <h2 className="text-3xl font-bold">Lote #{batchId}</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:bg-red-700 rounded-lg p-2 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <p className="text-red-700 font-semibold">{error}</p>
            </div>
          )}

          {isLoadingDetails ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-900 border-t-transparent"></div>
            </div>
          ) : batchDetails ? (
            <>
              {/* Estado del Lote */}
              <div className="mb-10">
                <h3 className="text-2xl font-bold text-red-900 mb-6">Estado del Lote</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200">
                    <p className="text-sm text-red-700 font-semibold mb-2 uppercase tracking-wider">Archivo</p>
                    <p className="font-bold text-red-900">{batchDetails.fileName}</p>
                  </div>
                  <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200">
                    <p className="text-sm text-red-700 font-semibold mb-2 uppercase tracking-wider">RUC</p>
                    <p className="font-bold text-red-900">{batchDetails.ruc}</p>
                  </div>
                  <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200">
                    <p className="text-sm text-red-700 font-semibold mb-2 uppercase tracking-wider">Estado</p>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        batchDetails.status === 'PROCESSED'
                          ? 'bg-green-200 text-green-900'
                          : batchDetails.status === 'QUEUED'
                          ? 'bg-amber-200 text-amber-900'
                          : 'bg-red-200 text-red-900'
                      }`}>
                        {batchDetails.status}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200">
                    <p className="text-sm text-red-700 font-semibold mb-2 uppercase tracking-wider">Fecha</p>
                    <p className="font-bold text-red-900">
                      {new Date(batchDetails.receivedAt).toLocaleDateString('es-EC')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Resumen Financiero */}
              <div className="mb-10">
                <h3 className="text-2xl font-bold text-red-900 mb-6">Resumen Financiero</h3>

                {/* Estadísticas de Registros */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                    <p className="text-xs text-blue-700 font-semibold uppercase tracking-wider mb-2">Total Registros</p>
                    <p className="text-3xl font-bold text-blue-900">{batchDetails.totalRecords}</p>
                  </div>
                  <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                    <p className="text-xs text-green-700 font-semibold uppercase tracking-wider mb-2">Exitosos</p>
                    <p className="text-3xl font-bold text-green-900">{batchDetails.successfulRecords}</p>
                  </div>
                  <div className="bg-red-50 p-6 rounded-xl border border-red-200">
                    <p className="text-xs text-red-700 font-semibold uppercase tracking-wider mb-2">Rechazados</p>
                    <p className="text-3xl font-bold text-red-900">{batchDetails.rejectedRecords}</p>
                  </div>
                  <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                    <p className="text-xs text-purple-700 font-semibold uppercase tracking-wider mb-2">Monto Total</p>
                    <p className="text-3xl font-bold text-purple-900">
                      ${batchDetails.totalAmount?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>

                {/* Desglose de Comisiones */}
                <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-900 p-8 rounded-xl">
                  <h4 className="text-sm font-bold text-red-700 uppercase tracking-widest mb-6">Desglose de Comisiones</h4>
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <p className="text-red-700 text-sm mb-2">Comisión (Subtotal)</p>
                      <p className="text-3xl font-bold text-red-900">
                        ${batchDetails.commissionSubtotal?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                    <div>
                      <p className="text-red-700 text-sm mb-2">IVA (15%)</p>
                      <p className="text-3xl font-bold text-red-900">
                        ${batchDetails.vatAmount?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                    <div className="border-l-2 border-red-300 pl-6">
                      <p className="text-red-700 text-sm mb-2">Total a Cobrar</p>
                      <p className="text-4xl font-bold text-red-900">
                        ${batchDetails.totalCharge?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleDownloadComprobante}
                  disabled={isDownloadingComprobante || isDownloadingNovedades}
                  className="px-6 py-4 bg-red-900 hover:bg-red-800 disabled:bg-red-300 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  {isDownloadingComprobante ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Descargando...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      Comprobante
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownloadNovedades}
                  disabled={isDownloadingComprobante || isDownloadingNovedades}
                  className="px-6 py-4 border-2 border-red-900 text-red-900 hover:bg-red-50 disabled:border-red-300 disabled:text-red-300 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                >
                  {isDownloadingNovedades ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-red-900 border-t-transparent"></div>
                      Descargando...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      Novedades
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <button
                onClick={() => fetchBatchDetails(batchId)}
                className="px-6 py-3 bg-red-900 text-white rounded-lg font-bold hover:bg-red-800 transition-colors"
              >
                Cargar Detalles
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
