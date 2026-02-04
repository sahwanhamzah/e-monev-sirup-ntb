
import { useState, useEffect, useRef, useCallback } from 'react';
import { User, OPD, ProgressData, NewsItem, SystemSettings, Role } from './types';
import { ApiService } from './api';
import { INITIAL_OPDS, DEFAULT_SETTINGS } from './constants';

export const useAuth = (users: User[]) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('sirup_ntb_current_auth');
    if (saved) {
      setUser(JSON.parse(saved));
      setIsLoggedIn(true);
    }
  }, []);

  const login = (username: string, password: string) => {
    const found = users.find(u => u.username === username);
    if (found && password === 'ntb') {
      setUser(found);
      setIsLoggedIn(true);
      setLoginError(null);
      localStorage.setItem('sirup_ntb_current_auth', JSON.stringify(found));
      return true;
    }
    setLoginError('Username atau Password salah!');
    return false;
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('sirup_ntb_current_auth');
  };

  return { isLoggedIn, user, loginError, login, logout };
};

export const useAppData = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isCloudActive, setIsCloudActive] = useState(false);
  
  const [opds, setOpds] = useState<OPD[]>([]);
  const [progress, setProgress] = useState<ProgressData[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);

  const toastTimeoutRef = useRef<number | null>(null);

  const triggerToast = useCallback(() => {
    setShowToast(true);
    if (toastTimeoutRef.current) window.clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = window.setTimeout(() => setShowToast(false), 2000);
  }, []);

  const sync = useCallback(async (overrides: any = {}) => {
    setIsSaving(true);
    const state = { opds, progress, news, users, settings, ...overrides };
    await ApiService.syncToServer(state);
    setIsSaving(false);
    triggerToast();
  }, [opds, progress, news, users, settings, triggerToast]);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      setIsCloudActive(ApiService.isCloudMode());
      const data = await ApiService.getAllData();
      
      const currentOpds = data.opds.length > 0 ? data.opds : INITIAL_OPDS;
      setOpds(currentOpds);
      setNews(data.news);
      setSettings(data.settings || DEFAULT_SETTINGS);
      setUsers(data.users.length > 0 ? data.users : [
        { id: '1', name: 'Marga Sulkifli Rayes., S.IP', role: Role.SUPER_ADMIN, username: 'admin' },
        { id: '2', name: 'User Tamu', role: Role.VIEWER, username: 'viewer' }
      ]);
      
      if (data.progress.length > 0) {
        setProgress(data.progress);
      } else {
        setProgress(currentOpds.map((o: OPD) => ({
          opdId: o.id, paguTarget: o.paguMurni, prevPercent: 0,
          todayPenyediaPaket: 0, todayPenyediaPagu: 0,
          todaySwakelolaPaket: 0, todaySwakelolaPagu: 0,
          todayPdSPaket: 0, todayPdSPagu: 0,
          updatedAt: new Date().toISOString()
        })));
      }
      setIsLoading(false);
    };
    init();
  }, []);

  return {
    isLoading, isSaving, showToast, isCloudActive,
    opds, setOpds, progress, setProgress, news, setNews, users, setUsers, settings, setSettings,
    sync
  };
};
