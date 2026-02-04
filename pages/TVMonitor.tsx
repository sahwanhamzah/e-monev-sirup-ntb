
import React, { useState, useEffect, useRef } from 'react';
import { OPD, ProgressData, NewsItem } from '../types';
import { formatCurrencyMillions, formatPercent, getStatusBgClass } from '../utils';
import { TrendingUp, Package, Percent, Calendar, ShieldCheck, Clock, ArrowUpRight, Award, CheckCircle2 } from 'lucide-react';

interface TVMonitorProps {
  opds: OPD[];
  progress: ProgressData[];
  news: NewsItem[];
}

const TVMonitor: React.FC<TVMonitorProps> = ({ opds, progress, news }) => {
  const [time, setTime] = useState(new Date());
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const successScrollRef = useRef<HTMLDivElement>(null);

  // Update Jam
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Efek Auto-Scroll untuk Tabel Utama & Daftar Sukses
  useEffect(() => {
    const tableContainer = tableScrollRef.current;
    const successContainer = successScrollRef.current;

    const createScrollTask = (container: HTMLDivElement | null) => {
      if (!container) return null;
      let scrollAmount = 0;
      const scrollStep = 1;
      const scrollInterval = 40;

      return setInterval(() => {
        if (container.scrollTop + container.clientHeight >= container.scrollHeight) {
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
  }, [progress]);

  // Kalkulasi Data
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

  return (
    <div className="h-screen w-full flex flex-col p-6 space-y-6 font-sans">
      
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between border-b border-white/10 pb-6 shrink-0">
        <div className="flex items-center gap-6">
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

      {/* STATS CARDS SECTION */}
      <div className="grid grid-cols-4 gap-6 shrink-0">
        <MonitorCard 
          label="Total Progres Provinsi" 
          value={formatPercent(avgPercent)} 
          sub="Realisasi Input Pagu Nasional"
          icon={<Percent size={32}/>}
          color="emerald"
        />
        <MonitorCard 
          label="Pagu Terumumkan" 
          value={`Rp ${formatCurrencyMillions(totalPaguTerinput)} Jt`} 
          sub={`Target: Rp ${formatCurrencyMillions(totalPaguMurni)} Jt`}
          icon={<TrendingUp size={32}/>}
          color="blue"
        />
        <MonitorCard 
          label="Total Paket RUP" 
          value={totalPaket.toLocaleString('id-ID')} 
          sub="Pen + Swa + PdS"
          icon={<Package size={32}/>}
          color="indigo"
        />
        <MonitorCard 
          label="Satker Tuntas 100%" 
          value={`${completedOPDs.length} OPD`} 
          sub="Target penyelesaian input RUP"
          icon={<Award size={32}/>}
          color="amber"
        />
      </div>

      {/* MAIN DATA SECTION (SPLIT) */}
      <div className="flex-1 min-h-0 flex gap-6 overflow-hidden">
        
        {/* LEFT: LIST OPD TUNTAS 100% */}
        <div className="w-1/3 flex flex-col space-y-4 overflow-hidden">
          <div className="bg-slate-900/50 border border-white/5 p-6 rounded-[2.5rem] flex-1 flex flex-col overflow-hidden">
            <h3 className="text-xl font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-3 shrink-0">
              <CheckCircle2 className="text-emerald-500" /> OPD INPUT 100%
            </h3>
            
            <div 
              ref={successScrollRef}
              className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2 scroll-smooth"
            >
              {completedOPDs.length > 0 ? completedOPDs.map((item, idx) => (
                <div key={idx} className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-2xl flex items-start gap-3 group hover:bg-emerald-500/10 transition-colors">
                  <Award className="text-emerald-500 shrink-0 mt-0.5" size={18} />
                  <span className="text-xs font-black text-slate-200 uppercase leading-relaxed tracking-tight">
                    {item.name}
                  </span>
                </div>
              )) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-white/5 rounded-3xl text-slate-600">
                   <p className="font-bold uppercase tracking-widest text-xs">Belum ada OPD yang mencapai 100%</p>
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
               Ditemukan <strong>{progress.filter(p => (p.todayPenyediaPagu + p.todaySwakelolaPagu + p.todayPdSPagu) / (p.paguTarget || 1) < 0.5).length} OPD</strong> dengan progres di bawah 50%. Diperlukan atensi pimpinan untuk percepatan input RUP.
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
           <div 
             ref={tableScrollRef}
             className="flex-1 overflow-y-auto pt-16 px-8 custom-scrollbar scroll-smooth"
           >
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

      {/* CSS For Animations */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 60s linear infinite;
        }
      `}</style>
    </div>
  );
};

const MonitorCard: React.FC<{ label: string, value: string, sub: string, icon: React.ReactNode, color: string }> = ({ 
  label, value, sub, icon, color 
}) => {
  const colors: Record<string, string> = {
    emerald: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500 shadow-emerald-500/5',
    blue: 'border-blue-500/20 bg-blue-500/10 text-blue-500 shadow-blue-500/5',
    indigo: 'border-indigo-500/20 bg-indigo-500/10 text-indigo-500 shadow-indigo-500/5',
    amber: 'border-amber-500/20 bg-amber-500/10 text-amber-500 shadow-amber-500/5',
  };

  return (
    <div className={`p-8 rounded-[2.5rem] border backdrop-blur-md shadow-2xl relative overflow-hidden group ${colors[color]}`}>
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity translate-x-4 -translate-y-4">
        {icon}
      </div>
      <div className="relative z-10">
        <p className="text-slate-500 font-black uppercase tracking-widest text-[10px] mb-3">{label}</p>
        <h4 className="text-4xl font-black tracking-tighter text-white mb-2 tabular-nums">{value}</h4>
        <p className="text-slate-400 font-bold text-xs">{sub}</p>
      </div>
    </div>
  );
};

export default TVMonitor;
