import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle2, XCircle, Search, Edit2, Trash2, Shield, Users, Save } from 'lucide-react';
import { usePermissions } from '@/context/PermissionsContext';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

interface RolePermissionData {
  role: string;
  permissions: string; // JSON string
}

const PERMISSION_KEYS = [
  { key: 'data:edit', label: 'دەستکاریکردنی زانیارییەکان' },
  { key: 'data:upload', label: 'بەرزکردنەوەی فایلی ئێکسڵ' },
  { key: 'users:manage', label: 'بەڕێوەبردنی بەکارهێنەران' },
  { key: 'roles:manage', label: 'دەستکاریکردنی دەسەڵاتەکان' },
  { key: 'db:fetch', label: 'بینینی داتای بنکە (Database)' },
];

const ROLES = ['admin', 'user', 'viewer', 'guest'];
const ROLE_LABELS: Record<string, string> = {
  admin: 'بەڕێوەبەر',
  user: 'بەکارهێنەر',
  viewer: 'بینەر',
  guest: 'میوان'
};

const PermissionsManagement = () => {
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { hasPermission } = usePermissions();

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/roles');
      if (res.ok) {
        const data = await res.json();
        const mapping: Record<string, string[]> = {};
        data.roles.forEach((r: RolePermissionData) => {
          mapping[r.role] = JSON.parse(r.permissions);
        });
        
        // Ensure defaults exist in state if missing from DB initially
        ROLES.forEach(r => {
          if (!mapping[r]) {
            if (r === 'admin') mapping[r] = PERMISSION_KEYS.map(p => p.key);
            else if (r === 'user') mapping[r] = ['data:edit', 'db:fetch'];
            else if (r === 'guest') mapping[r] = ['db:fetch'];
            else mapping[r] = [];
          }
        });
        
        setRolePermissions(mapping);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (role: string, permission: string) => {
    if (role === 'admin') return; // Cannot edit admin
    
    setRolePermissions(prev => {
      const current = prev[role] || [];
      const updated = current.includes(permission)
        ? current.filter(p => p !== permission)
        : [...current, permission];
      return { ...prev, [role]: updated };
    });
  };

  const savePermissions = async (role: string) => {
    try {
      setSaving(true);
      const res = await fetch('/api/admin/roles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, permissions: JSON.stringify(rolePermissions[role]) })
      });
      if (!res.ok) {
        alert('هەڵەیەک ڕوویدا لە پاشەکەوتکردن');
      } else {
        // Optional: show a success toast
      }
    } catch (e) {
      alert('هەڵەیەک ڕوویدا');
    } finally {
      setSaving(false);
    }
  };

  if (!hasPermission('roles:manage')) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <Shield className="mx-auto h-12 w-12 text-slate-300 mb-4" />
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">دەسەڵاتت نییە</h3>
        <p className="mt-2">تۆ دەسەڵاتی بینین و دەستکاریکردنی ئەم بەشەت نییە.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="overflow-x-auto">
        <table className="w-full text-right" dir="rtl">
          <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">دەسەڵاتەکان</th>
              {ROLES.map(role => (
                <th key={role} className="px-6 py-4 text-center">
                  <span className={`inline-flex px-3 py-1 rounded-xl text-xs font-bold ${
                    role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400' :
                    role === 'viewer' ? 'bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400' :
                    role === 'guest' ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400' :
                    'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400'
                  }`}>
                    {ROLE_LABELS[role]}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">لە بارکردندایە...</td>
              </tr>
            ) : (
              PERMISSION_KEYS.map((perm) => (
                <tr key={perm.key} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-sm text-slate-700 dark:text-slate-300">
                    {perm.label}
                  </td>
                  {ROLES.map(role => {
                    const hasPerm = rolePermissions[role]?.includes(perm.key);
                    const isAdmin = role === 'admin';
                    return (
                      <td key={`${role}-${perm.key}`} className="px-6 py-4 text-center">
                        <button
                          onClick={() => togglePermission(role, perm.key)}
                          disabled={isAdmin}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                            isAdmin ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                          } ${hasPerm ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              hasPerm ? '-translate-x-6' : '-translate-x-1'
                            }`}
                          />
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
            
            {/* Save Buttons Row */}
            {!loading && (
              <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                <td className="px-6 py-4 text-sm font-semibold text-slate-500 dark:text-slate-400">پاشەکەوتکردنی گۆڕانکارییەکان</td>
                {ROLES.map(role => (
                  <td key={`save-${role}`} className="px-6 py-4 text-center">
                    {role !== 'admin' && (
                      <button
                        onClick={() => savePermissions(role)}
                        disabled={saving}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors disabled:opacity-50"
                      >
                        <Save size={14} />
                        پاشەکەوت
                      </button>
                    )}
                  </td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const UserManagement = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'permissions'>('users');
  
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  // Form State
  const [formData, setFormData] = useState({ name: '', email: '', role: 'user', status: 'active' });
  const [isSaving, setIsSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users', { cache: 'no-store' });
      const data = await res.json();
      if (data.users) {
        setUsers(data.users);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setUsers([data.user, ...users]);
        setShowAddModal(false);
        setFormData({ name: '', email: '', role: 'user', status: 'active' });
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('هەڵەیەک ڕوویدا');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedUser.id, ...formData })
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(users.map(u => u.id === data.user.id ? data.user : u));
        setShowEditModal(false);
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('هەڵەیەک ڕوویدا');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('دڵنیایت لە سڕینەوەی ئەم بەکارهێنەرە؟')) return;
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== id));
      }
    } catch (err) {
      alert('هەڵەیەک ڕوویدا لە سڕینەوە');
    }
  };

  const openEditModal = (user: UserData) => {
    setSelectedUser(user);
    const normalizedStatus = user.status === 'approved' ? 'active' : user.status;
    setFormData({ name: user.name || '', email: user.email, role: user.role, status: normalizedStatus });
    setShowEditModal(true);
  };

  const filteredUsers = users.filter(u => 
    (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 w-fit mx-auto sm:mx-0">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
            activeTab === 'users' 
              ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' 
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
          }`}
        >
          <Users size={18} />
          بەکارهێنەران
        </button>
        <button
          onClick={() => setActiveTab('permissions')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
            activeTab === 'permissions' 
              ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm' 
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
          }`}
        >
          <Shield size={18} />
          دەسەڵاتەکان
        </button>
      </div>

      {activeTab === 'users' ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="relative w-full sm:w-96">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="گەڕان بەدوای ناو یان ئیمەیڵ..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                dir="rtl"
              />
            </div>
            <button 
              onClick={() => { setFormData({ name: '', email: '', role: 'user', status: 'active' }); setShowAddModal(true); }}
              className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              بەکارهێنەری نوێ
            </button>
          </div>

          {/* Users Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right" dir="rtl">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400">ناو / ئیمەیڵ</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400">جۆر</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400">باری هەژمار</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400">کردارەکان</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500">بەدواداچوون...</td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500">هیچ بەکارهێنەرێک نەدۆزرایەوە</td>
                    </tr>
                  ) : filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                            {(u.name || u.email).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800 dark:text-slate-200">{u.name || 'بێ ناو'}</div>
                            <div className="text-xs text-slate-500 font-mono" dir="ltr">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          u.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400' :
                          u.role === 'viewer' ? 'bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400' :
                          u.role === 'guest' ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400' :
                          'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400'
                        }`}>
                          {u.role === 'admin' ? 'بەڕێوەبەر' : u.role === 'viewer' ? 'بینەر' : u.role === 'guest' ? 'میوان' : 'بەکارهێنەر'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          (u.status === 'active' || u.status === 'approved') ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                          u.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                          'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'
                        }`}>
                          {(u.status === 'active' || u.status === 'approved') ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                          {(u.status === 'active' || u.status === 'approved') ? 'چالاکە' : u.status === 'pending' ? 'چاوەڕێ' : 'ڕاگیراوە'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEditModal(u)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(u.id)} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <PermissionsManagement />
      )}

      {/* Add / Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden" dir="rtl">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                {showAddModal ? 'زیادکردنی بەکارهێنەر' : 'دەستکاریکردنی بەکارهێنەر'}
              </h3>
              <button onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <XCircle size={24} />
              </button>
            </div>
            <form onSubmit={showAddModal ? handleAddUser : handleEditUser} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">ناوی تەواو</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">ئیمەیڵ</label>
                <input required type="email" dir="ltr" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none text-left transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">جۆر</label>
                  <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                    <option value="user">بەکارهێنەر</option>
                    <option value="admin">بەڕێوەبەر</option>
                    <option value="viewer">بینەر</option>
                    <option value="guest">میوان</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">باری هەژمار</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                    <option value="active">چالاکە</option>
                    <option value="pending">چاوەڕێ</option>
                    <option value="rejected">ڕاگیراوە</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="submit" disabled={isSaving} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-semibold transition-colors disabled:opacity-50">
                  {isSaving ? 'پاشەکەوت دەکرێت...' : 'پاشەکەوتکردن'}
                </button>
                <button type="button" onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-2.5 rounded-xl font-semibold transition-colors">
                  پاشگەزبوونەوە
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
