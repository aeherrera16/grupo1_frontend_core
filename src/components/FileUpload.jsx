import { useRef, useState } from 'react';

export function FileUpload({ selectedFile, isUploading, onUpload }) {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(selectedFile);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const selectedFile = files[0];
      if (isValidFile(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      const selectedFile = files[0];
      if (isValidFile(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };

  const isValidFile = (selectedFile) => {
    const validTypes = ['text/plain', 'text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    const validExtensions = ['.txt', '.csv'];

    const hasValidType = validTypes.includes(selectedFile.type);
    const hasValidExtension = validExtensions.some(ext => selectedFile.name.toLowerCase().endsWith(ext));

    if (!hasValidType && !hasValidExtension) {
      alert('Solo se permiten archivos .txt o .csv');
      return false;
    }

    const maxSize = 50 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      alert('El archivo no puede exceder 50MB');
      return false;
    }

    return true;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleClearFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${
          dragOver
            ? 'border-banker-blue bg-banker-blue/5'
            : 'border-gray-300 bg-white hover:border-banker-blue'
        } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-banker-blue/10 rounded-lg flex items-center justify-center">
            <svg className="w-8 h-8 text-banker-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p className="text-lg font-semibold text-banker-navy mb-2">
              {file ? 'Archivo seleccionado' : 'Arrastra tu archivo aquí'}
            </p>
            <p className="text-sm text-banker-gray">
              {file
                ? file.name
                : 'O haz clic para seleccionar un archivo .csv o .txt'}
            </p>
          </div>

          {file && (
            <div className="text-sm text-banker-gray bg-gray-50 px-4 py-2 rounded-lg">
              {formatFileSize(file.size)}
            </div>
          )}

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="mt-4 px-6 py-2 bg-banker-blue text-white rounded-lg font-semibold hover:bg-banker-navy transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {file ? 'Seleccionar otro archivo' : 'Seleccionar archivo'}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt"
            onChange={handleFileInputChange}
            className="hidden"
            disabled={isUploading}
          />
        </div>
      </div>

      {file && (
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => onUpload(file)}
            disabled={isUploading}
            className="flex-1 px-6 py-3 bg-banker-gold text-banker-navy font-bold rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Procesando...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                Subir archivo
              </>
            )}
          </button>
          <button
            onClick={handleClearFile}
            disabled={isUploading}
            className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Limpiar
          </button>
        </div>
      )}
    </div>
  );
}
