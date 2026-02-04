
import React, { useState, useRef } from 'react';
import { Search, Info, CheckCircle2, Upload, Download, X, AlertTriangle, FileSpreadsheet } from 'lucide-react';
import { OPD, ProgressData } from '../types';
import { formatReportNumber } from '../utils';

interface ProgressInputProps {
  opds: OPD[];
  progress: ProgressData[];
  onUpdate: (data: ProgressData) => void;
  onBulkUpdate: (data: ProgressData[]) => void;
}

const ProgressInput: React.FC<ProgressInputProps> = ({ opds, progress, onUpdate, onBulkUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOpdId, setSelectedOpdId] = useState<string | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredOpds = opds.filter(o => o.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const currentProgress = progress.find(p => p.opdId === selectedOpdId);

  const handleInputChange = (field: keyof ProgressData, value: string | number) => {
    if (!selectedOpdId || !currentProgress) return;
    const numericValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
    const updatedData: ProgressData = {
      ...currentProgress,
      [field]: numericValue,
      updatedAt: new Date().toISOString()
    };
    onUpdate(updatedData);
  };

  // Fungsi Unduh Template CSV
  const downloadTemplate = () => {
    const headers = ["ID OPD", "Nama Satuan Kerja", "Paket Penyedia", "Pagu Penyedia", "Paket Swakelola", "Pagu Swakelola", "Paket PdS", "Pagu PdS"];
    const rows = progress.map(p => {
      const opd = opds.find(o => o.id === p.opdId);
      return [p.opdId, `"${opd?.name}"`, p.todayPenyediaPaket, p.todayPenyediaPagu, p.todaySwakelolaPaket, p.todaySwakelolaPagu, p.todayPdSPaket, p.todayPdSPagu];
    });
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'TEMPLATE_INPUT_SIRUP_2026.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Fungsi Proses Unggah CSV
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n');
        const newProgressData: ProgressData[] = [];
        
        // Mulai dari baris ke-1 (skip header)
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          // Split CSV dengan koma, tapi abaikan koma di dalam tanda kutip (nama OPD)
          const parts = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
          if (parts && parts.length >= 8) {
            const opdId = parts[0].replace(/"/g, '');
            const existing = progress.find(p => p.opdId === opdId);
            
            if (existing) {
              newProgressData.push({
                ...existing,
                todayPenyediaPaket: parseInt(parts[2]) || 0,
                todayPenyediaPagu: parseFloat(parts[3]) || 0,
                todaySwakelolaPaket: parseInt(parts[4]) || 0,
                todaySwakelolaPagu: parseFloat(parts[5]) || 0,
                todayPdSPaket: parseInt(parts[6]) || 0,
                todayPdSPagu: parseFloat(parts[7]) || 0,
                updatedAt: new Date().toISOString()
              });
            }
          }
        }

        if (newProgressData.length > 0) {
          onBulkUpdate(newProgressData);
          setIsImportModalOpen(false);
          setImportError(null);
          alert(`Berhasil mengimpor data progres untuk ${newProgressData.length} OPD.`);
        } else {
          setImportError("Tidak ada data valid yang ditemukan dalam file.");
        }
      } catch (err) {
        setImportError("Format file tidak didukung atau rusak.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Input Data Progres</h2>
          <p className="text-sm text-slate-500">Update progres input harian manual atau impor massal.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
          >
            <Upload size={18} />
            Impor Massal (Excel/CSV)
          </button>
          {selectedOpdId && (
            <div className="hidden sm:flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-2 rounded-xl border border-emerald-100">
              <CheckCircle2 size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Auto-Sync</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daftar Satuan Kerja */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-[calc(100vh-250px)] flex flex-col">
          <div className="p-4 bg-slate-50 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" placeholder="Cari Satuan Kerja..." 
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 custom-scrollbar">
            {filteredOpds.map(opd => (
              <button 
                key={opd.id} 
                onClick={() => setSelectedOpdId(opd.id)}
                className={`w-full text-left p-4 hover:bg-blue-50 transition-colors flex justify-between items-center group ${selectedOpdId === opd.id ? 'bg-blue-50 border-r-4 border-blue-600' : ''}`}
              >
                <div className="flex-1 min-w-0 pr-2">
                  <p className={`text-xs leading-relaxed line-clamp-2 ${selectedOpdId === opd.id ? 'font-bold text-blue-900' : 'text-slate-600 font-medium'}`}>
                    {opd.name}
                  </p>
                </div>
                {selectedOpdId === opd.id && <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>}
              </button>
            ))}
          </div>
        </div>

        {/* Panel Editor Progres */}
        <div className="lg:col-span-2">
          {selectedOpdId && currentProgress ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-start justify-between border-b border-slate-100 pb-6">
                <div>
                  <h3 className="font-bold text-xl text-slate-900 mb-2">
                    {opds.find(o => o.id === selectedOpdId)?.name}
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-bold">
                      <span className="opacity-70 uppercase">Pagu Pengadaan:</span>
                      <span>Rp {formatReportNumber(currentProgress.paguTarget)} Jt</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Penyedia */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-blue-100">
                    <div className="w-2 h-4 bg-blue-500 rounded-full"></div>
                    <h4 className="font-bold text-sm text-slate-800 uppercase tracking-tight">Penyedia</h4>
                  </div>
                  <div className="space-y-4">
                    <InputGroup label="Jumlah Paket" value={currentProgress.todayPenyediaPaket} onChange={(val) => handleInputChange('todayPenyediaPaket', val)} />
                    <InputGroup label="Pagu (Jutaan Rp)" value={currentProgress.todayPenyediaPagu} onChange={(val) => handleInputChange('todayPenyediaPagu', val)} isCurrency />
                  </div>
                </div>

                {/* Swakelola */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-emerald-100">
                    <div className="w-2 h-4 bg-emerald-500 rounded-full"></div>
                    <h4 className="font-bold text-sm text-slate-800 uppercase tracking-tight">Swakelola</h4>
                  </div>
                  <div className="space-y-4">
                    <InputGroup label="Jumlah Paket" value={currentProgress.todaySwakelolaPaket} onChange={(val) => handleInputChange('todaySwakelolaPaket', val)} />
                    <InputGroup label="Pagu (Jutaan Rp)" value={currentProgress.todaySwakelolaPagu} onChange={(val) => handleInputChange('todaySwakelolaPagu', val)} isCurrency />
                  </div>
                </div>

                {/* PdS */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-orange-100">
                    <div className="w-2 h-4 bg-orange-500 rounded-full"></div>
                    <h4 className="font-bold text-sm text-slate-800 uppercase tracking-tight">Penyedia dlm Swa</h4>
                  </div>
                  <div className="space-y-4">
                    <InputGroup label="Jumlah Paket" value={currentProgress.todayPdSPaket} onChange={(val) => handleInputChange('todayPdSPaket', val)} />
                    <InputGroup label="Pagu (Jutaan Rp)" value={currentProgress.todayPdSPagu} onChange={(val) => handleInputChange('todayPdSPagu', val)} isCurrency />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl flex items-start gap-3 border border-slate-100">
                <Info size={18} className="text-slate-400 mt-0.5" />
                <p className="text-xs text-slate-500 leading-relaxed italic">
                  Data yang diinput otomatis diakumulasikan ke dalam <strong>Total Terumumkan</strong> di Laporan Resmi. 
                </p>
              </div>
            </div>
          ) : (
            <div className="h-[400px] border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 gap-4 bg-white/50">
              <div className="p-4 bg-white rounded-full shadow-sm">
                <Search size={32} className="text-slate-300" />
              </div>
              <p className="font-medium text-sm">Pilih Satuan Kerja di panel kiri untuk mulai mengisi progres.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Impor Massal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <FileSpreadsheet size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Impor Massal Progres</h3>
                  <p className="text-xs text-slate-400">Update data via file CSV/Excel</p>
                </div>
              </div>
              <button onClick={() => setIsImportModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-blue-100 bg-blue-50 rounded-xl space-y-3">
                  <p className="text-xs font-bold text-blue-900 uppercase">Langkah 1: Download</p>
                  <p className="text-[11px] text-blue-700 leading-relaxed">Gunakan template yang sudah berisi daftar OPD Anda agar tidak terjadi kesalahan ID.</p>
                  <button onClick={downloadTemplate} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors">
                    <Download size={14} /> Download Template
                  </button>
                </div>
                <div className="p-4 border border-slate-200 bg-slate-50 rounded-xl space-y-3">
                  <p className="text-xs font-bold text-slate-900 uppercase">Langkah 2: Upload</p>
                  <p className="text-[11px] text-slate-600 leading-relaxed">Pastikan file dalam format .CSV (Comma Separated Values) dan angka menggunakan titik (.)</p>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".csv" />
                  <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-2 rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors">
                    <Upload size={14} /> Pilih & Unggah File
                  </button>
                </div>
              </div>

              {importError && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-start gap-3">
                  <AlertTriangle size={18} className="shrink-0" />
                  <p className="text-xs font-bold">{importError}</p>
                </div>
              )}

              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 space-y-2">
                <h4 className="text-xs font-bold text-amber-900 uppercase flex items-center gap-2">
                  <Info size={14} /> Catatan Penting
                </h4>
                <ul className="text-[10px] text-amber-800 space-y-1 list-disc pl-4">
                  <li>Jangan mengubah kolom <strong>ID OPD</strong> karena itu kunci sinkronisasi data.</li>
                  <li>Isi kolom Paket dengan angka bulat (Integer).</li>
                  <li>Isi kolom Pagu dengan angka desimal (Gunakan titik sebagai pemisah, bukan koma).</li>
                  <li>Gunakan aplikasi Excel atau Google Sheets untuk mengedit file template.</li>
                </ul>
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 border-t flex justify-end">
              <button onClick={() => setIsImportModalOpen(false)} className="px-6 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InputGroup: React.FC<{ label: string, value: number, onChange: (val: string) => void, isCurrency?: boolean }> = ({ 
  label, value, onChange, isCurrency 
}) => (
  <div>
    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1 tracking-wider">{label}</label>
    <div className="relative group">
      {isCurrency && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold pointer-events-none group-focus-within:text-blue-500 transition-colors">Rp</span>
      )}
      <input 
        type="number" 
        step="0.01"
        className={`w-full p-2.5 text-sm font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${isCurrency ? 'pl-8' : ''}`}
        value={value === 0 ? '' : value} 
        placeholder="0"
        onChange={e => onChange(e.target.value)} 
      />
    </div>
  </div>
);

export default ProgressInput;
