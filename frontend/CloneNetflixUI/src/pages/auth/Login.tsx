// src/pages/Login.tsx (або де в тебе лежить)
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { $t } from "../../lib/toast"; // ← наш глобальний тост (з попереднього кроку)
import { jwtDecode } from 'jwt-decode';

const API_URL = import.meta.env.VITE_API_URL;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Логін
      const loginRes = await fetch(`${API_URL}/api/Auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const loginData = await loginRes.json();

      if (!loginRes.ok) {
        throw new Error(
          loginData.message || loginData.error || "Помилка входу"
        );
      }

      const token = loginData.token;
      if (!token) throw new Error("Токен не отримано");

      localStorage.setItem("token", token);

      const decoded: any = jwtDecode(token);

      // console.log("token info", decoded);
      console.log("token avatar", decoded.avatar);

      // 2. Отримуємо дані користувача
      const meRes = await fetch(`${API_URL}/api/User/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let userData: any = {};

      if (meRes.ok) {
        userData = await meRes.json();
        console.log("Міша активні пошуки токена", userData);
      } else {
        console.warn("me не спрацював → беремо з login відповіді");
        userData = loginData.user || loginData;
      }

      // 3. Формуємо об'єкт користувача
      const userToSave = {
        name:
          userData.name ||
          userData.fullName ||
          userData.username ||
          userData.email?.split("@")[0] ||
          "Користувач",
        avatar: userData.avatar || userData.photo || userData.photoURL || null,
        email: userData.email || email,
      };

      localStorage.setItem("user", JSON.stringify(userToSave));

      // Успішний тост
      $t.success("Вітаємо! Ви успішно увійшли в акаунт");

      // Перехід
      setTimeout(() => {
        //window.location.href = "/dashboard";
      }, 1300);
    } catch (err: any) {
      const message = err.message || "Щось пішло не так. Спробуйте ще раз.";
      $t.error(message);

      // Чистимо, щоб не залишився старий токен
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-10">
        {/* Заголовок */}
        <div className="text-center">
          <h2 className="text-4xl font-bold text-slate-900">Увійти в акаунт</h2>
          <p className="mt-3 text-base text-slate-600">
            Або{" "}
            <a
              href="/register"
              className="font-medium text-indigo-600 hover:text-indigo-500 transition"
            >
              створити новий акаунт
            </a>
          </p>
        </div>

        {/* Форма */}
        <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border border-slate-200/50">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <input
                type="email"
                required
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-300 rounded-xl placeholder-slate-400 text-slate-900 text-base focus:outline-none focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 transition"
              />
            </div>

            {/* Пароль */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-5 py-4 pr-14 bg-slate-50 border border-slate-300 rounded-xl placeholder-slate-400 text-slate-900 text-base focus:outline-none focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-5 text-slate-500 hover:text-slate-700 transition"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Кнопка */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 disabled:from-indigo-400 disabled:to-indigo-500 text-white font-semibold text-lg rounded-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 disabled:transform-none transition-all duration-200 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      className="opacity-25"
                    />
                    <path
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                      className="opacity-75"
                    />
                  </svg>
                  Вхід...
                </>
              ) : (
                "Увійти"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
