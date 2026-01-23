// src/pages/Register.tsx
import { useState } from "react";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import { $t } from "../../lib/toast";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";

const API_URL = import.meta.env.VITE_API_URL;

export default function Register() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agree, setAgree] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Email
    if (!formData.email.trim()) {
      newErrors.email = "Вкажіть email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Неправильний формат email";
    }

    // Дата народження
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Вкажіть дату народження";
    }

    // Пароль
    if (!formData.password) {
      newErrors.password = "Вкажіть пароль";
    } else if (formData.password.length < 8) {
      newErrors.password = "Мінімум 8 символів";
    }

    // Підтвердження пароля
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Паролі не співпадають";
    }

    // Згода
    if (!agree) {
      newErrors.agree = "Потрібна згода з умовами";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const payload = {
      Email: formData.email.trim(),
      Password: formData.password,
      ConfirmPassword: formData.confirmPassword,
      DateOfBirth: formData.dateOfBirth, // yyyy-MM-dd від type="date"
    };

    console.log("Відправляємо на бекенд:", payload);

    setIsLoading(true);

    try {
      await axios.post(`${API_URL}/api/Auth/register`, payload, {
        headers: { "Content-Type": "application/json" },
      });

      $t.success("Реєстрація успішна!");

      setFormData({
        email: "",
        password: "",
        confirmPassword: "",
        dateOfBirth: "",
      });
      setAgree(false);

      setTimeout(() => navigate("/login"), 1800);
    } catch (err: any) {
      console.error("Помилка реєстрації:", err.response?.status, err.response?.data);

      if (err.response?.status === 400) {
        const serverErrors = err.response.data?.errors || {};

        const formatted: Record<string, string> = {};
        Object.entries(serverErrors).forEach(([key, msgs]: [string, any]) => {
          formatted[key.toLowerCase()] = Array.isArray(msgs) ? msgs[0] : String(msgs);
        });

        setErrors(formatted);

        const firstError = Object.values(formatted)[0];
        $t.error(firstError || "Невірні дані");
      } else if (err.response?.status === 409 || String(err.response?.data?.message || "").includes("taken")) {
        $t.error("Цей email вже зайнятий");
      } else {
        $t.error("Помилка на сервері");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-10">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-slate-900">
            {t("auth.create_account") || "Створити акаунт"}
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Вже є акаунт?{" "}
            <a href="/login" className="text-indigo-600 hover:underline font-medium">
              Увійти
            </a>
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border border-slate-200/50">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email */}
            <input
              type="email"
              name="email"
              placeholder="example@gmail.com"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-5 py-4 bg-white border rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 transition-all ${errors.email ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.email && <p className="mt-1.5 text-sm text-red-600">{errors.email}</p>}

            {/* Дата народження */}
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className={`w-full px-5 py-4 bg-white border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 transition-all ${errors.dateOfBirth ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.dateOfBirth && <p className="mt-1.5 text-sm text-red-600">{errors.dateOfBirth}</p>}

            {/* Пароль */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Мінімум 8 символів"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-5 py-4 pr-12 bg-white border rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 transition-all ${errors.password ? "border-red-500" : "border-gray-300"}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {errors.password && <p className="mt-1.5 text-sm text-red-600">{errors.password}</p>}
            </div>

            {/* Повтор пароля */}
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                placeholder="Повторіть пароль"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-5 py-4 pr-12 bg-white border rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 transition-all ${errors.confirmPassword ? "border-red-500" : "border-gray-300"}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {errors.confirmPassword && <p className="mt-1.5 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>

            {/* Згода */}
            <div className="flex items-center gap-3 pt-2">
              <input
                id="agree"
                type="checkbox"
                checked={agree}
                onChange={e => setAgree(e.target.checked)}
                className="h-5 w-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
              />
              <label htmlFor="agree" className="text-sm text-gray-700 select-none">
                Я погоджуюсь з{" "}
                <a
                  href="/terms"
                  className="text-indigo-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  умовами використання
                </a>
              </label>
            </div>
            {errors.agree && <p className="text-sm text-red-600 -mt-1">{errors.agree}</p>}

            {/* Кнопка */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 mt-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white font-medium text-lg rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-25" />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" className="opacity-75" />
                  </svg>
                  Реєстрація...
                </>
              ) : (
                "Зареєструватися"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}