import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const PasswordRecovery: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/Auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (response.ok) {
        setMessage(
          "Лист з посиланням для відновлення паролю надіслано на вашу пошту!"
        );
        // Опціонально: navigate("/confirmation-sent");
      } else {
        const data = await response.json().catch(() => ({}));
        setError(data.message || "Помилка сервера. Спробуйте пізніше.");
      }
    } catch (err) {
      setError(
        "Не вдалося підключитися до сервера. Перевірте інтернет-з'єднання."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center text-black">
          Відновлення паролю
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 mb-2">
              Введіть вашу електронну пошту
            </label>
            <input
              type="email"
              placeholder="example@gmail.com"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-black"
            />
          </div>

          {message && (
            <p className="text-green-600 mb-4 text-center font-medium">
              {message}
            </p>
          )}
          {error && (
            <p className="text-red-600 mb-4 text-center font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Відправляється..." : "Відправити посилання"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordRecovery;
