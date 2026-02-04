
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { TrendingUp, Package, Percent, AlertCircle } from 'lucide-react';
import { formatCurrencyMillions, formatPercent } from '../utils';
import { ProgressData, OPD } from '../types';

interface DashboardProps {
  opds: OPD[];
  progress: ProgressData[];
}

const Dashboard: React.FC<DashboardProps> = ({ opds, progress }) => {
  // 1. Total Pagu Target (Murni)
  const totalPaguMurni = opds.reduce((acc, curr) => acc + curr.paguMurni, 0);
  
  // 2. Total Pagu Terinput (Jumlahkan 3 kategori: Penyedia + Swakelola + PdS)
  const totalPaguTerinput = progress.reduce((acc, curr) => 
    acc + curr.todayPenyediaPagu + curr.todaySwakelolaPagu + curr.todayPdSPagu, 0
  );
  
  // 3. Total Paket Terinput (Jumlahkan 3 kategori)
  const totalPaket = progress.reduce((acc, curr) => 
    acc + curr.todayPenyediaPaket + curr.todaySwakelolaPaket + curr.todayPdSPaket, 0
  );
  
  // 4. Persentase Keseluruhan Provinsi
  const avgPercent = totalPaguMurni > 0 ? (totalPaguTerinput / totalPaguMurni) * 100 : 0;

  const statusCounts = {
    critical: progress.filter(p => {
      const totalPaguRow = p.todaySwakelolaPagu + p.todayPenyediaPagu + p.todayPdSPagu;
      const pct = (totalPaguRow / (p.paguTarget || 1) * 100);
      const rounded = Math.round(pct);
      return rounded <= 50;
    }).length,
    warning: progress.filter(p => {
      const totalPaguRow = p.todaySwakelolaPagu + p.todayPenyediaPagu + p.todayPdSPagu;
      const pct = (totalPaguRow / (p.paguTarget || 1) * 100);
      const rounded = Math.round(pct);
      return rounded > 50 && rounded < 100;
    }).length,
    success: progress.filter(p => {
      const totalPaguRow = p.todaySwakelolaPagu + p.todayPenyediaPagu + p.todayPdSPagu;
      const pct = (totalPaguRow / (p.paguTarget || 1) * 100);
      const rounded = Math.round(pct);
      return rounded === 100;
    }).length,
    over: progress.filter(p => {
      const totalPaguRow = p.todaySwakelolaPagu + p.todayPenyediaPagu + p.todayPdSPagu;
      const pct = (totalPaguRow / (p.paguTarget || 1) * 100);
      const rounded = Math.round(pct);
      return rounded > 100;
    }).length,
  };

  const pieData = [
    { name: 'Terumumkan (0-50%)', value: statusCounts.critical, color: '#EF4444' },
    { name: 'Belum Lengkap (51-99%)', value: statusCounts.warning, color: '#F59E0B' },
    { name: 'Sudah Sesuai (100%)', value: statusCounts.success, color: '#22C55E' },
    { name: 'Melebihi (>100%)', value: statusCounts.over, color: '#3B82F6' },
  ];

  const barData = progress.map(p => {
    const opd = opds.find(o => o.id === p.opdId);
    const totalPaguRow = p.todaySwakelolaPagu + p.todayPenyediaPagu + p.todayPdSPagu;
    const pct = (totalPaguRow / (p.paguTarget || 1) * 100);
    // Terapkan pembulatan bulat di grafik bar agar sinkron
    return {
      name: opd?.name.length! > 20 ? opd?.name.substring(0, 20) + '...' : opd?.name,
      fullName: opd?.name,
      progres: Math.round(pct)
    };
  }).sort((a, b) => b.progres - a.progres).slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Dashboard Utama</h2>
          <p className="text-slate-500">Ringkasan progres input SiRUP Provinsi NTB TA 2026</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
          <TrendingUp className="text-blue-600" size={20} />
          <span className="text-sm font-semibold text-slate-700">Update: {new Date().toLocaleDateString('id-ID')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Pagu Terinput" 
          value={`Rp ${formatCurrencyMillions(totalPaguTerinput)}`} 
          subValue={`Target: Rp ${formatCurrencyMillions(totalPaguMurni)} Jt`}
          icon={<TrendingUp className="text-blue-600" />}
          color="blue"
        />
        <StatCard 
          title="Total Paket" 
          value={totalPaket.toLocaleString('id-ID')} 
          subValue="Pen + Swa + PdS"
          icon={<Package className="text-indigo-600" />}
          color="indigo"
        />
        <StatCard 
          title="Progres Provinsi" 
          value={formatPercent(avgPercent)} 
          subValue="Realisasi Input Pagu (Dibulatkan)"
          icon={<Percent className="text-green-600" />}
          color="green"
        />
        <StatCard 
          title="Atensi (0-50%)" 
          value={statusCounts.critical.toString()} 
          subValue="Jumlah OPD progres rendah"
          icon={<AlertCircle className="text-red-600" />}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold mb-6 text-slate-800">10 OPD Progres Tertinggi (%)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                <XAxis type="number" domain={[0, 100]} stroke="#64748B" fontSize={12} />
                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip cursor={{fill: '#F8FAFC'}} />
                <Bar dataKey="progres" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold mb-6 text-slate-800">Distribusi Status Progres</h3>
          <div className="h-80 flex flex-col items-center">
            <ResponsiveContainer width="100%" height="70%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 w-full mt-2 text-[10px]">
               {pieData.map((item, i) => (
                 <div key={i} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-slate-600 font-medium">{item.name}: <span className="text-slate-900 font-bold">{item.value} OPD</span></span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string; subValue: string; icon: React.ReactNode; color: string }> = ({ 
  title, value, subValue, icon, color 
}) => {
  const bgColors: Record<string, string> = {
    blue: 'bg-blue-50',
    indigo: 'bg-indigo-50',
    green: 'bg-green-50',
    red: 'bg-red-50',
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{title}</p>
          <h4 className="text-xl font-bold text-slate-900 mb-1">{value}</h4>
          <p className="text-[10px] text-slate-400 font-medium">{subValue}</p>
        </div>
        <div className={`p-2.5 rounded-lg ${bgColors[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
