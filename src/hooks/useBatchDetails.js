import { useState, useCallback, useRef, useEffect } from 'react';
import {
  getBatchDetails,
  downloadComprobante,
  downloadNovedades,
} from '../services/apiClient';

export function useBatchDetails() {
  const [batchDetails, setBatchDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isDownloadingComprobante, setIsDownloadingComprobante] = useState(false);
  const [isDownloadingNovedades, setIsDownloadingNovedades] = useState(false);
  const [error, setError] = useState(null);

  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchBatchDetails = useCallback(async (batchId) => {
    if (!isMountedRef.current) return null;

    setIsLoadingDetails(true);
    setError(null);

    try {
      const details = await getBatchDetails(batchId);
      if (isMountedRef.current) {
        setBatchDetails(details);
      }
      return details;
    } catch (err) {
      if (isMountedRef.current) {
        const errorMsg = err.message || 'Error al cargar los detalles del lote';
        setError(errorMsg);
        console.error('Error fetching batch details:', err);
      }
      throw err;
    } finally {
      if (isMountedRef.current) {
        setIsLoadingDetails(false);
      }
    }
  }, []);

  const downloadComprobante = useCallback(async (batchId) => {
    if (!isMountedRef.current) return;

    setIsDownloadingComprobante(true);
    setError(null);

    try {
      await downloadComprobante(batchId);
    } catch (err) {
      if (isMountedRef.current) {
        const errorMsg = err.message || 'Error al descargar el comprobante';
        setError(errorMsg);
        console.error('Error downloading comprobante:', err);
      }
      throw err;
    } finally {
      if (isMountedRef.current) {
        setIsDownloadingComprobante(false);
      }
    }
  }, []);

  const downloadNovedades = useCallback(async (batchId) => {
    if (!isMountedRef.current) return;

    setIsDownloadingNovedades(true);
    setError(null);

    try {
      await downloadNovedades(batchId);
    } catch (err) {
      if (isMountedRef.current) {
        const errorMsg = err.message || 'Error al descargar el reporte de novedades';
        setError(errorMsg);
        console.error('Error downloading novedades:', err);
      }
      throw err;
    } finally {
      if (isMountedRef.current) {
        setIsDownloadingNovedades(false);
      }
    }
  }, []);

  const clearError = useCallback(() => {
    if (isMountedRef.current) {
      setError(null);
    }
  }, []);

  const reset = useCallback(() => {
    if (isMountedRef.current) {
      setBatchDetails(null);
      setError(null);
      setIsLoadingDetails(false);
      setIsDownloadingComprobante(false);
      setIsDownloadingNovedades(false);
    }
  }, []);

  return {
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
  };
}
