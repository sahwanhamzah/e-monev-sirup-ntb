
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  LogIn, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  Calendar, 
  Search, 
  TrendingUp, 
  Package, 
  Percent, 
  AlertCircle, 
  Newspaper, 
  Phone, 
  Mail, 
  MapPin, 
  ExternalLink, 
  X, 
  Clock, 
  CheckCircle2, 
  Monitor, 
  Award, 
  ArrowUpRight, 
  ShieldCheck 
} from 'lucide-react';
import { OPD, ProgressData, NewsItem } from '../types';
import { formatReportNumber, formatReportDecimal, getStatusBgClass, getCurrentTimestamp, formatCurrencyMillions, formatPercent } from '../utils';

interface LoginProps {
  onLogin: (username: string, password: string) => void;
  error?: string | null;
  opds: OPD[];
  progress: ProgressData[];
  news: NewsItem[];
}

type ViewState = 'login' | 'rekap' | 'berita' | 'kontak' | 'tv';

const Login: React.FC<LoginProps> = ({ onLogin, error, opds, progress, news }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activeView, setActiveView] = useState<ViewState>('login');
  const [searchTerm, setSearchTerm] = useState('');
  const [time, setTime] = useState(new Date());
  
  // Selected News for Modal
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  
  // Pagination State
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const successScrollRef = useRef<HTMLDivElement>(null);

  // Update Jam untuk Mode TV
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Efek Auto-Scroll untuk Mode TV (Tabel Utama & Daftar Sukses)
  useEffect(() => {
    if (activeView !== 'tv') return;
    
    const tableContainer = scrollRef.current;
    const successContainer = successScrollRef.current;

    const createScrollTask = (container: HTMLDivElement | null) => {
      if (!container) return null;
      let scrollAmount = 0;
      const scrollStep = 1;
      const scrollInterval = 40;

      return setInterval(() => {
        if (container.scrollTop + container.clientHeight >= container.scrollHeight - 5) {
          scrollAmount = 0;
          container.scrollTop = 0;
        } else {
          scrollAmount += scrollStep;
          container.scrollTop = scrollAmount;
        }
      }, scrollInterval);
    };

    const tableTask = createScrollTask(tableContainer);
    const successTask = createScrollTask(successContainer);

    return () => {
      if (tableTask) clearInterval(tableTask);
      if (successTask) clearInterval(successTask);
    };
  }, [activeView, progress]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password);
  };

  // Filter & Pagination Logic
  const filteredProgress = useMemo(() => {
    return progress.filter(p => {
      const opd = opds.find(o => o.id === p.opdId);
      return opd?.name.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [progress, opds, searchTerm]);

  const totalEntries = filteredProgress.length;
  const totalPages = Math.ceil(totalEntries / pageSize);
  
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProgress.slice(start, start + pageSize);
  }, [filteredProgress, currentPage, pageSize]);

  const startEntry = totalEntries === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endEntry = Math.min(currentPage * pageSize, totalEntries);

  // Reset pagination when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, pageSize]);

  // Kalkulasi Data Dashboard Publik
  const totalPaguMurni = opds.reduce((acc, curr) => acc + curr.paguMurni, 0);
  const totalPaguTerinput = progress.reduce((acc, curr) => 
    acc + curr.todayPenyediaPagu + curr.todaySwakelolaPagu + curr.todayPdSPagu, 0
  );
  const totalPaket = progress.reduce((acc, curr) => 
    acc + curr.todayPenyediaPaket + curr.todaySwakelolaPaket + curr.todayPdSPaket, 0
  );
  const avgPercent = totalPaguMurni > 0 ? (totalPaguTerinput / totalPaguMurni) * 100 : 0;
  
  // Filter OPD yang sudah 100%
  const completedOPDs = progress
    .filter(p => {
      const total = p.todayPenyediaPagu + p.todaySwakelolaPagu + p.todayPdSPagu;
      return Math.round((total / (p.paguTarget || 1)) * 100) >= 100;
    })
    .map(p => {
      const opd = opds.find(o => o.id === p.opdId);
      return { name: opd?.name || 'Unknown' };
    });

  const criticalOPDsCount = progress.filter(p => (p.todayPenyediaPagu + p.todaySwakelolaPagu + p.todayPdSPagu) / (p.paguTarget || 1) < 0.5).length;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className={`min-h-screen font-sans flex flex-col relative overflow-hidden transition-colors duration-500 ${activeView === 'login' || activeView === 'tv' ? 'bg-slate-950' : 'bg-slate-50'}`}>
      
      {/* Background Image: Hidden in TV Mode */}
      {activeView !== 'tv' && (
        <>
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center animate-in fade-in duration-1000"
            style={{ 
              backgroundImage: 'url("https://storage.ntbprov.go.id/biropbj/media/kantor-gub.jpg")',
              filter: activeView === 'login' ? 'brightness(0.3) saturate(0.5)' : 'brightness(1) opacity(0.03)'
            }}
          />
          <div className="absolute inset-0 z-[1] opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        </>
      )}

      {/* Content Wrapper */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Navbar Atas */}
        {activeView !== 'tv' && (
          <nav className={`h-[60px] flex items-center justify-between px-6 shrink-0 shadow-xl border-b sticky top-0 z-50 transition-all ${activeView === 'login' ? 'bg-black/40 backdrop-blur-xl text-white border-white/10' : 'bg-slate-900 text-white border-slate-800'}`}>
            <div className="flex items-center h-full">
              <div className="bg-[#d9534f] h-full px-6 flex items-center skew-x-[-20deg] -ml-6 mr-8 cursor-pointer group hover:bg-red-700 transition-colors" onClick={() => setActiveView('login')}>
                <div className="skew-x-[20deg] flex items-center gap-2">
                  <span className="font-black text-2xl tracking-tighter">SiRUP</span>
                  <div className="w-5 h-5 bg-white/20 rounded flex items-center justify-center group-hover:scale-110 transition-transform">
                    <div className="w-0 h-0 border-l-[8px] border-l-white border-y-[5px] border-y-transparent ml-0.5"></div>
                  </div>
                </div>
              </div>

              <div className="hidden lg:flex items-center gap-8 text-[14px] font-bold text-slate-300">
                <button onClick={() => setActiveView('rekap')} className={`hover:text-white transition-all py-2 px-1 relative ${activeView === 'rekap' ? 'text-white' : ''}`}>
                  Rekap Progres
                  {activeView === 'rekap' && <span className="absolute bottom-[-14px] left-0 right-0 h-1 bg-[#d9534f] rounded-full"></span>}
                </button>
                <button onClick={() => setActiveView('tv')} className={`hover:text-white transition-all py-2 px-1 flex items-center gap-2 relative ${activeView === 'tv' ? 'text-white' : ''}`}>
                  <Monitor size={16} className="text-[#d9534f]" /> TV Monitor
                  {activeView === 'tv' && <span className="absolute bottom-[-14px] left-0 right-0 h-1 bg-[#d9534f] rounded-full"></span>}
                </button>
                <a 
                  href="https://sirup.inaproc.id/sirup/rekap/klpd/D301" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-all py-2 px-1 flex items-center gap-1.5"
                >
                  Rekap RUP NTB
                  <ExternalLink size={14} className="opacity-60" />
                </a>
                <button onClick={() => setActiveView('berita')} className={`hover:text-white transition-all py-2 px-1 relative ${activeView === 'berita' ? 'text-white' : ''}`}>
                  Pengumuman
                  {activeView === 'berita' && <span className="absolute bottom-[-14px] left-0 right-0 h-1 bg-[#d9534f] rounded-full"></span>}
                </button>
                <button onClick={() => setActiveView('kontak')} className={`hover:text-white transition-all py-2 px-1 relative ${activeView === 'kontak' ? 'text-white' : ''}`}>
                  Kontak Kami
                  {activeView === 'kontak' && <span className="absolute bottom-[-14px] left-0 right-0 h-1 bg-[#d9534f] rounded-full"></span>}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-8 text-[14px]">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${activeView === 'login' ? 'text-white bg-white/10 border-white/20' : 'text-slate-400 bg-slate-800 border-slate-700'}`}>
                <Calendar size={16} />
                <span className="font-bold">TA 2026</span>
              </div>
              <button 
                onClick={() => setActiveView('login')}
                className={`flex items-center gap-2 font-black tracking-widest uppercase transition-all px-4 py-2 rounded-xl ${activeView === 'login' ? 'bg-[#d9534f] text-white shadow-lg shadow-red-900/50' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}
              >
                <UserIcon size={18} />
                Login
              </button>
            </div>
          </nav>
        )}

        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col items-center ${activeView === 'login' ? 'justify-center' : 'justify-start pt-12'} px-4 overflow-y-auto custom-scrollbar pb-12`}>
          
          {/* VIEW: TV MONITOR */}
          {activeView === 'tv' && (
            <div className="fixed inset-0 z-[100] bg-[#020617] text-white flex flex-col p-6 space-y-6 animate-in fade-in duration-500 overflow-hidden">
               {/* Close Button untuk kembali ke menu Login */}
               <button onClick={() => setActiveView('login')} className="absolute top-4 left-4 p-3 bg-white/5 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-all z-[110]">
                  <X size={24} />
               </button>

               {/* HEADER */}
               <div className="flex items-center justify-between border-b border-white/10 pb-6 shrink-0">
                <div className="flex items-center gap-6 ml-12">
                  <div className="bg-[#d9534f] p-4 rounded-2xl shadow-lg shadow-red-900/40">
                    <ShieldCheck size={40} className="text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase leading-none italic">
                      Dashboard <span className="text-[#d9534f]">Eksekutif</span>
                    </h1>
                    <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-xs mt-2 flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                      Live Monitoring SiRUP NTB 2026
                    </p>
                  </div>
                </div>

                <div className="text-right flex items-center gap-8">
                   <div className="flex flex-col items-end">
                      <span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mb-1">Hari & Tanggal</span>
                      <div className="flex items-center gap-3 text-2xl font-black text-slate-200">
                        <Calendar size={20} className="text-[#d9534f]" />
                        {time.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()}
                      </div>
                   </div>
                   <div className="h-16 w-[1px] bg-white/10"></div>
                   <div className="flex flex-col items-end">
                      <span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mb-1">Waktu (WITA)</span>
                      <div className="flex items-center gap-3 text-5xl font-black text-white tabular-nums">
                        <Clock size={32} className="text-emerald-500" />
                        {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </div>
                   </div>
                </div>
              </div>

              {/* STATS CARDS */}
              <div className="grid grid-cols-4 gap-6 shrink-0">
                <MonitorCardTV label="Total Progres Provinsi" value={formatPercent(avgPercent)} sub="Realisasi Input Pagu Nasional" icon={<Percent size={32}/>} color="emerald" />
                <MonitorCardTV label="Pagu Terumumkan" value={`Rp ${formatCurrencyMillions(totalPaguTerinput)} Jt`} sub={`Target: Rp ${formatCurrencyMillions(totalPaguMurni)} Jt`} icon={<TrendingUp size={32}/>} color="blue" />
                <MonitorCardTV label="Total Paket RUP" value={totalPaket.toLocaleString('id-ID')} sub="Pen + Swa + PdS" icon={<Package size={32}/>} color="indigo" />
                <MonitorCardTV label="Satker Tuntas (100%)" value={`${completedOPDs.length} OPD`} sub="Penyelesaian Input RUP" icon={<Award size={32}/>} color="amber" />
              </div>

              {/* MAIN CONTENT SPLIT */}
              <div className="flex-1 min-h-0 flex gap-6 overflow-hidden">
                
                {/* LEFT: LIST OPD TUNTAS & WARNING */}
                <div className="w-1/3 flex flex-col space-y-4 overflow-hidden">
                  <div className="bg-slate-900/50 border border-white/5 p-6 rounded-[2.5rem] flex-1 flex flex-col overflow-hidden">
                    <h3 className="text-xl font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-3 shrink-0">
                      <CheckCircle2 className="text-emerald-500" /> OPD INPUT 100%
                    </h3>
                    
                    <div ref={successScrollRef} className="flex-1 overflow-y-auto space-y-3 pr-2 scroll-smooth no-scrollbar">
                      {completedOPDs.length > 0 ? completedOPDs.map((item, idx) => (
                        <div key={idx} className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-2xl flex items-start gap-3 group hover:bg-emerald-500/10 transition-colors">
                          <Award className="text-emerald-500 shrink-0 mt-0.5" size={18} />
                          <span className="text-xs font-black text-slate-200 uppercase leading-relaxed tracking-tight">
                            {item.name}
                          </span>
                        </div>
                      )) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-white/5 rounded-3xl text-slate-600">
                           <p className="font-bold uppercase tracking-widest text-xs">Belum ada OPD mencapai 100%</p>
                        </div>
                      )}
                    </div>
                    {/* Legend info */}
                    <div className="mt-6 pt-4 border-t border-white/5 text-[10px] font-black text-emerald-500/60 uppercase tracking-widest flex items-center gap-2 shrink-0">
                       <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                       Pencapaian Target Realisasi
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-red-600/20 to-transparent border border-red-500/20 p-6 rounded-[2.5rem] shrink-0">
                    <h4 className="font-black text-red-500 uppercase tracking-widest text-xs mb-2">Peringatan Sistem</h4>
                    <p className="text-slate-300 text-sm leading-relaxed italic">
                      Ditemukan <strong>{criticalOPDsCount} OPD</strong> dengan progres di bawah 50%. Diperlukan atensi pimpinan untuk percepatan input RUP.
                    </p>
                  </div>
                </div>

                {/* RIGHT: AUTO-SCROLLING TABLE */}
                <div className="flex-1 bg-slate-900/50 border border-white/5 rounded-[2.5rem] flex flex-col overflow-hidden relative shadow-inner">
                   <div className="absolute top-0 left-0 right-0 h-16 bg-slate-900/80 backdrop-blur-md z-10 flex items-center px-8 border-b border-white/5">
                      <div className="grid grid-cols-12 w-full text-[10px] font-black uppercase tracking-widest text-slate-500">
                         <div className="col-span-1">No</div>
                         <div className="col-span-6">Satuan Kerja</div>
                         <div className="col-span-3 text-right">Pagu Target</div>
                         <div className="col-span-2 text-right">Progres</div>
                      </div>
                   </div>
                   <div ref={scrollRef} className="flex-1 overflow-y-auto pt-16 px-8 scroll-smooth no-scrollbar">
                      <div className="divide-y divide-white/5">
                        {progress.map((item, idx) => {
                          const opd = opds.find(o => o.id === item.opdId);
                          const total = item.todayPenyediaPagu + item.todaySwakelolaPagu + item.todayPdSPagu;
                          const pct = (total / (item.paguTarget || 1)) * 100;
                          return (
                            <div key={item.opdId} className="grid grid-cols-12 w-full py-5 items-center hover:bg-white/5 transition-colors">
                              <div className="col-span-1 text-slate-600 font-black text-xs">{idx + 1}</div>
                              <div className="col-span-6 font-bold text-slate-300 uppercase text-xs truncate pr-4">{opd?.name}</div>
                              <div className="col-span-3 text-right text-slate-400 font-bold tabular-nums text-xs">Rp {formatCurrencyMillions(item.paguTarget)} Jt</div>
                              <div className="col-span-2 text-right">
                                 <span className={`px-4 py-1.5 rounded-xl font-black text-xs tabular-nums ${getStatusBgClass(pct)}`}>
                                   {Math.round(pct)}%
                                 </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                   </div>
                   {/* Gradient Overlays for better depth */}
                   <div className="absolute top-16 left-0 right-0 h-12 bg-gradient-to-b from-slate-900 to-transparent pointer-events-none z-10 opacity-50"></div>
                   <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none z-10 opacity-50"></div>
                </div>
              </div>

              {/* FOOTER: RUNNING TEXT */}
              <div className="h-16 bg-slate-900 border border-white/10 rounded-2xl flex items-center overflow-hidden shrink-0">
                <div className="bg-[#d9534f] h-full flex items-center px-8 font-black uppercase tracking-widest text-white shrink-0 z-20 relative shadow-2xl skew-x-[-20deg] -ml-4 pr-12">
                  <span className="skew-x-[20deg] flex items-center gap-3">
                    <ArrowUpRight size={20} /> NEWS & UPDATES
                  </span>
                </div>
                <div className="flex-1 flex items-center relative z-10 overflow-hidden">
                  <div className="animate-marquee whitespace-nowrap flex items-center gap-12 font-bold text-slate-200">
                    {news.map((n, i) => (
                      <span key={i} className="flex items-center gap-4">
                        <span className="w-2 h-2 bg-[#d9534f] rounded-full"></span>
                        {n.title.toUpperCase()}: {n.excerpt.substring(0, 100)}...
                      </span>
                    ))}
                    {/* Repeat for seamless loop */}
                    {news.map((n, i) => (
                      <span key={`dup-${i}`} className="flex items-center gap-4">
                        <span className="w-2 h-2 bg-[#d9534f] rounded-full"></span>
                        {n.title.toUpperCase()}: {n.excerpt.substring(0, 100)}...
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <style>{`
                @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } } 
                .animate-marquee { animation: marquee 60s linear infinite; } 
                .no-scrollbar::-webkit-scrollbar { display: none; }
              `}</style>
            </div>
          )}

          {/* VIEW: LOGIN */}
          {activeView === 'login' && (
            <div className="w-full flex flex-col items-center animate-in zoom-in-95 duration-500">
              <div className="w-full max-w-[420px] bg-black/40 backdrop-blur-xl rounded-[2rem] shadow-2xl p-10 flex flex-col items-center border border-white/10 relative overflow-hidden">
                <button onClick={() => setActiveView('rekap')} className="absolute top-4 right-4 p-2 text-white/40 hover:text-white transition-colors">
                  <X size={20} />
                </button>

                <div className="text-center mb-10">
                  <h2 className="text-5xl font-light text-white tracking-tight mb-2 drop-shadow-md">Log In</h2>
                  <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.4em] mt-2 drop-shadow-sm">Monitoring Progres NTB</p>
                </div>

                {error && (
                  <div className="w-full mb-6 p-4 bg-red-500/20 border border-red-500/30 text-white text-xs font-bold text-center rounded-xl backdrop-blur-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="w-full space-y-6">
                  <div className="space-y-1">
                    <input type="text" required placeholder="E-mail" className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl focus:bg-white/20 outline-none text-lg text-white placeholder-white/50 transition-all shadow-inner" value={username} onChange={(e) => setUsername(e.target.value)} />
                  </div>
                  <div className="space-y-1 relative">
                    <input type={showPassword ? "text" : "password"} required placeholder="Password" className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl focus:bg-white/20 outline-none text-lg text-white placeholder-white/50 transition-all shadow-inner" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                  </div>
                  <button type="submit" className="w-full bg-[#5f8a2a] text-white py-3.5 rounded-xl font-medium text-xl hover:bg-[#4d7022] transition-all shadow-lg active:scale-95 transform mt-2">Log in</button>
                </form>
              </div>
              
              <div className="mt-8 flex flex-col md:flex-row items-center gap-4">
                <button onClick={() => setActiveView('rekap')} className="px-6 py-2.5 bg-white/10 backdrop-blur-md border border-white/10 text-white rounded-full text-xs font-black hover:bg-white/20 transition-all uppercase tracking-widest">
                  Lihat Rekap Data
                </button>
                <button onClick={() => setActiveView('tv')} className="px-6 py-2.5 bg-[#d9534f]/20 backdrop-blur-md border border-[#d9534f]/30 text-white rounded-full text-xs font-black hover:bg-[#d9534f]/40 transition-all uppercase tracking-widest flex items-center gap-2">
                  <Monitor size={14} /> Buka TV Monitor
                </button>
              </div>
            </div>
          )}

          {/* VIEW: REKAP PUBLIK */}
          {activeView === 'rekap' && (
            <div className="w-full max-w-7xl animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
              <div className="text-center mb-10">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight drop-shadow-sm">DATA REALTIME PROGRES RUP PROVINSI NTB</h1>
                <div className="bg-[#d9534f] text-white inline-block px-6 py-2 mt-4 font-black text-sm rounded-xl shadow-lg border border-red-400/30">
                  {getCurrentTimestamp()}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <StatBox title="Total Pagu Terinput" value={`Rp ${formatCurrencyMillions(totalPaguTerinput)} Jt`} icon={<TrendingUp size={24}/>} color="blue" />
                <StatBox title="Total Paket" value={totalPaket.toLocaleString('id-ID')} icon={<Package size={24}/>} color="indigo" />
                <StatBox title="Rata-rata Progres" value={formatPercent(avgPercent)} icon={<Percent size={24}/>} color="emerald" />
                <StatBox title="OPD Perlu Atensi" value={`${criticalOPDsCount} SKPD`} icon={<AlertCircle size={24}/>} color="rose" />
              </div>

              <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    Tampilkan <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="mx-1 px-2 py-1.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500/20 transition-all bg-white"><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option><option value={100}>100</option></select> entri
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
                    Cari: <div className="relative"><input type="text" placeholder="..." className="pl-3 pr-10 py-1.5 border border-slate-300 rounded-lg outline-none focus:ring-4 focus:ring-red-500/10 transition-all shadow-sm w-full md:w-64" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /><Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" /></div>
                  </div>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-[11px] border-collapse border border-slate-300">
                    <thead>
                      <tr className="bg-[#FFC000] text-slate-900 text-center font-black uppercase">
                        <th rowSpan={3} className="border border-slate-400 p-4 w-12">No</th>
                        <th rowSpan={3} className="border border-slate-400 p-4 min-w-[320px] text-left">Satuan Kerja</th>
                        <th rowSpan={3} className="border border-slate-400 p-4 w-32">Pagu Pengadaan</th>
                        <th colSpan={8} className="border border-slate-400 p-4 bg-[#00B0F0] text-white">TERUMUMKAN DI SIRUP</th>
                        <th rowSpan={3} className="border border-slate-400 p-4 w-28 bg-[#00B0F0] text-white">Persentase Sebelumnya</th>
                        <th rowSpan={3} className="border border-slate-400 p-4 w-28 bg-[#00B0F0] text-white">Persentase Hari Ini</th>
                      </tr>
                      <tr className="bg-[#FFC000] text-slate-900 text-center font-black uppercase border-b border-slate-400">
                        <th colSpan={2} className="border border-slate-400 p-2">Penyedia</th>
                        <th colSpan={2} className="border border-slate-400 p-2">Swakelola</th>
                        <th colSpan={2} className="border border-slate-400 p-2">Penyedia Dlm Swa</th>
                        <th colSpan={2} className="border border-slate-400 p-2">Total</th>
                      </tr>
                      <tr className="bg-[#FFC000] text-slate-900 text-center font-black text-[9px] uppercase border-b border-slate-400">
                        <th className="border border-slate-400 p-2">Paket</th><th className="border border-slate-400 p-2">Pagu</th>
                        <th className="border border-slate-400 p-2">Paket</th><th className="border border-slate-400 p-2">Pagu</th>
                        <th className="border border-slate-400 p-2">Paket</th><th className="border border-slate-400 p-2">Pagu</th>
                        <th className="border border-slate-400 p-2">Pkt</th><th className="border border-slate-400 p-2">Pagu</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300">
                      {paginatedData.length > 0 ? paginatedData.map((item, index) => {
                        const opd = opds.find(o => o.id === item.opdId);
                        const totalPkt = item.todayPenyediaPaket + item.todaySwakelolaPaket + item.todayPdSPaket;
                        const totalPagu = item.todayPenyediaPagu + item.todaySwakelolaPagu + item.todayPdSPagu;
                        const pctToday = (totalPagu / (item.paguTarget || 1)) * 100;
                        return (
                          <tr key={item.opdId} className="hover:bg-slate-50 transition-colors group">
                            <td className="p-4 text-center font-black text-slate-400 border-r border-slate-300 group-hover:text-[#d9534f]">{(currentPage-1)*pageSize+index+1}</td>
                            <td className="p-4 font-bold text-slate-700 border-r border-slate-300">{opd?.name}</td>
                            <td className="p-4 text-right font-black text-blue-600 border-r border-slate-300">{formatReportNumber(item.paguTarget)}</td>
                            <td className="p-4 text-center border-r border-slate-300">{formatReportNumber(item.todayPenyediaPaket)}</td>
                            <td className="p-4 text-right border-r border-slate-300">{formatReportNumber(item.todayPenyediaPagu)}</td>
                            <td className="p-4 text-center border-r border-slate-300">{formatReportNumber(item.todaySwakelolaPaket)}</td>
                            <td className="p-4 text-right border-r border-slate-300">{formatReportNumber(item.todaySwakelolaPagu)}</td>
                            <td className="p-4 text-center border-r border-slate-300">{formatReportNumber(item.todayPdSPaket)}</td>
                            <td className="p-4 text-right border-r border-slate-300">{formatReportNumber(item.todayPdSPagu)}</td>
                            <td className="p-4 text-center font-black border-r border-slate-300">{formatReportNumber(totalPkt)}</td>
                            <td className="p-4 text-right font-black border-r border-slate-300">{formatReportNumber(totalPagu)}</td>
                            <td className={`p-4 text-center font-black border-r border-slate-300 ${getStatusBgClass(item.prevPercent)}`}>{formatReportDecimal(item.prevPercent)}</td>
                            <td className={`p-4 text-center font-black ${getStatusBgClass(pctToday)}`}>{formatReportDecimal(pctToday)}</td>
                          </tr>
                        );
                      }) : <tr><td colSpan={13} className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest bg-slate-50/80 italic border border-slate-300">Data tidak ditemukan...</td></tr>}
                    </tbody>
                  </table>
                </div>

                <div className="p-6 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="text-sm font-medium text-slate-600">Menampilkan {startEntry} sampai {endEntry} dari {totalEntries} entri</div>
                  <div className="flex items-center -space-x-px">
                    <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="px-4 py-2 text-sm font-medium bg-white border border-slate-300 rounded-l-lg hover:bg-slate-50 disabled:opacity-50 transition-colors">Pertama</button>
                    {getPageNumbers().map(num => <button key={num} onClick={() => setCurrentPage(num)} className={`px-4 py-2 text-sm font-bold border transition-all ${currentPage === num ? 'bg-[#d9534f] border-[#d9534f] text-white z-10' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'}`}>{num}</button>)}
                    <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages || totalPages === 0} className="px-4 py-2 text-sm font-medium bg-white border border-slate-300 rounded-r-lg hover:bg-slate-50 disabled:opacity-50 transition-colors">Terakhir</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: BERITA */}
          {activeView === 'berita' && (
            <div className="w-full max-w-7xl animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
              <div className="text-center mb-16">
                <h1 className="text-4xl font-black text-slate-900 mb-4 uppercase tracking-tight">Pengumuman & Update</h1>
                <p className="text-slate-500 font-bold uppercase tracking-[0.4em]">Informasi Terkini Biro Pengadaan Barang dan Jasa NTB</p>
                <div className="w-24 h-2 bg-[#d9534f] mx-auto mt-8 rounded-full shadow-lg shadow-red-900/20"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {news.length > 0 ? news.map((newsItem) => (
                  <div key={newsItem.id} onClick={() => setSelectedNews(newsItem)} className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 p-8 hover:translate-y-[-10px] transition-all duration-500 cursor-pointer group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><Newspaper size={64} /></div>
                    <div className="flex justify-between items-start mb-6">
                      <span className={`text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest ${newsItem.tag === 'Penting' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}>{newsItem.tag}</span>
                      <span className="text-xs text-slate-400 font-black tracking-widest uppercase flex items-center gap-2"><Calendar size={14} />{newsItem.date}</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-800 mb-4 group-hover:text-[#d9534f] transition-colors leading-tight line-clamp-2">{newsItem.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 mb-8">{newsItem.excerpt}</p>
                    <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 group-hover:translate-x-2 transition-transform">Baca Detail <ExternalLink size={14} className="text-[#d9534f]" /></span>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-full py-32 text-center text-slate-400 font-black uppercase tracking-widest bg-white rounded-[3rem] border-2 border-dashed border-slate-200">Belum ada pengumuman tersedia.</div>
                )}
              </div>
            </div>
          )}

          {/* VIEW: KONTAK */}
          {activeView === 'kontak' && (
            <div className="w-full max-w-7xl animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
              <div className="text-center mb-20">
                <h1 className="text-5xl font-black text-slate-900 mb-4 uppercase tracking-tighter">Layanan Bantuan</h1>
                <p className="text-slate-500 font-bold uppercase tracking-[0.4em]">Hubungi Kami Untuk Informasi Lebih Lanjut</p>
                <div className="w-24 h-2 bg-[#d9534f] mx-auto mt-8 rounded-full shadow-lg shadow-red-900/20"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                <div className="space-y-10">
                  <ContactItem icon={<MapPin size={28} />} title="Kantor Pusat" text="Kantor Gubernur NTB, Biro Pengadaan Barang dan Jasa, Jl. Pejanggik No. 12, Mataram" color="blue" />
                  <ContactItem icon={<Phone size={28} />} title="Hotline Monitoring" text="(0370) 6211234 • Senin - Jumat: 08:00 - 16:00 WITA" color="emerald" />
                  <ContactItem icon={<Mail size={28} />} title="Surel Elektronik" text="biropbj@ntbprov.go.id • helpdesk.sirup@ntbprov.go.id" color="rose" />
                </div>
                <div className="bg-slate-900 text-white p-12 rounded-[3.5rem] shadow-2xl space-y-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5"><ShieldCheck size={120} /></div>
                  <div className="flex items-center gap-4 border-b border-white/10 pb-6">
                    <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center"><AlertCircle size={32} /></div>
                    <h3 className="text-2xl font-black uppercase tracking-tight italic">Helpdesk <span className="text-emerald-400">Whatsapp</span></h3>
                  </div>
                  <p className="text-slate-400 font-medium leading-relaxed">Tim Helpdesk kami siap membantu Anda terkait kendala teknis input RUP, sinkronisasi SIPD, atau verifikasi data OPD.</p>
                  <a href="https://wa.me/6281234567890" target="_blank" className="flex items-center justify-center gap-3 w-full bg-emerald-500 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-900/20 active:scale-95">Chat Admin Sekarang</a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL DETAIL BERITA */}
      {selectedNews && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSelectedNews(null)}>
          <div className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className={`p-8 text-white flex justify-between items-start shrink-0 ${selectedNews.tag === 'Penting' ? 'bg-red-500' : 'bg-blue-600'}`}>
              <div className="space-y-4">
                <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-xl text-xs font-black uppercase tracking-widest">{selectedNews.tag}</span>
                <h2 className="text-3xl font-black leading-tight max-w-2xl">{selectedNews.title}</h2>
                <div className="flex items-center gap-2 text-sm font-bold text-white/80 uppercase tracking-widest"><Calendar size={18} />{selectedNews.date}</div>
              </div>
              <button onClick={() => setSelectedNews(null)} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"><X size={24} /></button>
            </div>
            <div className="p-10 md:p-14 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50">
              <p className="text-lg text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">{selectedNews.excerpt}</p>
            </div>
            <div className="p-6 bg-white border-t border-slate-100 flex justify-between items-center">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Biro Pengadaan Barang & Jasa Prov. NTB</p>
              <button onClick={() => setSelectedNews(null)} className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-components
const MonitorCardTV: React.FC<{ label: string, value: string, sub: string, icon: React.ReactNode, color: string }> = ({ label, value, sub, icon, color }) => {
  const colors: Record<string, string> = {
    emerald: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500 shadow-emerald-500/5',
    blue: 'border-blue-500/20 bg-blue-500/10 text-blue-500 shadow-blue-500/5',
    indigo: 'border-indigo-500/20 bg-indigo-500/10 text-indigo-500 shadow-indigo-500/5',
    amber: 'border-amber-500/20 bg-amber-500/10 text-amber-500 shadow-amber-500/5',
  };
  return (
    <div className={`p-8 rounded-[2.5rem] border backdrop-blur-md shadow-2xl relative overflow-hidden group ${colors[color]}`}>
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity translate-x-4 -translate-y-4">{icon}</div>
      <div className="relative z-10"><p className="text-slate-500 font-black uppercase tracking-widest text-[10px] mb-3">{label}</p><h4 className="text-4xl font-black tracking-tighter text-white mb-2 tabular-nums">{value}</h4><p className="text-slate-400 font-bold text-xs">{sub}</p></div>
    </div>
  );
};

const StatBox: React.FC<{ title: string, value: string, icon: React.ReactNode, color: string }> = ({ title, value, icon, color }) => {
  const lightColors: Record<string, string> = { blue: 'bg-blue-50 text-blue-600 border-blue-100', indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100', emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100', rose: 'bg-rose-50 text-rose-600 border-rose-100' };
  return (
    <div className="border p-6 rounded-[1.5rem] flex items-center gap-5 transition-all bg-white/90 shadow-lg border-slate-200">
      <div className={`p-4 rounded-2xl border ${lightColors[color]}`}>{icon}</div>
      <div><p className="text-[10px] font-black uppercase tracking-widest mb-1 text-slate-500">{title}</p><p className="text-xl font-black text-slate-900">{value}</p></div>
    </div>
  );
};

const ContactItem: React.FC<{ icon: React.ReactNode, title: string, text: string, color: string }> = ({ icon, title, text, color }) => {
  const lightColors: Record<string, string> = { blue: 'bg-blue-50 text-blue-600', emerald: 'bg-emerald-50 text-emerald-600', rose: 'bg-rose-50 text-rose-600' };
  return (
    <div className="flex gap-6 group">
      <div className={`shrink-0 w-16 h-16 ${lightColors[color]} rounded-[2rem] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>{icon}</div>
      <div className="flex flex-col justify-center"><h3 className="font-black text-xl mb-1 text-slate-900 uppercase tracking-tight">{title}</h3><p className="text-sm font-medium text-slate-600 leading-relaxed">{text}</p></div>
    </div>
  );
};

export default Login;
