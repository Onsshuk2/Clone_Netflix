import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const PasswordReset: React.FC = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;
  const location = useLocation();
  const navigate = useNavigate();

  const query = new URLSearchParams(location.search);
  const token = query.get("token");
  const email = query.get("email");

  useEffect(() => {
    if (!token || !email) {
      setError("Посилання для відновлення паролю недійсне або пошкоджене.");
    }
  }, [token, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Паролі не співпадають");
      return;
    }

    if (newPassword.length < 8) {
      setError("Пароль має бути не коротшим за 8 символів");
      return;
    }

    if (!token || !email) {
      setError("Немає даних для зміни паролю");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/Auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          email: email?.trim(),
          newPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setMessage("Пароль успішно змінено! Зараз перенаправимо на вхід...");
        setTimeout(() => navigate("/login", { replace: true }), 2200);
      } else {
        setError(
          data.message ||
          "Не вдалося змінити пароль. Посилання могло бути використане або прострочене."
        );
      }
    } catch {
      setError("Помилка з'єднання з сервером. Перевірте інтернет.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="px-8 pt-10 pb-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">
            Новий пароль
          </h2>
          <p className="text-center text-gray-600 mb-8 text-sm">
            Введіть новий пароль для вашого облікового запису
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-300 text-red-800 rounded-lg text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-6 p-4 bg-green-50 border border-green-300 text-green-800 rounded-lg text-sm">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Новий пароль */}
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Новий пароль
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="
        w-full px-4 py-3 pr-12 
        rounded-lg border border-gray-300 
        text-gray-900 placeholder-gray-400 bg-white
        focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 
        focus:outline-none transition duration-150
        h-12               /* фіксована висота */
        leading-normal     /* стабілізує вертикальне вирівнювання */
      "
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Мінімум 8 символів"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="
        absolute top-1/2 -translate-y-1/2 right-0 
        flex items-center justify-center 
        w-12 h-full 
        text-gray-500 hover:text-gray-700 focus:text-indigo-600 
        transition-colors
      "
                  aria-label={showNewPassword ? "Приховати пароль" : "Показати пароль"}
                >
                  {showNewPassword ? (
                    <EyeOff className="w-5 h-5" strokeWidth={2} />
                  ) : (
                    <Eye className="w-5 h-5" strokeWidth={2} />
                  )}
                </button>
              </div>
            </div>

            {/* Підтвердження пароля */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Підтвердіть пароль
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="
        w-full px-4 py-3 pr-12 
        rounded-lg border border-gray-300 
        text-gray-900 placeholder-gray-400 bg-white
        focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 
        focus:outline-none transition duration-150
        h-12               /* фіксована висота */
        leading-normal     /* стабілізує вертикальне вирівнювання */
      "
                  required
                  autoComplete="new-password"
                  placeholder="Повторіть пароль"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="
        absolute top-1/2 -translate-y-1/2 right-0 
        flex items-center justify-center 
        w-12 h-full 
        text-gray-500 hover:text-gray-700 focus:text-indigo-600 
        transition-colors
      "
                  aria-label={showConfirmPassword ? "Приховати пароль" : "Показати пароль"}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" strokeWidth={2} />
                  ) : (
                    <Eye className="w-5 h-5" strokeWidth={2} />
                  )}
                </button>
              </div>
            </div>
            Чому це вирівнює ідеально:
            <button
              type="submit"
              disabled={loading || !token || !email}
              className={`
                w-full py-3.5 px-4 rounded-lg font-medium text-white text-base
                transition duration-200 ease-in-out
                ${loading || !token || !email
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-sm hover:shadow"
                }
              `}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Змінюємо...
                </span>
              ) : (
                "Змінити пароль"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PasswordReset;