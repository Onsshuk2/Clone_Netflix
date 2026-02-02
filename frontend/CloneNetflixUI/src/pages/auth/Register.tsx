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
      newErrors.email = t('validation.enter_email');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = t('validation.invalid_email');
    }

    // Дата народження
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = t('validation.enter_dob');
    }

    // Пароль
    if (!formData.password) {
      newErrors.password = t('validation.enter_password');
    } else if (formData.password.length < 8) {
      newErrors.password = t('validation.password_min');
    }

    // Підтвердження пароля
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('validation.passwords_mismatch');
    }

    // Згода
    if (!agree) {
      newErrors.agree = t('validation.accept_terms');
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

      $t.success(t('auth.register_success'));

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
        $t.error(firstError || t('auth.error_generic'));
      } else if (err.response?.status === 409 || String(err.response?.data?.message || "").includes("taken")) {
        $t.error(t('auth.email_taken'));
      } else {
        $t.error(t('auth.error_generic'));
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
            {t('auth.already_have_account')} {" "}
            <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition">
              {t('auth.login')}
            </a>
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border border-slate-200/50">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <input
                type="email"
                name="email"
                placeholder={t('auth.email_placeholder')}
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-5 py-4 bg-slate-50 border border-slate-300 rounded-xl placeholder-slate-400 text-slate-900 text-base focus:outline-none focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 transition ${errors.email ? "border-red-500" : "border-slate-300"}`}
                required
              />
              {errors.email && <p className="mt-1.5 text-sm text-red-600">{errors.email}</p>}
            </div>

            {/* Дата народження */}
            <div>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className={`w-full px-5 py-4 bg-slate-50 border border-slate-300 rounded-xl placeholder-slate-400 text-slate-900 text-base focus:outline-none focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 transition ${errors.dateOfBirth ? "border-red-500" : "border-slate-300"}`}
              />
              {errors.dateOfBirth && <p className="mt-1.5 text-sm text-red-600">{errors.dateOfBirth}</p>}
            </div>

            {/* Пароль */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder={t('auth.password_placeholder')}
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-5 py-4 pr-14 bg-slate-50 border border-slate-300 rounded-xl placeholder-slate-400 text-slate-900 text-base focus:outline-none focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 transition ${errors.password ? "border-red-500" : "border-slate-300"}`}
                required
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
              {errors.password && <p className="mt-1.5 text-sm text-red-600">{errors.password}</p>}
            </div>

            {/* Повтор пароля */}
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                placeholder={t('auth.confirm_password_placeholder')}
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-5 py-4 pr-14 bg-slate-50 border border-slate-300 rounded-xl placeholder-slate-400 text-slate-900 text-base focus:outline-none focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 transition ${errors.confirmPassword ? "border-red-500" : "border-slate-300"}`}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute inset-y-0 right-0 flex items-center pr-5 text-slate-500 hover:text-slate-700 transition"
              >
                {showConfirm ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
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
                {t('auth.agree_prefix')} {" "}
                <a
                  href="/terms"
                  className="text-indigo-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('auth.terms')}
                </a>
              </label>
            </div>
            {errors.agree && <p className="text-sm text-red-600 -mt-1">{errors.agree}</p>}

            {/* Кнопка */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 disabled:from-indigo-400 disabled:to-indigo-500 text-white font-semibold text-lg rounded-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 disabled:transform-none transition-all duration-200 flex items-center justify-center gap-3"
            >
              {isLoading ? (
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
                  {t('auth.registering')}
                </>
              ) : (
                t('auth.register_button')
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}