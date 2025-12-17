// src/pages/Profile.tsx
import { useEffect, useState, useRef } from "react";
import { Camera, Check, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import { updateMyProfile } from "../../api/User";

interface UserFromStorage {
  name: string;
  avatar: string | null;
  email: string;
}

interface JwtPayload {
  DisplayName?: string;
  Email?: string;
  ProfilePictureUrl?: string;
  exp?: number;
}

export default function Profile() {
  const [user, setUser] = useState<UserFromStorage>({
    name: "Користувач",
    avatar: null,
    email: "",
  });

  const [displayName, setDisplayName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      setDisplayName(parsed.name);
      setPreviewUrl(parsed.avatar || null);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Ви не авторизовані");
      return;
    }

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const name = decoded.DisplayName || "Користувач";
      const email = decoded.Email || "";
      const avatar = decoded.ProfilePictureUrl || null;

      const fallbackUser = { name, avatar, email };
      setUser(fallbackUser);
      setDisplayName(name);
      setPreviewUrl(avatar);
      localStorage.setItem("user", JSON.stringify(fallbackUser));
    } catch (err) {
      toast.error("Помилка читання даних");
    }
  }, []);

  const openFilePicker = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Зображення занадто велике (макс. 5 МБ)");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Оберіть зображення");
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setPreviewUrl(dataUrl);
      setUser((prev) => ({ ...prev, avatar: dataUrl }));
    };
    reader.readAsDataURL(file);

    toast.success("Фото обрано! Натисніть «Зберегти зміни»");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    setLoading(true);

    try {
      let profilePictureUrl: string | null = user.avatar;

      if (selectedFile) {
        profilePictureUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(selectedFile);
        });
      }

      const result = await updateMyProfile({
        displayName: displayName.trim(),
        profilePictureUrl: profilePictureUrl || null,
      });

      const finalAvatar = selectedFile
        ? profilePictureUrl
        : result.profilePictureUrl || user.avatar;

      const updatedUser = {
        name: displayName.trim(),
        email: user.email,
        avatar: finalAvatar,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setSelectedFile(null);
      setPreviewUrl(finalAvatar);

      toast.success("Профіль успішно оновлено!");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black mb-10 text-center bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Мій профіль
        </h1>

        {/* Картка профілю */}
        <div className="bg-gray-900/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-gray-800 overflow-hidden">
          {/* Шапка з аватаром */}
          <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 p-12 text-center">
            <div className="relative inline-block">
              <img
                src={
                  previewUrl ||
                  user.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff&size=256&bold=true`
                }
                alt="Аватар"
                className="w-40 h-40 rounded-full object-cover ring-8 ring-white/20 shadow-2xl cursor-pointer transition-all duration-300 hover:scale-105 hover:ring-indigo-500/50"
                onClick={openFilePicker}
              />

              <div
                onClick={openFilePicker}
                className="absolute bottom-2 right-2 bg-gray-900/80 backdrop-blur-md rounded-full p-4 shadow-xl cursor-pointer hover:bg-gray-800 transition-all duration-300 hover:scale-110 border border-indigo-500/30"
              >
                <Camera className="w-7 h-7 text-indigo-400" />
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            <h2 className="text-3xl font-bold text-white mt-8">{user.name}</h2>
            <p className="text-xl text-gray-300 mt-2">
              {user.email || "Email не вказано"}
            </p>
            <p className="text-sm text-indigo-300 mt-4">Преміум користувач</p>
          </div>

          {/* Форма редагування */}
          <form onSubmit={handleSubmit} className="p-10 space-y-8">
            <div>
              <label className="block text-lg font-medium text-gray-300 mb-3">
                Ім'я та прізвище
              </label>
              <input
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-6 py-4 bg-gray-800/50 border border-gray-700 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition"
                placeholder="Введіть ваше ім'я"
              />
            </div>

            {/* Кнопки */}
            <div className="flex justify-end gap-6 pt-8">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-8 py-4 border border-gray-700 rounded-2xl font-medium text-gray-300 hover:bg-gray-800/50 hover:border-gray-600 transition flex items-center gap-3"
              >
                <X className="w-5 h-5" />
                Скасувати
              </button>

              <button
                type="submit"
                disabled={loading || !displayName.trim()}
                className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-900/50 transition-all duration-300 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-3"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Check className="w-6 h-6" />
                )}
                Зберегти зміни
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}