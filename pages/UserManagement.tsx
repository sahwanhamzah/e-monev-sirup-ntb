
import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, X, Save, ShieldCheck, User as UserIcon } from 'lucide-react';
import { User, Role } from '../types';

interface UserManagementProps {
  users: User[];
  onSave: (user: User) => void;
  onDelete: (id: string) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, onSave, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.username?.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
    } else {
      setEditingUser({
        id: Math.random().toString(36).substr(2, 9),
        name: '',
        username: '',
        role: Role.VIEWER
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) onSave(editingUser);
    setIsModalOpen(false);
  };

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case Role.SUPER_ADMIN: return 'bg-purple-100 text-purple-700 border-purple-200';
      case Role.ADMIN_PBJ: return 'bg-red-100 text-red-700 border-red-200';
      case Role.ADMIN_OPD: return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Manajemen Pengguna</h2>
          <p className="text-slate-500">Kelola hak akses dan akun pengelola sistem.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-[#d9534f] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold text-sm hover:bg-red-700 shadow-lg shadow-red-100 transition-all"
        >
          <Plus size={18} /> Tambah User
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" placeholder="Cari Nama atau Username..." 
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 outline-none"
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 font-bold text-slate-500 uppercase text-[10px]">Nama Pengguna</th>
                <th className="p-4 font-bold text-slate-500 uppercase text-[10px]">Username</th>
                <th className="p-4 font-bold text-slate-500 uppercase text-[10px]">Hak Akses</th>
                <th className="p-4 font-bold text-slate-500 uppercase text-[10px] text-center w-32">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length > 0 ? filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                         <UserIcon size={14} />
                       </div>
                       <p className="font-bold text-slate-800">{u.name}</p>
                    </div>
                  </td>
                  <td className="p-4 text-slate-600 font-medium">@{u.username}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold border uppercase ${getRoleBadge(u.role)}`}>
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleOpenModal(u)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => { if(confirm('Hapus user ini?')) onDelete(u.id) }} 
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        disabled={u.username === 'admin'}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-slate-400 italic">User tidak ditemukan...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && editingUser && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-[#d9534f] text-white p-6 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <ShieldCheck size={24} />
                <h3 className="font-bold text-lg">{editingUser.name ? 'Edit User' : 'Tambah User'}</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Nama Lengkap</label>
                <input required value={editingUser.name} onChange={e => setEditingUser({...editingUser, name: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Username</label>
                  <input required value={editingUser.username} onChange={e => setEditingUser({...editingUser, username: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Hak Akses</label>
                  <select value={editingUser.role} onChange={e => setEditingUser({...editingUser, role: e.target.value as Role})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value={Role.VIEWER}>VIEWER</option>
                    <option value={Role.ADMIN_OPD}>ADMIN OPD</option>
                    <option value={Role.ADMIN_PBJ}>ADMIN PBJ</option>
                    <option value={Role.SUPER_ADMIN}>SUPER ADMIN</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">Batal</button>
                <button type="submit" className="flex-[2] bg-[#d9534f] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-700 shadow-lg shadow-red-100">
                  <Save size={18} /> Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
