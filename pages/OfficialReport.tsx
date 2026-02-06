
import React, { useState, useMemo } from 'react';
import { Printer, Search, FileSpreadsheet } from 'lucide-react';
import { OPD, ProgressData, SystemSettings } from '../types';
import { formatReportNumber, formatReportDecimal, getStatusBgClass, getCurrentTimestamp } from '../utils';

interface OfficialReportProps {
  opds: OPD[];
  progress: ProgressData[];
  settings: SystemSettings;
}

const OfficialReport: React.FC<OfficialReportProps> = ({ opds, progress, settings }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const handlePrint = () => window.print();

  // Filter dan Pencarian
  const filteredData = useMemo(() => {
    return progress.filter(item => {
      const opd = opds.find(o => o.id === item.opdId);
      return opd?.name.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [progress, opds, searchTerm]);

  // Pagination Logic
  const totalEntries = filteredData.length;
  const totalPages = Math.ceil(totalEntries / pageSize);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const startEntry = totalEntries === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endEntry = Math.min(currentPage * pageSize, totalEntries);

  const calculateTotals = () => {
    return filteredData.reduce((acc, curr) => {
      acc.paguTarget += (curr.paguTarget || 0);
      acc.todayPenPaket += (curr.todayPenyediaPaket || 0);
      acc.todayPenPagu += (curr.todayPenyediaPagu || 0);
      acc.todaySwPaket += (curr.todaySwakelolaPaket || 0);
      acc.todaySwPagu += (curr.todaySwakelolaPagu || 0);
      acc.todayPdSPaket += (curr.todayPdSPaket || 0);
      acc.todayPdSPagu += (curr.todayPdSPagu || 0);
      acc.totalPrevPct += (curr.prevPercent || 0);
      return acc;
    }, {
      paguTarget: 0,
      todayPenPaket: 0, todayPenPagu: 0,
      todaySwPaket: 0, todaySwPagu: 0,
      todayPdSPaket: 0, todayPdSPagu: 0,
      totalPrevPct: 0
    });
  };

  const totals = calculateTotals();
  const totalBarisPaket = totals.todayPenPaket + totals.todaySwPaket + totals.todayPdSPaket;
  const totalBarisPagu = totals.todayPenPagu + totals.todaySwPagu + totals.todayPdSPagu;
  const totalPctToday = totals.paguTarget > 0 ? (totalBarisPagu / totals.paguTarget) * 100 : 0;
  
  const avgPrevPct = filteredData.length > 0 ? totals.totalPrevPct / filteredData.length : 0;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const ReportTableContent = ({ data, startIdx }: { data: ProgressData[], startIdx: number }) => (
    <table className="w-full text-[8.5px] md:text-[9.5px] border-collapse border border-black leading-tight bg-white">
      <thead>
        <tr className="bg-[#FFC000] text-center font-bold">
          <th rowSpan={3} className="border border-black p-1 w-6">No.</th>
          <th rowSpan={3} className="border border-black p-1 text-left min-w-[200px]">Satuan Kerja</th>
          <th rowSpan={3} className="border border-black p-1 w-20">Pagu Pengadaan</th>
          <th colSpan={8} className="border border-black p-1 bg-[#00B0F0] text-white">TERUMUMKAN DI SIRUP</th>
          <th rowSpan={3} className="border border-black p-1 w-12 bg-[#00B0F0] text-white">Persentase (%) Sblmnya</th>
          <th rowSpan={3} className="border border-black p-1 w-12 bg-[#00B0F0] text-white">Persentase (%) Hari Ini</th>
        </tr>
        <tr className="bg-[#FFC000] text-center font-bold">
          <th colSpan={2} className="border border-black p-1">Penyedia</th>
          <th colSpan={2} className="border border-black p-1">Swakelola</th>
          <th colSpan={2} className="border border-black p-1">PdS</th>
          <th colSpan={2} className="border border-black p-1 text-white bg-[#00B0F0]">Total</th>
        </tr>
        <tr className="bg-[#FFC000] text-center font-bold text-[7.5px] md:text-[8px]">
          <th className="border border-black p-0.5 w-8">Paket</th>
          <th className="border border-black p-0.5 w-16">Pagu</th>
          <th className="border border-black p-0.5 w-8">Paket</th>
          <th className="border border-black p-0.5 w-16">Pagu</th>
          <th className="border border-black p-0.5 w-8">Paket</th>
          <th className="border border-black p-0.5 w-16">Pagu</th>
          <th className="border border-black p-0.5 w-8 text-white bg-[#00B0F0]">Paket</th>
          <th className="border border-black p-0.5 w-16 text-white bg-[#00B0F0]">Pagu</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => {
          const opd = opds.find(o => o.id === item.opdId);
          const totalPktRow = (item.todayPenyediaPaket || 0) + (item.todaySwakelolaPaket || 0) + (item.todayPdSPaket || 0);
          const totalPaguRow = (item.todayPenyediaPagu || 0) + (item.todaySwakelolaPagu || 0) + (item.todayPdSPagu || 0);
          const pctTodayRow = item.paguTarget > 0 ? (totalPaguRow / item.paguTarget) * 100 : 0;

          return (
            <tr key={item.opdId} className="text-right align-middle hover:bg-slate-50 transition-colors">
              <td className="border border-black p-0.5 text-center font-bold">{startIdx + index + 1}</td>
              <td className="border border-black p-0.5 text-left uppercase truncate">{opd?.name}</td>
              <td className="border border-black p-0.5 font-bold">{formatReportNumber(item.paguTarget)}</td>
              <td className="border border-black p-0.5">{formatReportNumber(item.todayPenyediaPaket)}</td>
              <td className="border border-black p-0.5">{formatReportNumber(item.todayPenyediaPagu)}</td>
              <td className="border border-black p-0.5">{formatReportNumber(item.todaySwakelolaPaket)}</td>
              <td className="border border-black p-0.5">{formatReportNumber(item.todaySwakelolaPagu)}</td>
              <td className="border border-black p-0.5">{formatReportNumber(item.todayPdSPaket)}</td>
              <td className="border border-black p-0.5">{formatReportNumber(item.todayPdSPagu)}</td>
              <td className="border border-black p-0.5 font-bold">{formatReportNumber(totalPktRow)}</td>
              <td className="border border-black p-0.5 font-bold">{formatReportNumber(totalPaguRow)}</td>
              <td className={`border border-black p-0.5 text-center font-bold ${getStatusBgClass(item.prevPercent)}`}>
                {formatReportDecimal(item.prevPercent)}
              </td>
              <td className={`border border-black p-0.5 text-center font-bold ${getStatusBgClass(pctTodayRow)}`}>
                {formatReportDecimal(pctTodayRow)}
              </td>
            </tr>
          );
        })}
      </tbody>
      <tfoot className="bg-[#D9EAD3] font-bold text-right">
        <tr className="border-t-2 border-black">
          <td colSpan={2} className="border border-black p-1 text-center uppercase tracking-widest font-black">TOTAL PROVINSI</td>
          <td className="border border-black p-1">{formatReportNumber(totals.paguTarget)}</td>
          <td className="border border-black p-1">{formatReportNumber(totals.todayPenPaket)}</td>
          <td className="border border-black p-1">{formatReportNumber(totals.todayPenPagu)}</td>
          <td className="border border-black p-1">{formatReportNumber(totals.todaySwPaket)}</td>
          <td className="border border-black p-1">{formatReportNumber(totals.todaySwPagu)}</td>
          <td className="border border-black p-1">{formatReportNumber(totals.todayPdSPaket)}</td>
          <td className="border border-black p-1">{formatReportNumber(totals.todayPdSPagu)}</td>
          <td className="border border-black p-1">{formatReportNumber(totalBarisPaket)}</td>
          <td className="border border-black p-1">{formatReportNumber(totalBarisPagu)}</td>
          <td className={`border border-black p-1 text-center ${getStatusBgClass(avgPrevPct)}`}>
            {formatReportDecimal(avgPrevPct)}
          </td>
          <td className={`border border-black p-1 text-center ${getStatusBgClass(totalPctToday)}`}>
            {formatReportDecimal(totalPctToday)}
          </td>
        </tr>
      </tfoot>
    </table>
  );

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 uppercase">Laporan Resmi Monitoring</h2>
          <p className="text-slate-500">Monitoring progres input SiRUP NTB {settings.ta}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={handlePrint} className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg">
            <Printer size={18} />
            Cetak Laporan Lengkap
          </button>
        </div>
      </div>

      <div className="bg-white p-4 md:p-8 shadow-sm border border-slate-200 rounded-lg print-container">
        <div className="text-center mb-8">
          <h1 className="text-sm md:text-lg font-black uppercase tracking-tight leading-tight">
            PROGRES RENCANA UMUM PENGADAAN (RUP) APBD PEMPROV NTB TA. {settings.ta}
          </h1>
          <div className="bg-red-600 text-white inline-block px-5 py-1.5 mt-4 font-black text-[10px] md:text-xs rounded shadow-sm tracking-widest no-print">
            {getCurrentTimestamp()}
          </div>
        </div>

        <div className="no-print">
          <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
              Tampilkan 
              <select 
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                className="mx-1 px-3 py-1.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500/20 bg-white"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              entri
            </div>
            <div className="flex items-center gap-3 text-sm font-medium text-slate-700 w-full md:w-auto">
              Cari:
              <div className="relative w-full md:w-64">
                <input 
                  type="text" 
                  placeholder="Ketik nama Satker..." 
                  className="w-full pl-3 pr-10 py-1.5 border border-slate-300 rounded-lg outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-400 transition-all shadow-sm"
                  value={searchTerm} 
                  onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
                <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar mb-6">
            <ReportTableContent data={paginatedData} startIdx={(currentPage - 1) * pageSize} />
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-6 py-4 border-t border-slate-100">
            <div className="text-sm font-medium text-slate-600">
              Menampilkan {startEntry} sampai {endEntry} dari {totalEntries} entri
            </div>
            <div className="flex items-center -space-x-px">
              <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="px-4 py-2 text-sm font-medium bg-white border border-slate-300 rounded-l-lg disabled:opacity-50">Pertama</button>
              {getPageNumbers().map(num => (
                <button key={num} onClick={() => setCurrentPage(num)} className={`px-4 py-2 text-sm font-bold border transition-all ${currentPage === num ? 'bg-[#d9534f] border-[#d9534f] text-white z-10' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'}`}>{num}</button>
              ))}
              <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages || totalPages === 0} className="px-4 py-2 text-sm font-medium bg-white border border-slate-300 rounded-r-lg disabled:opacity-50">Terakhir</button>
            </div>
          </div>
        </div>

        <div className="print-only">
           <ReportTableContent data={filteredData} startIdx={0} />
        </div>

        <div className="mt-8 signature-block">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 w-full">
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="font-bold underline uppercase tracking-widest text-[9px]">Sumber Data :</p>
                <ul className="text-[8.5px] space-y-0.5">
                  <li>1. SiRUP LKPP RI</li>
                  <li>2. BPKAD Prov. NTB</li>
                </ul>
              </div>

              <div className="space-y-2">
                <p className="font-bold uppercase tracking-widest text-[9px]">Keterangan :</p>
                <div className="space-y-1 text-[8.5px]">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-3 bg-[#FF0000] border border-black"></div>
                    <span>Terumumkan (0% - 50%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-3 bg-[#FFFF00] border border-black"></div>
                    <span>Sudah Mengumumkan (51% - 99%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-3 bg-[#00B050] border border-black"></div>
                    <span>Sudah Sesuai (100%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-3 bg-[#00B0F0] border border-black"></div>
                    <span>kelebihan Mengumumkan (&gt;100%)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1 text-[8.5px] font-bold">
                <p>* Data pagu ditampilkan dalam satuan jutaan rupiah;</p>
                <p>* Pagu Pengadaan (selain dari kode akun : 5.1.01 , 5.1.03 , 5.1.04 dan 5.4 dan tagging NP) otomatis terisi apabila sudah melakukan penarikan data RKAD dari aplikasi SIPD.</p>
              </div>
            </div>

            <div className="text-center w-64 md:w-80">
            <p className="mb-20 uppercase leading-relaxed font-bold">
              Mataram, {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}<br />
              {settings.pejabatJabatan},
            </p>
            <p className="font-black underline uppercase tracking-tight text-[11px] mb-1">{settings.pejabatNama}</p>
            <p className="font-bold text-[10px]">NIP. {settings.pejabatNip}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficialReport;

