// src/pages/Profile.tsx
import { useEffect, useState, useRef } from "react";
import { Camera, Check, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { jwtDecode } from "jwt-decode";

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

  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    profilePictureUrl: "" as string | null,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null); // Новий файл
  const [previewUrl, setPreviewUrl] = useState<string | null>(null); // Прев’ю
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Завантаження даних при старті
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      setFormData({
        displayName: parsed.name,
        email: parsed.email || "",
        profilePictureUrl: parsed.avatar || null,
      });
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
      setFormData({
        displayName: name,
        email,
        profilePictureUrl: avatar,
      });
      setPreviewUrl(avatar);

      localStorage.setItem("user", JSON.stringify(fallbackUser));
    } catch (err) {
      toast.error("Помилка читання даних");
    }
  }, []);

  // Відкриття вибору файлу
  const openFilePicker = () => fileInputRef.current?.click();

  // Коли обрали файл — показуємо прев’ю
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
      setUser((prev) => ({ ...prev, avatar: dataUrl })); // миттєве прев’ю
    };
    reader.readAsDataURL(file);

    toast.success("Фото обрано! Натисніть «Зберегти зміни»");
  };

  // Збереження профілю + аватару одним запитом на PUT /api/User/me
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let avatarToSend = formData.profilePictureUrl;

      // Якщо є новий файл — конвертуємо в base64
      if (selectedFile) {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(selectedFile);
        });
        avatarToSend = base64;
      }

      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/User/me`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            displayName: formData.displayName,
            email: formData.email,
            profilePictureUrl: avatarToSend, // відправляємо base64 або старий URL
          }),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Помилка збереження");
      }

      const result = await response.json();

      const finalAvatar = selectedFile
        ? await fileToDataUrl(selectedFile) // залишаємо base64 локально
        : result.profilePictureUrl || formData.profilePictureUrl;

      const updatedUser = {
        name: formData.displayName,
        email: formData.email,
        avatar: finalAvatar,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setSelectedFile(null);
      setPreviewUrl(finalAvatar);

      toast.success("Профіль та аватар збережено!");
    } catch (err: any) {
      toast.error(err.message || "Не вдалося зберегти");
    } finally {
      setLoading(false);
    }
  };

  // Допоміжна функція
  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Мій профіль</h1>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Шапка */}
        <div className="bg-gradient-to-r from-orange-500 to-red-600 p-12 text-center">
          <div className="relative inline-block">
            <img
              src={
                previewUrl ||
                user.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user.name
                )}&background=fff&color=ea580c&size=128&bold=true`
              }
              alt="Аватар"
              className="w-32 h-32 rounded-full object-cover ring-8 ring-white/30 shadow-2xl cursor-pointer transition-transform hover:scale-105"
              onClick={openFilePicker}
            />

            <div
              onClick={openFilePicker}
              className="absolute bottom-0 right-0 bg-white rounded-full p-3 shadow-lg cursor-pointer hover:bg-gray-100 transition"
            >
              <Camera className="w-6 h-6 text-orange-600" />
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          <h2 className="text-2xl font-bold text-white mt-6">{user.name}</h2>
          <p className="text-white/80 text-lg">
            {user.email || "Email не вказано"}
          </p>
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Прізвище та ім’я
            </label>
            <input
              required
              value={formData.displayName}
              onChange={(e) =>
                setFormData({ ...formData, displayName: e.target.value })
              }
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
              placeholder="Іван Іванов"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
              placeholder="ivan@example.com"
            />
          </div>

          <div className="flex justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-6 py-3 border rounded-xl hover:bg-gray-50 flex items-center gap-2"
            >
              <X className="w-5 h-5" /> Скасувати
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 flex items-center gap-3 disabled:opacity-70 shadow-lg"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Check className="w-5 h-5" />
              )}
              Зберегти зміни
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
