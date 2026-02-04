
import React, { useRef, useState } from 'react';
import { Download, Upload, AlertTriangle, FileJson, CheckCircle2, Loader2, ShieldCheck, Database } from 'lucide-react';
import { OPD, ProgressData, NewsItem, SystemSettings, User } from '../types';

interface BackupRestoreProps {
  currentData: {
    opds: OPD[];
    progress: ProgressData[];
    news: NewsItem[];
    settings: SystemSettings;
    users: User[];
  };
  onRestore: (data: any) => Promise<void>;
}

const BackupRestore: React.FC<BackupRestoreProps> = ({ currentData, onRestore }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // FUNGSI BACKUP
  const handleBackup = () => {
    try {
      setIsProcessing(true);
      const dataStr = JSON.stringify(currentData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0];
      link.href = url;
      link.setAttribute('download', `BACKUP_SIRUP_NTB_FULL_${timestamp}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setStatus({ type: 'success', message: 'File backup berhasil dibuat dan diunduh.' });
    } catch (err) {
      setStatus({ type: 'error', message: 'Gagal membuat file backup.' });
    } finally {
      setIsProcessing(false);
    }
  };

  // FUNGSI RESTORE
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        setIsProcessing(true);
        const json = JSON.parse(event.target?.result as string);
        
        // Validasi struktur sederhana
        if (!json.opds || !json.progress || !json.settings) {
          throw new Error("Struktur file backup tidak valid.");
        }

        if (confirm("PERINGATAN: Proses ini akan menimpa seluruh data saat ini dengan data dari file backup. Lanjutkan?")) {
          await onRestore(json);
          setStatus({ type: 'success', message: 'Data berhasil dipulihkan (Restore) ke sistem.' });
        }
      } catch (err) {
        setStatus({ type: 'error', message: 'Gagal membaca file: Pastikan file adalah format backup asli.' });
      } finally {
        setIsProcessing(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
          <Database className="text-[#d9534f]" /> 
          Pusat Kendali Data (Backup & Restore)
        </h2>
        <p className="text-slate-500 mt-1">Kelola salinan basis data aplikasi secara mandiri untuk keamanan ekstra.</p>
      </div>

      {status.type && (
        <div className={`p-4 rounded-2xl border flex items-center gap-4 ${status.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
          {status.type === 'success' ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
          <p className="text-sm font-bold">{status.message}</p>
          <button onClick={() => setStatus({ type: null, message: '' })} className="ml-auto text-xs font-black uppercase opacity-50 hover:opacity-100">Tutup</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Card Export */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-blue-100 group-hover:scale-110 transition-transform">
            <Download size={28} />
          </div>
          <h3 className="text-xl font-black text-slate-800 mb-3 tracking-tight">Ekspor Data Lengkap</h3>
          <p className="text-slate-500 text-sm leading-relaxed mb-8">
            Unduh seluruh database (OPD, Progres, Berita, & Pengaturan) dalam satu file format JSON. Gunakan ini sebagai arsip mingguan atau cadangan manual.
          </p>
          <button 
            onClick={handleBackup}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
          >
            {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <FileJson size={18} />}
            Unduh Cadangan (.json)
          </button>
        </div>

        {/* Card Import */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-orange-100 group-hover:scale-110 transition-transform">
            <Upload size={28} />
          </div>
          <h3 className="text-xl font-black text-slate-800 mb-3 tracking-tight">Impor / Restore Data</h3>
          <p className="text-slate-500 text-sm leading-relaxed mb-8">
            Kembalikan data dari file cadangan sebelumnya. <strong className="text-red-600 font-bold uppercase text-[10px] tracking-widest">Peringatan:</strong> Data saat ini di sistem akan dihapus dan diganti sepenuhnya.
          </p>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json" />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-3 bg-[#d9534f] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-700 transition-all shadow-lg shadow-red-100 active:scale-95 disabled:opacity-50"
          >
            {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
            Pilih File & Restore
          </button>
        </div>
      </div>

      <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <ShieldCheck size={120} />
        </div>
        <div className="flex items-start gap-6 relative z-10">
          <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md">
            <AlertTriangle className="text-amber-400" size={32} />
          </div>
          <div className="space-y-3">
            <h4 className="text-lg font-black uppercase tracking-widest text-amber-400">Kebijakan Keamanan Data</h4>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">
              Sistem melakukan sinkronisasi otomatis ke Cloud setiap kali Anda melakukan perubahan. Gunakan fitur Backup ini jika Anda ingin berpindah database Cloud atau melakukan migrasi data antar akun. Simpan file cadangan di tempat yang aman dan jangan membagikannya kepada pihak yang tidak berwenang karena berisi data sensitif seluruh Satker.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Sistem Enkripsi Cloud Aktif</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupRestore;
