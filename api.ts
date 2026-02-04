
import { createClient } from '@supabase/supabase-js';
import { OPD, ProgressData, NewsItem, SystemSettings, User } from './types';

/** 
 * ============================================================
 * KONFIGURASI SUPABASE CLOUD
 * ============================================================
 */
const SUPABASE_URL = 'https://bbormyebtcucvwvutqdq.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJib3JteWVidGN1Y3Z3dnV0cWRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwNDQxNjksImV4cCI6MjA4NTYyMDE2OX0.fzEO8Asu0m70mc45M1yMv_cLH88qDpcvoUD2lIQvlmw'; 

// Deteksi apakah konfigurasi valid
const isConfigured = SUPABASE_URL && 
                   SUPABASE_URL.startsWith('https://') && 
                   !SUPABASE_URL.includes('GANTI_DENGAN');

const supabase = isConfigured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const STORAGE_KEYS = {
  OPD: 'sirup_ntb_master_opd_v2',
  PROGRESS: 'sirup_ntb_progress_data_v2',
  NEWS: 'sirup_ntb_news_v2',
  SETTINGS: 'sirup_ntb_sys_settings_v2',
  USERS: 'sirup_ntb_users_v2'
};

export const ApiService = {
  isCloudMode: () => isConfigured,

  async getAllData() {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('sirup_data')
          .select('json_content')
          .eq('id', 'global_state')
          .maybeSingle();

        if (error) {
          console.warn("Supabase returned error, ignoring and using local:", error.message);
        }

        if (!error && data?.json_content && typeof data.json_content === 'object') {
          console.log("☁️ Cloud Data Loaded Successfully");
          return {
            opds: data.json_content.opds || [],
            progress: data.json_content.progress || [],
            news: data.json_content.news || [],
            settings: data.json_content.settings || null,
            users: data.json_content.users || []
          };
        }
      } catch (e) {
        console.warn("⚠️ Cloud Connection Exception, falling back to LocalStorage.");
      }
    }

    return {
      opds: JSON.parse(localStorage.getItem(STORAGE_KEYS.OPD) || '[]'),
      progress: JSON.parse(localStorage.getItem(STORAGE_KEYS.PROGRESS) || '[]'),
      news: JSON.parse(localStorage.getItem(STORAGE_KEYS.NEWS) || '[]'),
      settings: JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || 'null'),
      users: JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]')
    };
  },

  async syncToServer(fullState: any) {
    // Backup Lokal Selalu
    localStorage.setItem(STORAGE_KEYS.OPD, JSON.stringify(fullState.opds));
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(fullState.progress));
    localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(fullState.news));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(fullState.settings));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(fullState.users));

    if (supabase) {
      try {
        const { error } = await supabase
          .from('sirup_data')
          .upsert({ id: 'global_state', json_content: fullState });
        
        if (error) throw error;
        return { success: true };
      } catch (e) {
        console.error("❌ Cloud Sync Failed:", e);
      }
    }
    
    return { success: true };
  }
};
