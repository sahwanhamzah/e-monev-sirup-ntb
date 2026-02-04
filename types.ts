
export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN_PBJ = 'ADMIN_PBJ',
  ADMIN_OPD = 'ADMIN_OPD',
  VIEWER = 'VIEWER'
}

export interface User {
  id: string;
  name: string;
  role: Role;
  opdId?: string;
  username?: string;
}

export interface OPD {
  id: string;
  name: string;
  paguMurni: number; // In Juta (as per PDF standard)
}

export interface ProgressData {
  opdId: string;
  paguTarget: number;
  
  // Previous Percent (simplified as per PDF structure)
  prevPercent: number;
  
  // Today Data
  todayPenyediaPaket: number;
  todayPenyediaPagu: number;
  todaySwakelolaPaket: number;
  todaySwakelolaPagu: number;
  todayPdSPaket: number; // Penyedia Dalam Swakelola
  todayPdSPagu: number;  // Penyedia Dalam Swakelola
  
  updatedAt: string;
}

export interface NewsItem {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  tag: 'Penting' | 'Kegiatan' | 'Update' | 'Panduan';
}

export interface SystemSettings {
  pejabatNama: string;
  pejabatNip: string;
  pejabatJabatan: string;
  ta: string;
}
