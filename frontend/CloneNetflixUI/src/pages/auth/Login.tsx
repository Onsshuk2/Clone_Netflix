// src/pages/Login.tsx (або де в тебе лежить)
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { $t } from "../../lib/toast"; // ← наш глобальний тост (з попереднього кроку)
import { useLanguage } from "../../contexts/LanguageContext";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();
  const navigate = useNavigate();

  const mapError = (raw: any) => {
    if (!raw) return t('auth.error_generic');
    const text = String(raw).toLowerCase();
    if (text.includes('invalid') && text.includes('credential')) return t('auth.invalid_credentials');
    if (text.includes('invalid') && text.includes('email')) return t('validation.invalid_email');
    if (text.includes('password') && text.includes('incorrect')) return t('auth.invalid_credentials');
    if (text.includes('unauthor') || text.includes('token') || text.includes('not authorized')) return t('auth.invalid_credentials');
    if (text.includes('network') || text.includes('failed') || text.includes('timeout')) return t('auth.error_generic');
    return raw;
  };

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

      if (!loginRes.ok) {
        const errData = await loginRes.json();
        throw new Error(errData.message || errData.error || "Помилка входу");
      }

      const loginData = await loginRes.json();
      const token = loginData.token;

      if (!token) throw new Error("Токен не отримано");

      localStorage.setItem("token", token);

      // 2. Витягуємо userId з токена (jwt-decode або вручну)
      let userId: string | null = null;
      try {
        const decoded: any = jwtDecode(token);  // імпортуй jwt-decode якщо ще не
        userId = decoded.sub || decoded.userId || decoded.id || decoded.nameid || null;
      } catch (decodeErr) {
        console.warn("Не вдалося декодувати токен для userId", decodeErr);
      }

      let userData: any = {};

      // 3. Якщо userId є — запитуємо повний профіль через адмінський ендпоінт
      if (userId) {
        const userRes = await fetch(`${API_URL}/api/users/admin/get-user/${userId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (userRes.ok) {
          userData = await userRes.json();
        } else {
          console.warn("Не вдалося отримати користувача по ID, статус:", userRes.status);
        }
      }

      // 4. Якщо нічого не отримали — fallback на мінімальні дані
      if (!userData || Object.keys(userData).length === 0) {
        userData = { email };
      }

      // 5. Нормалізуємо під формат UserLayout / Profile
      const normalizedUser = {
        userName:
          userData.userName ||
          userData.username ||
          userData.name ||
          userData.fullName ||
          userData.displayName ||
          (userData.email || email)?.split("@")[0] ||
          "Користувач",

        avatarUrl:
          userData.avatarUrl ||
          userData.avatar ||
          userData.photo ||
          userData.profilePicture ||
          null,

        email: userData.email || email,

        // якщо в відповіді є dateOfBirth, id тощо — додавай
        // dateOfBirth: userData.dateOfBirth || null,
      };

      localStorage.setItem("user", JSON.stringify(normalizedUser));

      $t.success(t('auth.login_success') || "Вхід успішний!");

      navigate("/dashboard");

    } catch (err: any) {
      const raw = err?.message || err?.response?.data?.message || '';
      const message = mapError(raw);
      $t.error(message);

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
          <h2 className="text-4xl font-bold text-slate-900">{t('auth.login')}</h2>
          <p className="mt-3 text-base text-slate-600">
            {t('auth.create_account')} {" "}
            <a
              href="/register"
              className="font-medium text-indigo-600 hover:text-indigo-500 transition"
            >
              {t('auth.register')}
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
                placeholder={t('auth.email_placeholder')}
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
                placeholder={t('auth.password_placeholder')}
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
            <div>
              <a
                href="/password-recovery"
                className="text-sm text-indigo-600 hover:text-indigo-500 font-medium transition"
              >
                {t('auth.forgot_password')}
              </a>
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
                  {t('auth.logging_in')}
                </>
              ) : (
                t('auth.login_button')
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
