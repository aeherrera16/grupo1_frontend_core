import { useState, useEffect } from 'react';
import { PageShell, Panel } from '../components/PageShell';
import { checkSftpStatus, uploadSftpMailboxFile } from '../services/apiClient';

export function SftpMailboxPage() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const cutoffHour = 18;
  const isAfterCutoff = currentTime.getHours() >= cutoffHour;
  const isWeekend = currentTime.getDay() === 0 || currentTime.getDay() === 6;
  const isQueuingTime = isAfterCutoff || isWeekend;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const data = await checkSftpStatus();
      setStatus(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleSimulatedUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setError('');
    try {
      await uploadSftpMailboxFile(selectedFile);
      setSelectedFile(null);
      await fetchStatus();
    } catch (err) {
      setError('Error en el transporte SFTP: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <PageShell 
      title="Buzón SFTP Empresarial" 
      description="Monitoreo de ingesta automatizada y cumplimiento de horarios de corte RF-01."
    >
      <div className="grid gap-8 lg:grid-cols-3">
        
        <div className="space-y-6">
          <Panel title="Reloj de Operaciones">
            <div className={`p-6 rounded-[2rem] border-2 transition-all ${isQueuingTime ? 'bg-amber-50 border-amber-200 shadow-amber-100' : 'bg-emerald-50 border-emerald-200 shadow-emerald-100'} shadow-xl`}>
              <div className="text-center">
                <p className="text-4xl font-black tracking-tighter text-slate-900">
                  {currentTime.toLocaleTimeString('es-EC', { hour12: false })}
                </p>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${isQueuingTime ? 'bg-amber-500' : 'bg-emerald-500'} animate-ping`} />
                  <p className={`text-[10px] font-black uppercase tracking-widest ${isQueuingTime ? 'text-amber-700' : 'text-emerald-700'}`}>
                    {isQueuingTime ? 'MODO ENCOLADO ACTIVO' : 'VENTANA DE PROCESAMIENTO'}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-black/5 space-y-3">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400 font-bold uppercase">Corte del día</span>
                  <span className="text-slate-900 font-black">18:00:00</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400 font-bold uppercase">Próximo proceso batch</span>
                  <span className="text-slate-900 font-black">00:01:00</span>
                </div>
              </div>
            </div>

            {isQueuingTime && (
              <div className="mt-4 p-4 bg-slate-900 text-white rounded-2xl">
                <p className="text-[11px] font-medium leading-relaxed italic">
                  "Nota: Los archivos detectados ahora serán procesados automáticamente el siguiente día hábil."
                </p>
              </div>
            )}
          </Panel>

          <Panel title="Infraestructura SFTP">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className={`h-2.5 w-2.5 rounded-full ${status?.healthy ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <span className="text-[11px] font-black text-slate-700">SERVER STATUS: {status?.healthy ? 'ONLINE' : 'OFFLINE'}</span>
              </div>
              <div className="text-[10px] space-y-2 px-1">
                <p className="text-slate-400 font-bold uppercase tracking-widest">Protocolo: <span className="text-slate-900 ml-2">SFTP/SSH</span></p>
                <p className="text-slate-400 font-bold uppercase tracking-widest">Puerto: <span className="text-slate-900 ml-4">22</span></p>
                <p className="text-slate-400 font-bold uppercase tracking-widest">Directorio: <span className="text-slate-900 ml-2">/upload/payments</span></p>
              </div>
            </div>
          </Panel>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Panel title="Explorador de Archivos en Buzón">
            <div className="overflow-hidden rounded-2xl border border-slate-100">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Nombre del Archivo</th>
                    <th className="px-6 py-4">Tamaño</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {status?.files?.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-20 text-center">
                        <div className="flex flex-col items-center gap-3 opacity-30">
                          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                          <p className="text-xs font-black uppercase tracking-[0.2em]">Buzón Vacío</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    status?.files?.map((file, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-banker-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            <span className="text-sm font-bold text-slate-900">{file.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-xs text-slate-500 font-bold">{file.size}</td>
                        <td className="px-6 py-5">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${isQueuingTime ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {isQueuingTime ? 'Encolado' : 'Listo para Procesar'}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button className="text-[10px] font-black text-banker-blue hover:underline">DETALLES</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel title="Simulador de Transporte Seguro">
            <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2v-2zm0-6h2v4h-2v-4z"/></svg>
              </div>
              
              <h4 className="text-xl font-black tracking-tight mb-2">Simulación de Ingesta ERP</h4>
              <p className="text-slate-400 text-xs font-medium mb-8 leading-relaxed max-w-md">
                Arrastre un archivo CSV para simular que su ERP lo está depositando en nuestro servidor SFTP.
              </p>

              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-1 w-full">
                  <div className="relative group border-2 border-dashed border-white/20 rounded-2xl p-6 text-center transition-all hover:border-white/40 hover:bg-white/5">
                    <input 
                      type="file" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => setSelectedFile(e.target.files[0])}
                    />
                    <p className="text-xs font-bold text-white/60 uppercase tracking-widest">
                      {selectedFile ? selectedFile.name : 'Seleccionar Archivo .CSV'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleSimulatedUpload}
                  disabled={!selectedFile || uploading}
                  className="px-8 py-5 bg-white text-slate-900 rounded-2xl text-xs font-black uppercase tracking-widest transition-all hover:bg-emerald-400 active:scale-95 disabled:bg-white/10 disabled:text-white/20"
                >
                  {uploading ? 'ENCRIPTANDO Y SUBIENDO...' : 'SUBIR A SFTP'}
                </button>
              </div>
            </div>
          </Panel>
        </div>
      </div>

      {error && (
        <div className="mt-8 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold animate-in shake duration-300">
          ✗ {error}
        </div>
      )}
    </PageShell>
  );
}
