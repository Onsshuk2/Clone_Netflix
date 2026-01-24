// src/pages/AdminUsers.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../api/Api';
import { Plus, X } from 'lucide-react';

interface User {
  id: string;
  userName: string;
  email: string;
  dateOfBirth?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  roles: string[];
}

interface UserFormData {
  userName: string;
  email: string;
  dateOfBirth: string;
  password?: string;
  confirmPassword?: string;
  roles: string[];
  imageFile?: File | null;
  imagePreview?: string;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [isCreating, setIsCreating] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const [form, setForm] = useState<UserFormData>({
    userName: '',
    email: '',
    dateOfBirth: '',
    password: '',
    confirmPassword: '',
    roles: ['User'],
    imageFile: null,
    imagePreview: '',
  });

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof UserFormData, string>>>({});

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/users/admin/get-all');
      let data = res.data;
      if (typeof data === 'string') data = JSON.parse(data);
      setUsers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Помилка завантаження користувачів:', err);
      setError('Не вдалося завантажити користувачів');
      toast.error('Помилка завантаження');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const resetForm = () => {
    setForm({
      userName: '',
      email: '',
      dateOfBirth: '',
      password: '',
      confirmPassword: '',
      roles: ['User'],
      imageFile: null,
      imagePreview: '',
    });
    setEditingId(null);
    setIsCreating(true);
    setFormErrors({});
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const loadUserForEdit = async (id: string) => {
    try {
      const res = await api.get(`/users/admin/get-user/${id}`);
      let user = res.data;
      if (typeof user === 'string') user = JSON.parse(user);

      setForm({
        userName: user.userName || '',
        email: user.email || '',
        dateOfBirth: user.dateOfBirth?.split('T')[0] || '',
        password: '',
        confirmPassword: '',
        roles: user.roles || ['User'],
        imageFile: null,
        imagePreview: user.avatarUrl || '',
      });

      setEditingId(id);
      setIsCreating(false);
      setShowModal(true);
      setFormErrors({});
    } catch (err) {
      toast.error('Не вдалося завантажити дані користувача');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const errors: Partial<Record<keyof UserFormData, string>> = {};
    if (!form.userName.trim()) errors.userName = "Ім'я обов'язкове";
    if (!form.email.trim()) errors.email = "Email обов'язковий";
    if (isCreating) {
      if (!form.password?.trim()) errors.password = "Пароль обов'язковий";
      if (form.password !== form.confirmPassword) errors.confirmPassword = "Паролі не співпадають";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const fd = new FormData();

    // Основні поля — camelCase (найпоширеніший варіант для сучасних API)
    fd.append('userName', form.userName.trim());
    fd.append('email', form.email.trim());
    if (form.dateOfBirth) fd.append('dateOfBirth', form.dateOfBirth);

    // Аватар — спробуйте 'avatar' або 'image' — якщо не працює, змініть на те, що чекає бекенд
    if (form.imageFile) {
      fd.append('avatar', form.imageFile);
    }

    // Ролі як масив
    form.roles.forEach(role => fd.append('roles', role));

    if (isCreating) {
      fd.append('password', form.password!.trim());
      fd.append('confirmPassword', form.confirmPassword!.trim());
    }

    // Дебаг — подивіться в консоль, що саме відправляється
    console.group('📤 FormData (create/update)');
    for (const [key, value] of fd.entries()) {
      console.log(
        key.padEnd(16),
        value instanceof File
          ? `${value.name} (${(value.size / 1024).toFixed(1)} KB)`
          : value
      );
    }
    console.groupEnd();

    try {
      if (isCreating) {
        await api.post('/users/admin/create', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Користувача створено');
      } else {
        await api.put(`/users/admin/update/${editingId}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Користувача оновлено');
      }

      setShowModal(false);
      resetForm();
      loadUsers();
    } catch (err: any) {
      console.error('Помилка збереження:');
      console.error('Статус:', err.response?.status);
      console.error('Дані:', err.response?.data);

      let msg = 'Помилка збереження';

      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          msg = err.response.data;
        } else if (err.response.data.message) {
          msg = err.response.data.message;
        } else if (err.response.data.errors) {
          // типова структура валідації ASP.NET
          const firstKey = Object.keys(err.response.data.errors)[0];
          if (firstKey) {
            const firstError = err.response.data.errors[firstKey];
            if (Array.isArray(firstError) && firstError.length > 0) {
              msg = firstError[0];
            }
          }
        }
      }

      toast.error(msg);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Видалити користувача?')) return;
    try {
      await api.delete(`/users/admin/delete/${id}`);
      toast.success('Користувача видалено');
      loadUsers();
    } catch (err) {
      toast.error('Помилка видалення');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Максимальний розмір файлу — 5 МБ');
        return;
      }
      setForm(prev => ({
        ...prev,
        imageFile: file,
        imagePreview: URL.createObjectURL(file),
      }));
    }
  };

  const filteredUsers = users.filter(u => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      u.userName?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term);
    const matchesRole =
      roleFilter === 'all' || u.roles?.some(r => r.toLowerCase() === roleFilter.toLowerCase());
    return matchesSearch && matchesRole;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950 py-12 px-6 text-white">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок + кнопка */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <h1 className="text-5xl font-black bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
            Користувачі
          </h1>
          <button
            onClick={openCreateModal}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 px-8 py-4 rounded-2xl font-bold shadow-xl transform hover:scale-105 transition-all flex items-center gap-2"
          >
            <Plus size={20} /> Додати користувача
          </button>
        </div>

        {/* Фільтри */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <input
            type="text"
            placeholder="Пошук за ім'ям або email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="flex-1 px-6 py-4 bg-gray-800/50 border border-gray-700 rounded-2xl text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none transition"
          />
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="px-6 py-4 bg-gray-800/50 border border-gray-700 rounded-2xl text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none transition"
          >
            <option value="all">Всі ролі</option>
            <option value="Admin">Адміністратори</option>
            <option value="Moderator">Модератори</option>
            <option value="User">Користувачі</option>
          </select>
          <button
            onClick={loadUsers}
            className="bg-gray-700 hover:bg-gray-600 px-8 py-4 rounded-2xl font-bold transition"
          >
            Оновити
          </button>
        </div>

        {/* Таблиця або статуси */}
        {loading ? (
          <div className="text-center py-32 text-indigo-400 text-2xl animate-pulse">Завантаження...</div>
        ) : error ? (
          <div className="text-center py-32 text-red-500 text-2xl">{error}</div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-32 text-gray-400 text-2xl">Користувачів не знайдено</div>
        ) : (
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-gray-800 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-800">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="px-8 py-5 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Аватар</th>
                    <th className="px-8 py-5 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Ім'я</th>
                    <th className="px-8 py-5 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Email</th>
                    <th className="px-8 py-5 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Дата народження</th>
                    <th className="px-8 py-5 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Ролі</th>
                    <th className="px-8 py-5 text-center text-sm font-semibold text-gray-300 uppercase tracking-wider">Дії</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-indigo-950/30 transition duration-200">
                      <td className="px-8 py-6">
                        <img
                          src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.userName)}&background=6366f1&color=fff&size=128`}
                          alt={user.userName}
                          className="w-14 h-14 rounded-full object-cover ring-2 ring-indigo-500/50"
                        />
                      </td>
                      <td className="px-8 py-6 font-medium text-white">{user.userName}</td>
                      <td className="px-8 py-6 text-gray-300">{user.email}</td>
                      <td className="px-8 py-6 text-gray-300">
                        {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('uk-UA') : '—'}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-wrap gap-2">
                          {user.roles.map(role => (
                            <span key={role} className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-900/50 text-indigo-300">
                              {role}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <button
                          onClick={() => loadUserForEdit(user.id)}
                          className="text-indigo-400 hover:text-indigo-300 text-2xl mr-6 transition"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-red-400 hover:text-red-300 text-2xl transition"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Модальне вікно */}
        {showModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-md p-4">
            <div className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-10">
                <div className="flex justify-between items-center mb-10">
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
                    {isCreating ? 'Додати користувача' : 'Редагувати користувача'}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-white text-4xl transition"
                  >
                    <X size={40} />
                  </button>
                </div>

                <form onSubmit={handleSave} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-gray-300 font-medium mb-3">Ім'я *</label>
                      <input
                        value={form.userName}
                        onChange={e => setForm({ ...form, userName: e.target.value })}
                        className="w-full px-6 py-5 bg-gray-800 border border-gray-700 rounded-2xl text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none transition"
                      />
                      {formErrors.userName && <p className="mt-2 text-red-400 text-sm">{formErrors.userName}</p>}
                    </div>

                    <div>
                      <label className="block text-gray-300 font-medium mb-3">Email *</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        className="w-full px-6 py-5 bg-gray-800 border border-gray-700 rounded-2xl text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none transition"
                      />
                      {formErrors.email && <p className="mt-2 text-red-400 text-sm">{formErrors.email}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-3">Дата народження</label>
                    <input
                      type="date"
                      value={form.dateOfBirth}
                      onChange={e => setForm({ ...form, dateOfBirth: e.target.value })}
                      className="w-full px-6 py-5 bg-gray-800 border border-gray-700 rounded-2xl text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none transition"
                    />
                  </div>

                  {isCreating && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label className="block text-gray-300 font-medium mb-3">Пароль *</label>
                        <input
                          type="password"
                          value={form.password || ''}
                          onChange={e => setForm({ ...form, password: e.target.value })}
                          className="w-full px-6 py-5 bg-gray-800 border border-gray-700 rounded-2xl text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none transition"
                        />
                        {formErrors.password && <p className="mt-2 text-red-400 text-sm">{formErrors.password}</p>}
                      </div>

                      <div>
                        <label className="block text-gray-300 font-medium mb-3">Підтвердження пароля *</label>
                        <input
                          type="password"
                          value={form.confirmPassword || ''}
                          onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                          className="w-full px-6 py-5 bg-gray-800 border border-gray-700 rounded-2xl text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none transition"
                        />
                        {formErrors.confirmPassword && <p className="mt-2 text-red-400 text-sm">{formErrors.confirmPassword}</p>}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-gray-300 font-medium mb-3">Аватар</label>
                    <div className="flex items-center gap-6">
                      <label className="cursor-pointer bg-indigo-900/30 hover:bg-indigo-800 px-6 py-4 rounded-xl transition text-indigo-300 font-medium">
                        Обрати фото
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                      {form.imagePreview && (
                        <img
                          src={form.imagePreview}
                          alt="Прев'ю"
                          className="w-24 h-24 rounded-full object-cover ring-2 ring-indigo-500 shadow-lg"
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-3">Ролі</label>
                    <select
                      multiple
                      value={form.roles}
                      onChange={e => {
                        const selected = Array.from(e.target.selectedOptions, opt => opt.value);
                        setForm({ ...form, roles: selected });
                      }}
                      className="w-full px-6 py-5 bg-gray-800 border border-gray-700 rounded-2xl text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none transition h-32"
                    >
                      <option value="User">Користувач</option>
                      <option value="Moderator">Модератор</option>
                      <option value="Admin">Адміністратор</option>
                    </select>
                  </div>

                  <div className="flex justify-end gap-6 pt-10 border-t border-gray-800">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-12 py-5 border border-gray-700 rounded-2xl text-gray-300 hover:bg-gray-800 transition font-medium"
                    >
                      Скасувати
                    </button>
                    <button
                      type="submit"
                      className="px-12 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-2xl text-white font-bold shadow-xl transition-all hover:scale-105"
                    >
                      {isCreating ? 'Створити' : 'Зберегти зміни'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;