
import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, X, Save, Newspaper, Calendar } from 'lucide-react';
import { NewsItem } from '../types';

interface NewsManagementProps {
  news: NewsItem[];
  onSave: (news: NewsItem) => void;
  onDelete: (id: string) => void;
}

const NewsManagement: React.FC<NewsManagementProps> = ({ news, onSave, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredNews = news.filter(n => n.title.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleOpenModal = (item?: NewsItem) => {
    if (item) {
      setEditingNews(item);
    } else {
      setEditingNews({
        id: '',
        title: '',
        date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }),
        excerpt: '',
        tag: 'Update'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData: NewsItem = {
      id: editingNews?.id || Math.random().toString(36).substr(2, 9),
      title: (form.elements.namedItem('title') as HTMLInputElement).value,
      date: (form.elements.namedItem('date') as HTMLInputElement).value,
      excerpt: (form.elements.namedItem('excerpt') as HTMLTextAreaElement).value,
      tag: (form.elements.namedItem('tag') as HTMLSelectElement).value as any,
    };
    onSave(formData);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Manajemen Berita</h2>
          <p className="text-slate-500">Kelola pengumuman dan berita yang tampil di halaman publik.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-[#d9534f] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold text-sm hover:bg-red-700 shadow-lg shadow-red-100 transition-all"
        >
          <Plus size={18} /> Tambah Berita
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" placeholder="Cari berita..." 
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 outline-none"
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 font-bold text-slate-500 uppercase text-[10px]">Judul Berita</th>
                <th className="p-4 font-bold text-slate-500 uppercase text-[10px]">Tanggal</th>
                <th className="p-4 font-bold text-slate-500 uppercase text-[10px]">Kategori</th>
                <th className="p-4 font-bold text-slate-500 uppercase text-[10px] text-center w-32">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredNews.length > 0 ? filteredNews.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="p-4">
                    <p className="font-bold text-slate-800">{item.title}</p>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{item.excerpt}</p>
                  </td>
                  <td className="p-4 text-slate-600 whitespace-nowrap">{item.date}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                      item.tag === 'Penting' ? 'bg-red-50 text-red-600' :
                      item.tag === 'Kegiatan' ? 'bg-blue-50 text-blue-600' :
                      item.tag === 'Update' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {item.tag}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleOpenModal(item)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => { if(confirm('Hapus berita ini?')) onDelete(item.id) }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-slate-400 italic">Belum ada berita yang dibuat...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-[#d9534f] text-white p-6 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Newspaper size={24} />
                <h3 className="font-bold text-lg">{editingNews?.id ? 'Edit Berita' : 'Tambah Berita Baru'}</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Judul Pengumuman</label>
                  <input name="title" required defaultValue={editingNews?.title} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium" placeholder="Contoh: Batas Akhir Input RUP TA 2026" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Tanggal Publikasi</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input name="date" required defaultValue={editingNews?.date} className="w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Kategori</label>
                  <select name="tag" defaultValue={editingNews?.tag} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="Penting">Penting</option>
                    <option value="Kegiatan">Kegiatan</option>
                    <option value="Update">Update</option>
                    <option value="Panduan">Panduan</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Ringkasan Berita</label>
                <textarea name="excerpt" required rows={4} defaultValue={editingNews?.excerpt} className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="Tuliskan isi singkat berita di sini..."></textarea>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">Batal</button>
                <button type="submit" className="flex-[2] bg-[#d9534f] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-700 shadow-lg shadow-red-100">
                  <Save size={18} /> Simpan Berita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsManagement;
