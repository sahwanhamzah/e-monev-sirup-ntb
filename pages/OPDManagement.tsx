
import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, X, Save, Building2, Wallet } from 'lucide-react';
import { OPD } from '../types';
import { formatCurrencyMillions } from '../utils';

interface OPDManagementProps {
  opds: OPD[];
  onSave: (opd: OPD) => void;
  onDelete: (id: string) => void;
}

const OPDManagement: React.FC<OPDManagementProps> = ({ opds, onSave, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOpd, setEditingOpd] = useState<OPD | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOpds = opds.filter(o => o.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleOpenModal = (item?: OPD) => {
    if (item) {
      setEditingOpd(item);
    } else {
      setEditingOpd({
        id: Math.random().toString(36).substr(2, 9),
        name: '',
        paguMurni: 0
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingOpd) onSave(editingOpd);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Data Master OPD</h2>
          <p className="text-slate-500">Kelola daftar Satuan Kerja dan Pagu Pengadaan (Murni).</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-[#d9534f] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold text-sm hover:bg-red-700 shadow-lg shadow-red-100 transition-all"
        >
          <Plus size={18} /> Tambah OPD
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" placeholder="Cari Nama OPD..." 
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="hidden md:block text-xs font-bold text-slate-400 uppercase tracking-widest">
            Total: {opds.length} Satker
          </div>
        </div>
        
        <div className="overflow-x-auto max-h-[600px] custom-scrollbar">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
              <tr>
                <th className="p-4 font-bold text-slate-500 uppercase text-[10px]">Nama Satuan Kerja</th>
                <th className="p-4 font-bold text-slate-500 uppercase text-[10px] text-right">Pagu Murni (Jutaan)</th>
                <th className="p-4 font-bold text-slate-500 uppercase text-[10px] text-center w-32">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOpds.length > 0 ? filteredOpds.map((opd) => (
                <tr key={opd.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-slate-800 uppercase tracking-tight text-xs">{opd.name}</p>
                  </td>
                  <td className="p-4 text-right font-black text-blue-600">
                    Rp {formatCurrencyMillions(opd.paguMurni)}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleOpenModal(opd)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => { if(confirm('Hapus OPD ini?')) onDelete(opd.id) }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3} className="p-12 text-center text-slate-400 italic">Data OPD tidak ditemukan...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && editingOpd && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-[#d9534f] text-white p-6 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Building2 size={24} />
                <h3 className="font-bold text-lg">{editingOpd.name ? 'Edit OPD' : 'Tambah OPD'}</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Nama Satuan Kerja</label>
                <input 
                  required 
                  value={editingOpd.name} 
                  onChange={e => setEditingOpd({...editingOpd, name: e.target.value})}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800" 
                  placeholder="Contoh: Dinas Kesehatan" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Pagu Murni (Dalam Jutaan Rupiah)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">Rp</span>
                  <input 
                    type="number" 
                    required 
                    value={editingOpd.paguMurni || ''} 
                    onChange={e => setEditingOpd({...editingOpd, paguMurni: parseFloat(e.target.value) || 0})}
                    className="w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-black text-blue-600" 
                    placeholder="0" 
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-2 italic font-medium">* Angka ini digunakan sebagai pembagi (Target) dalam laporan.</p>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">Batal</button>
                <button type="submit" className="flex-[2] bg-[#d9534f] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-700 shadow-lg shadow-red-100">
                  <Save size={18} /> Simpan Data OPD
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OPDManagement;
