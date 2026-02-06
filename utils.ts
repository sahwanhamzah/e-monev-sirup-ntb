
export const formatReportNumber = (value: number): string => {
  if (value === undefined || value === null) return '0';
  if (value === 0) return '0';
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatReportDecimal = (value: number): string => {
  // Selalu tampilkan 2 desimal untuk estetika laporan resmi
  const val = value || 0;
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val).replace('.', ',');
};

// Fungsi untuk dashboard (Tanpa desimal untuk kebersihan visual)
export const formatCurrencyMillions = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0);
};

export const formatPercent = (value: number): string => {
  const val = value || 0;
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val) + '%';
};

/**
 * Menentukan class warna background berdasarkan persentase
 * 🔴 0–50%  : Merah
 * 🟡 51–99% : Kuning
 * 🟢 100%   : Hijau
 * 🔵 >100%  : Biru
 */
export const getStatusBgClass = (percent: number): string => {
  const val = Math.round(percent || 0);
  
  if (val <= 50) return 'bg-[#FF0000] text-white font-bold';
  if (val < 100) return 'bg-[#FFFF00] text-black font-bold';
  if (val === 100) return 'bg-[#00B050] text-white font-bold';
  return 'bg-[#00B0F0] text-white font-bold';
};

export const getCurrentTimestamp = () => {
  const now = new Date();
  const date = now.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
  const time = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  return `UPDATE ${date.toUpperCase()} - JAM : ${time} WITA`;
};
