
import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import OfficialReport from './pages/OfficialReport';
import ProgressInput from './pages/ProgressInput';
import NewsManagement from './pages/NewsManagement';
import OPDManagement from './pages/OPDManagement';
import UserManagement from './pages/UserManagement';
import BackupRestore from './pages/BackupRestore';
import Login from './pages/Login';
import TVMonitor from './pages/TVMonitor'; // New Page
import { useAuth, useAppData } from './hooks';
import { Save, CheckCircle2, Cloud, CloudOff, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const { isLoading, isSaving, showToast, isCloudActive, opds, setOpds, progress, setProgress, news, setNews, users, setUsers, settings, setSettings, sync } = useAppData();
  const { isLoggedIn, user, loginError, login, logout } = useAuth(users);
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (isLoading) return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
      <Loader2 size={48} className="text-[#d9534f] animate-spin mb-6" />
      <h2 className="text-xl font-black uppercase tracking-widest text-center">Menghubungkan Database</h2>
    </div>
  );

  if (!isLoggedIn) return <Login onLogin={login} error={loginError} opds={opds} progress={progress} news={news} />;

  const handleUpdate = async (type: string, data: any) => {
    if (type === 'opd') {
      const updatedOpds = Array.isArray(data) ? data : opds.map(o => o.id === data.id ? data : o).concat(opds.find(o => o.id === data.id) ? [] : [data]);
      setOpds(updatedOpds);
      await sync({ opds: updatedOpds });
    } else if (type === 'progress') {
      const updatedProg = Array.isArray(data) ? data : progress.map(p => p.opdId === data.opdId ? data : p);
      setProgress(updatedProg);
      await sync({ progress: updatedProg });
    } else if (type === 'news') {
      const updatedNews = news.find(n => n.id === data.id) ? news.map(n => n.id === data.id ? data : n) : [data, ...news];
      setNews(updatedNews);
      await sync({ news: updatedNews });
    } else if (type === 'user') {
      const updatedUsers = users.find(u => u.id === data.id) ? users.map(u => u.id === data.id ? data : u) : [...users, data];
      setUsers(updatedUsers);
      await sync({ users: updatedUsers });
    } else if (type === 'settings') {
      setSettings(data);
      await sync({ settings: data });
    }
  };

  return (
    <Layout user={user!} currentPage={currentPage} onPageChange={setCurrentPage} onLogout={logout}>
      {currentPage !== 'tv_monitor' && (
        <div className="no-print mb-6 flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-200 text-[10px] font-bold uppercase tracking-wider">
           <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${isCloudActive ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-amber-600 bg-amber-50 border-amber-100'}`}>
                {isCloudActive ? <Cloud size={14} /> : <CloudOff size={14} />}
                <span>{isCloudActive ? 'Cloud Server Aktif' : 'Mode Lokal'}</span>
              </div>
              <div className="h-4 w-[1px] bg-slate-200"></div>
              <span className="text-slate-400">Status: {isSaving ? 'Sinkronisasi...' : 'Tersimpan'}</span>
           </div>
        </div>
      )}

      {currentPage === 'dashboard' && <Dashboard opds={opds} progress={progress} />}
      {currentPage === 'tv_monitor' && <TVMonitor opds={opds} progress={progress} news={news} />}
      {currentPage === 'monitoring' && <ProgressInput opds={opds} progress={progress} onUpdate={(d) => handleUpdate('progress', d)} onBulkUpdate={(d) => handleUpdate('progress', d)} />}
      {currentPage === 'reports' && <OfficialReport opds={opds} progress={progress} settings={settings} />}
      {currentPage === 'news_manage' && <NewsManagement news={news} onSave={(d) => handleUpdate('news', d)} onDelete={(id) => handleUpdate('news_del', id)} />}
      {currentPage === 'opd' && <OPDManagement opds={opds} onSave={(d) => handleUpdate('opd', d)} onDelete={(id) => handleUpdate('opd', opds.filter(o => o.id !== id))} />}
      {currentPage === 'users' && <UserManagement users={users} onSave={(d) => handleUpdate('user', d)} onDelete={(id) => handleUpdate('user', users.filter(u => u.id !== id))} />}
      {currentPage === 'backup' && <BackupRestore currentData={{ opds, progress, news, settings, users }} onRestore={async (d) => { setOpds(d.opds); setProgress(d.progress); setNews(d.news); setUsers(d.users); setSettings(d.settings); await sync(d); }} />}
      
      {currentPage === 'settings' && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-2xl space-y-6">
          <h2 className="text-2xl font-bold border-b pb-4">Pengaturan Laporan</h2>
          <div className="space-y-4">
             <input className="w-full p-4 border rounded-xl" placeholder="Nama Pejabat" value={settings.pejabatNama} onChange={e => setSettings({...settings, pejabatNama: e.target.value})} />
             <div className="grid grid-cols-2 gap-4">
               <input className="w-full p-4 border rounded-xl" placeholder="NIP" value={settings.pejabatNip} onChange={e => setSettings({...settings, pejabatNip: e.target.value})} />
               <input className="w-full p-4 border bg-slate-50 rounded-xl font-bold" value={settings.ta} disabled />
             </div>
             <input className="w-full p-4 border rounded-xl" placeholder="Jabatan" value={settings.pejabatJabatan} onChange={e => setSettings({...settings, pejabatJabatan: e.target.value})} />
             <button onClick={() => handleUpdate('settings', settings)} disabled={isSaving} className="w-full bg-[#d9534f] text-white py-4 rounded-xl font-black uppercase hover:bg-red-700 flex items-center justify-center gap-3">
               {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Simpan Perubahan
             </button>
          </div>
        </div>
      )}
      
      {currentPage !== 'tv_monitor' && (
        <div className={`fixed bottom-8 right-8 z-[200] transition-all duration-300 transform ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0 pointer-events-none'}`}>
          <div className="bg-slate-900 text-white px-8 py-5 rounded-[2rem] shadow-2xl flex items-center gap-5 border border-slate-700">
             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isCloudActive ? 'bg-emerald-500' : 'bg-blue-500'}`}><CheckCircle2 size={24} /></div>
             <div><p className="text-sm font-black uppercase">Berhasil Disimpan</p><p className="text-[10px] text-slate-400 font-bold uppercase">Terupdate di Server</p></div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
