import { useEffect, useRef, useState } from "react";
import api from "../../api/Api";
import { Camera, Loader2, Check, X } from "lucide-react";
import { toast } from "react-hot-toast";

export default function Profile() {
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    profilePictureUrl: "",
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Завантаження профілю
  //   useEffect(() => {
  //     (async () => {
  //       try {
  //         const { data } = await api.get("/User/me");
  //         setFormData({
  //           displayName: data.displayName ?? "",
  //           email: data.email ?? "",
  //           profilePictureUrl: data.profilePictureUrl ?? "",
  //         });
  //         localStorage.setItem(
  //           "user",
  //           JSON.stringify({
  //             name: data.displayName,
  //             avatar: data.profilePictureUrl,
  //           })
  //         );
  //       } catch (err: any) {
  //         if (err.response?.status === 401) {
  //           toast.error("Сесія закінчилась. Увійдіть заново.");
  //           localStorage.clear();
  //           // window.location.href = "/login";
  //         } else toast.error("Не вдалося завантажити профіль");
  //       }
  //     })();
  //   }, []);

  const uploadAvatar = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) return toast.error("Макс. 5 МБ");

    const fd = new FormData();
    fd.append("file", file);
    setUploading(true);

    try {
      const { data } = await api.post("/User/avatar", fd);
      const url = data.profilePictureUrl;
      setFormData((prev) => ({ ...prev, profilePictureUrl: url }));
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...JSON.parse(localStorage.getItem("user") || "{}"),
          avatar: url,
        })
      );
      toast.success("Аватар оновлено");
    } catch {
      toast.error("Помилка завантаження");
    } finally {
      setUploading(false);
    }
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put("/User/me", {
        displayName: formData.displayName,
        email: formData.email,
      });
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...JSON.parse(localStorage.getItem("user") || "{}"),
          name: formData.displayName,
        })
      );
      toast.success("Профіль оновлено");
    } catch {
      toast.error("Помилка збереження");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Мій профіль</h1>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Аватар */}
        <div className="bg-gradient-to-r from-orange-500 to-red-600 p-12 text-center">
          <div className="relative inline-block">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="group cursor-pointer"
            >
              {formData.profilePictureUrl ? (
                <img
                  src={formData.profilePictureUrl}
                  alt=""
                  className="w-32 h-32 rounded-full object-cover ring-8 ring-white/30"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center text-5xl font-bold text-white ring-8 ring-white/30">
                  {formData.displayName[0] || "?"}
                </div>
              )}
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                <Camera className="w-10 h-10 text-white" />
              </div>
              {uploading && (
                <div className="absolute inset-0 rounded-full bg-black/70 flex items-center justify-center">
                  <Loader2 className="w-10 h-10 text-white animate-spin" />
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) =>
                e.target.files?.[0] && uploadAvatar(e.target.files[0])
              }
              className="hidden"
            />
          </div>
          <h2 className="text-2xl font-bold text-white mt-6">
            {formData.displayName || "Користувач"}
          </h2>
          <p className="text-white/80">{formData.email}</p>
        </div>

        {/* Форма */}
        <form onSubmit={saveProfile} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Прізвище та ім’я
            </label>
            <input
              name="displayName"
              value={formData.displayName}
              onChange={(e) =>
                setFormData({ ...formData, displayName: e.target.value })
              }
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500"
              placeholder="Іван Іванов"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500"
              placeholder="ivan@example.com"
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
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
              className="px-8 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 flex items-center gap-3 disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
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
