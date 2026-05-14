import { useState } from 'react';
import { uploadPaymentBatch } from '../services/apiClient';

export function useMassivePayments() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const uploadFile = async (file) => {
    setSelectedFile(file);
    setIsUploading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await uploadPaymentBatch(file, 'PORTAL');
      setResponse(result);
      setSelectedFile(null);
      return result;
    } catch (err) {
      const errorMessage = err.error || err.message || 'Error desconocido al procesar el archivo';
      setError({
        message: errorMessage,
        rejectedEarly: err.rejectedEarly || false,
      });
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  const resetState = () => {
    setSelectedFile(null);
    setResponse(null);
    setError(null);
  };

  return {
    selectedFile,
    setSelectedFile,
    isUploading,
    response,
    error,
    uploadFile,
    resetState,
  };
}
