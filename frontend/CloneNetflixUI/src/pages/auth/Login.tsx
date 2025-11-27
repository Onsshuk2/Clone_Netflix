import { useState } from "react";
import { Eye, EyeOff, CheckCircle } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Логінимося
      const loginResponse = await fetch(`${API_URL}/api/Auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        throw new Error(
          loginData.message || loginData.error || "Помилка входу"
        );
      }

      const token = loginData.token;
      if (!token) throw new Error("Токен не отримано");

      // 2. Зберігаємо токен одразу (щоб наступний запит пройшов з авторизацією)
      localStorage.setItem("token", token);

      // 3. Отримуємо дані користувача
      const meResponse = await fetch(`${API_URL}/api/Auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      let userData: any = {};

      if (meResponse.ok) {
        userData = await meResponse.json();
      } else {
        // Якщо /me не працює — пробуємо взяти з відповіді логіну (запасний варіант)
        console.warn(
          "/api/Auth/me не спрацював, беремо дані з login відповіді"
        );
        userData = loginData.user || loginData; // іноді бекенд кладе user в login-відповідь
      }

      // 4. Формуємо об’єкт користувача
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

      // 5. Зберігаємо в localStorage
      localStorage.setItem("user", JSON.stringify(userToSave));

      // 6. Успіх!
      setShowToast(true);
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Щось пішло не так");
      // Якщо щось пішло не так — очищаємо токен, щоб не висів старий
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  };

  // решта компонента без змін (форма, тости і т.д.
  return (
    <>
      {/* Весь твій красивий JSX залишається 100% тим самим */}
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Увійти в акаунт
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Або{" "}
              <a
                href="/register"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                створити акаунт
              </a>
            </p>
          </div>

          <div className="bg-white shadow-xl rounded-2xl p-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Email і Password поля — без змін */}
              <div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-lg transition flex items-center justify-center gap-2"
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
                      />
                      <path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
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

      {/* Тост успішного входу */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className="bg-green-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3">
            <CheckCircle className="w-6 h-6 flex-shrink-0" />
            <div>
              <p className="font-semibold">Вітаємо!</p>
              <p className="text-sm opacity-90">Ви успішно увійшли в акаунт</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
