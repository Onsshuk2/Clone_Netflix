import { useEffect, useState, useRef } from "react";
import { Camera, Check, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { getMyProfile, updateMyProfile } from "../../api/User";

interface ProfileData {
  userName: string;
  email: string;
  dateOfBirth: string; // "yyyy-MM-dd" або ISO
  avatarUrl: string | null;
}

export default function Profile() {
  const { t } = useLanguage();
  const navigate = useNavigate();

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

  const API_URL = import.meta.env.VITE_API_URL;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Дефолтний аватар — стильний, темний, підходить до теми сайту
  const DEFAULT_AVATAR =
    "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

  // Функція для коректного визначення src аватара
  const getAvatarSrc = () => {
    // 1. Прев'ю щойно обраного файлу (найвищий пріоритет)
    if (previewUrl) return previewUrl;

    // 2. Аватар з профілю
    if (profile.avatarUrl) {
      // Якщо вже повний URL — беремо як є
      if (profile.avatarUrl.startsWith("http://") || profile.avatarUrl.startsWith("https://")) {
        return profile.avatarUrl;
      }

      // Якщо відносний шлях — чистимо та додаємо базу
      let cleanPath = profile.avatarUrl
        .replace(/^\/+/, "") // прибираємо зайві слеші на початку
        .replace(/^(images\/|uploads\/|avatars\/)?/, ""); // типові префікси

      return `${API_URL}/images/${cleanPath}`;
    }

    // 3. Дефолтний аватар
    return DEFAULT_AVATAR;
  };

  // Завантаження профілю
  useEffect(() => {
    const loadProfile = async () => {
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
        setPreviewUrl(null); // скидаємо прев'ю при завантаженні свіжих даних

        localStorage.setItem("user", JSON.stringify(data));
      } catch (err) {
        console.error("Не вдалося завантажити профіль", err);
        toast.error(t('profile.read_error'));
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

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

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("UserId", jwtDecode(localStorage.getItem("token")!).sub || "");
      formData.append("Username", form.username.trim());
      formData.append("Email", form.email.trim());
      formData.append("DateOfBirth", form.dateOfBirth || "");

      if (selectedFile) formData.append("avatar", selectedFile);

      const updatedData = await updateMyProfile(formData);

      // Оновлюємо стан після успішного оновлення
      setProfile(updatedData);
      setForm({
        username: updatedData.userName || form.username,
        email: updatedData.email || form.email,
        dateOfBirth: updatedData.dateOfBirth ? updatedData.dateOfBirth.split("T")[0] : form.dateOfBirth,
      });
      setPreviewUrl(null); // скидаємо локальне прев'ю після збереження
      setSelectedFile(null);

      toast.success(t('profile.profile_updated'));
    } catch (err) {
      console.error(err);
      // помилка вже оброблена в updateMyProfile або покажи загальну
      toast.error(t('profile.update_failed'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">{t('profile.loading')}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950 py-10 px-5">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-black text-center mb-10 bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
          {t("profile.title") || "Мій профіль"}
        </h1>

        <div className="bg-gray-900/70 backdrop-blur-xl rounded-3xl border border-gray-800 shadow-2xl overflow-hidden">
          {/* Аватар + верхня частина */}
          <div className="relative pt-12 pb-10 bg-gradient-to-b from-indigo-950/40 to-transparent text-center">
            <div className="relative inline-block mx-auto">
              <img
                src={getAvatarSrc()}
                alt="Аватар користувача"
                className="w-44 h-44 rounded-full object-cover ring-8 ring-indigo-500/30 shadow-2xl cursor-pointer hover:scale-105 transition"
                onClick={() => fileInputRef.current?.click()}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = DEFAULT_AVATAR;
                  (e.target as HTMLImageElement).onerror = null;
                }}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-3 right-3 bg-gray-900/90 p-4 rounded-full border border-indigo-500/40 hover:bg-gray-800 transition"
              >
                <Camera className="w-7 h-7 text-indigo-400" />
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
              />
            </div>

            <h2 className="mt-6 text-3xl font-bold text-white">{form.username || profile.userName}</h2>
            <p className="mt-2 text-gray-400">{form.email || profile.email || "—"}</p>
          </div>

          {/* Форма */}
          <form onSubmit={handleSubmit} className="p-8 space-y-7">
            <div>
              <label className="block text-gray-300 font-medium mb-2">{t('profile.full_name')}</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full px-5 py-3.5 bg-gray-800/60 border border-gray-700 rounded-xl text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none transition"
                placeholder={t('profile.enter_name')}
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-2">{t('profile.email')}</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-5 py-3.5 bg-gray-800/60 border border-gray-700 rounded-xl text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none transition"
                placeholder={t('auth.email_placeholder')}
              />
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-2">{t('profile.date_of_birth')}</label>
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                className="w-full px-5 py-3.5 bg-gray-800/60 border border-gray-700 rounded-xl text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none transition"
              />
            </div>

            <div className="flex justify-end gap-5 pt-6">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-8 py-3.5 border border-gray-600 rounded-xl text-gray-300 hover:bg-gray-800/50 transition flex items-center gap-2"
              >
                <X size={18} /> {t('profile.cancel')}
              </button>

              <button
                type="submit"
                disabled={loading || !form.username.trim()}
                className="px-10 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl font-semibold shadow-lg shadow-indigo-900/40 transition disabled:opacity-60 flex items-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <Check size={18} />
                )}
                {t('profile.save')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}