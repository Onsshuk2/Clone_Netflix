// src/pages/dashboard/Profile.tsx
import React, { useState, useEffect, useRef } from "react";
import { Camera, Check, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { getMyProfile, updateMyProfile } from "../../api/User";

import ConfirmModal from "../../components/ConfirmModal";
import { deleteMyProfile } from "../../api/deleteUser";
import SubscriptionManagement from "./SubscriptionManagement";

import { useLoading } from "../../lib/useLoading";

interface ProfileData {
  userName: string;
  email: string;
  dateOfBirth: string; // "yyyy-MM-dd" або ISO
  avatarUrl: string | null;
}

export default function Profile() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { withLoading } = useLoading();

  const [profile, setProfile] = useState<ProfileData>({
    userName: "Користувач",
    email: "",
    dateOfBirth: "",
    avatarUrl: null,
  });

  const [form, setForm] = useState({
    username: "",
    email: "",
    dateOfBirth: "",
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteMyProfile();
      toast.success(t('profile.deleted_success'));
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/");
    } catch (err) {
      toast.error(t('profile.delete_failed'));
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const API_URL = import.meta.env.VITE_API_URL;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const DEFAULT_AVATAR =
    "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

  const getAvatarSrc = () => {
    if (previewUrl) return previewUrl;
    if (profile.avatarUrl) {
      if (profile.avatarUrl.startsWith("http://") || profile.avatarUrl.startsWith("https://")) {
        return profile.avatarUrl;
      }
      let cleanPath = profile.avatarUrl.replace(/^\/+/, "").replace(/^(images\/|uploads\/|avatars\/)?/, "");
      return `${API_URL}/images/${cleanPath}`;
    }
    return DEFAULT_AVATAR;
  };

  useEffect(() => {
    withLoading(async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error(t('profile.not_authorized'));
        navigate("/login");
        return;
      }

      setLoading(true);
      try {
        const data = await getMyProfile();

        setProfile(data);
        setForm({
          username: data.userName || "Користувач",
          email: data.email || "",
          dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split("T")[0] : "",
        });
        setPreviewUrl(null);

        localStorage.setItem("user", JSON.stringify(data));
      } catch (err) {
        console.error("Не вдалося завантажити профіль", err);
        toast.error(t('profile.read_error'));
      } finally {
        setLoading(false);
      }
    });
  }, [navigate, t]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('profile.image_too_large'));
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error(t('profile.select_image'));
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.username.trim()) {
      toast.error(t('validation.enter_name'));
      return;
    }

    await withLoading(async () => {
      setLoading(true);

      try {
        const formData = new FormData();
        formData.append("UserId", jwtDecode(localStorage.getItem("token")!).sub || "");
        formData.append("Username", form.username.trim());
        formData.append("Email", form.email.trim());
        formData.append("DateOfBirth", form.dateOfBirth || "");

        if (selectedFile) formData.append("avatar", selectedFile);

        const updatedData = await updateMyProfile(formData);

        setProfile(updatedData);
        setForm({
          username: updatedData.userName || form.username,
          email: updatedData.email || form.email,
          dateOfBirth: updatedData.dateOfBirth ? updatedData.dateOfBirth.split("T")[0] : form.dateOfBirth,
        });
        setPreviewUrl(null);
        setSelectedFile(null);

        toast.success(t('profile.profile_updated'));
      } catch (err) {
        console.error(err);
        toast.error(t('profile.update_failed'));
      } finally {
        setLoading(false);
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-indigo-950/30 to-black py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-center mb-12 bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent tracking-tight">
          {t("profile.title") || "Мій профіль"}
        </h1>

        <div className="bg-gray-900/70 backdrop-blur-xl rounded-3xl border border-gray-800/80 shadow-2xl shadow-black/50 overflow-hidden">
          {/* Аватар + заголовок */}
          <div className="relative px-6 pt-16 pb-12 text-center bg-gradient-to-b from-indigo-950/40 to-transparent">
            <div className="relative inline-block group mx-auto">
              <img
                src={getAvatarSrc()}
                alt="Аватар користувача"
                className="w-40 h-40 sm:w-48 sm:h-48 rounded-full object-cover ring-8 ring-indigo-600/30 shadow-2xl transition-transform duration-300 group-hover:scale-105 cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = DEFAULT_AVATAR;
                  (e.target as HTMLImageElement).onerror = null;
                }}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 bg-gray-900 p-3.5 rounded-full border-2 border-indigo-500/50 shadow-lg hover:bg-gray-800 transition"
              >
                <Camera className="w-6 h-6 text-indigo-400" />
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
              />
            </div>

            <h2 className="mt-8 text-3xl sm:text-4xl font-bold text-white">
              {form.username || profile.userName}
            </h2>
            <p className="mt-3 text-lg text-gray-400">
              {form.email || profile.email || "—"}
            </p>
          </div>

          {/* Форма */}
          <form onSubmit={handleSubmit} className="px-6 sm:px-10 py-10 space-y-8">
            <div className="grid gap-7 md:grid-cols-2">
              <div>
                <label className="block text-gray-300 font-medium mb-2.5">
                  {t('profile.full_name')}
                </label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="w-full px-5 py-4 bg-gray-800/60 border border-gray-700 rounded-2xl text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none transition"
                  placeholder={t('profile.enter_name')}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-2.5">
                  {t('profile.email')}
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-5 py-4 bg-gray-800/60 border border-gray-700 rounded-2xl text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none transition"
                  placeholder={t('auth.email_placeholder')}
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-2.5">
                {t('profile.date_of_birth')}
              </label>
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                className="w-full px-5 py-4 bg-gray-800/60 border border-gray-700 rounded-2xl text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none transition"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-10 border-t border-gray-800">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 py-4 px-6 border border-gray-600 rounded-2xl text-gray-300 hover:bg-gray-800/60 transition flex items-center justify-center gap-2 order-2 sm:order-1"
              >
                <X size={18} /> {t('profile.cancel')}
              </button>

              <button
                type="submit"
                disabled={loading || !form.username.trim()}
                className="flex-1 py-4 px-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-2xl font-semibold text-white shadow-lg shadow-indigo-900/40 transition disabled:opacity-60 flex items-center justify-center gap-2 order-1 sm:order-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <Check size={18} />
                )}
                {t('profile.save')}
              </button>

              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="flex-1 py-4 px-6 bg-gradient-to-r from-red-700 to-rose-700 hover:from-red-600 hover:to-rose-600 rounded-2xl font-semibold text-white shadow-lg transition order-3"
              >
                {language === 'uk' ? 'Видалити акаунт' : 'Delete account'}
              </button>
            </div>
          </form>


          <div className="border-t border-gray-800 bg-gray-950/30 px-6 sm:px-10 py-12">
            <SubscriptionManagement />
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title={t('profile.delete_confirm_title_clear') !== 'profile.delete_confirm_title_clear' ? t('profile.delete_confirm_title_clear') : (language === 'uk' ? 'Видалення акаунта' : 'Delete account')}
        description={t('profile.delete_confirm_desc_clear') !== 'profile.delete_confirm_desc_clear' ? t('profile.delete_confirm_desc_clear') : (language === 'uk' ? 'Після видалення акаунта всі ваші дані буде втрачено. Ви впевнені, що хочете продовжити?' : 'After deleting your account, all your data will be lost. Are you sure you want to continue?')}
        confirmText={deleting ? (t('profile.deleting') !== 'profile.deleting' ? t('profile.deleting') : (language === 'uk' ? 'Видалення...' : 'Deleting...')) : (t('profile.confirm_delete_clear') !== 'profile.confirm_delete_clear' ? t('profile.confirm_delete_clear') : (language === 'uk' ? 'Видалити назавжди' : 'Delete permanently'))}
        cancelText={t('profile.cancel') !== 'profile.cancel' ? t('profile.cancel') : (language === 'uk' ? 'Скасувати' : 'Cancel')}
      />
    </div>
  );
}