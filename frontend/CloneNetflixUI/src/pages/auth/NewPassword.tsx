import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const PasswordReset: React.FC = () => {
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  const API_URL = import.meta.env.VITE_API_URL;
  const location = useLocation();
  const navigate = useNavigate();

  // Витягуємо token та email з URL
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");
  const email = queryParams.get("email");

  useEffect(() => {
    if (!token || !email) {
      setError("Невірне або відсутнє посилання для відновлення паролю.");
    }
  }, [token, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Скидання попередніх повідомлень
    setMessage("");
    setError("");

    // Перевірка співпадіння паролів
    if (newPassword !== confirmPassword) {
      setError("Паролі не співпадають");
      return;
    }

    if (!token || !email) {
      setError("Відсутні необхідні дані для скидання паролю.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/Auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: token,
          email: email.trim(),
          newPassword: newPassword,
        }),
      });

      if (response.ok) {
        setMessage(
          "Пароль успішно змінено! Перенаправляємо на сторінку входу..."
        );
        setTimeout(() => {
          navigate("/login"); // або "/signin", "/auth" — куди потрібно
        }, 3000);
      } else {
        const data = await response.json().catch(() => ({}));
        setError(data.message || "Помилка при зміні паролю. Спробуйте ще раз.");
      }
    } catch (err) {
      setError("Не вдалося підключитися до сервера. Перевірте інтернет.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center text-black">
          Зміна паролю
        </h2>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError("")} className="text-xl font-bold">
              ×
            </button>
          </div>
        )}

        {message && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="newPassword" className="block text-gray-700 mb-2">
              Новий пароль
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              required
              minLength={6} // можеш додати вимоги до паролю
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="confirmPassword"
              className="block text-gray-700 mb-2"
            >
              Підтвердіть новий пароль
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !token || !email}
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Зміна паролю..." : "Змінити пароль"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordReset;
