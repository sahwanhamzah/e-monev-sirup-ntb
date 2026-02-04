
export const formatReportNumber = (value: number): string => {
  if (value === 0) return '-';
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatReportDecimal = (value: number): string => {
  // Terapkan pembulatan ke bilangan bulat terdekat (contoh: 99,98 -> 100)
  // Namun tetap tampilkan 2 desimal (,00) untuk menjaga estetika laporan resmi
  const val = Math.round(value || 0);
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val).replace('.', ',');
};

// Fungsi untuk dashboard
export const formatCurrencyMillions = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatPercent = (value: number): string => {
  // Terapkan pembulatan ke bilangan bulat terdekat untuk dashboard
  const rounded = Math.round(value || 0);
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rounded) + '%';
};

/**
 * Menentukan class warna background berdasarkan persentase yang sudah dibulatkan
 * Aturan sesuai permintaan:
 * 🔴 0–50%  : Merah (#FF0000)
 * 🟡 51–99% : Kuning (#FFFF00)
 * 🟢 100%   : Hijau (#00B050)
 * 🔵 >100%  : Biru (#00B0F0)
 */
export const getStatusBgClass = (percent: number): string => {
  const rounded = Math.round(percent || 0);
  
  if (rounded <= 50) return 'bg-[#FF0000] text-white font-bold';
  if (rounded < 100) return 'bg-[#FFFF00] text-black font-bold';
  if (rounded === 100) return 'bg-[#00B050] text-white font-bold';
  return 'bg-[#00B0F0] text-white font-bold';
};

export const getCurrentTimestamp = () => {
  const now = new Date();
  const date = now.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
  const time = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  return `UPDATE ${date.toUpperCase()} - JAM : ${time} WITA`;
};
