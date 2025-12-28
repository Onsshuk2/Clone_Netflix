// src/pages/Register.tsx
import { useState } from "react";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import { $t } from "../../lib/Toast"; // ← наш глобальний тост
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";

const API_URL = import.meta.env.VITE_API_URL;

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agree, setAgree] = useState(false);
  const { t } = useLanguage();

  const mapError = (raw: any) => {
    if (!raw) return t('auth.error_generic');
    const text = String(raw).toLowerCase();
    if (text.includes('invalid') && text.includes('email')) return t('validation.invalid_email');
    if (text.includes('password') && text.includes('length')) return t('validation.password_min');
    if (text.includes('password') && text.includes('match')) return t('validation.passwords_mismatch');
    if (text.includes('accept') || text.includes('terms')) return t('validation.accept_terms');
    if (text.includes('email') && text.includes('taken')) return t('auth.error_generic');
    return raw;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.displayName.trim()) newErrors.displayName = t('profile.enter_name');
    if (!formData.email.trim()) newErrors.email = t('auth.email_placeholder');
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = t('auth.email_placeholder');

    if (!formData.password) newErrors.password = t('validation.enter_password');
    else if (formData.password.length < 8)
      newErrors.password = t('validation.password_min');

    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = t('validation.passwords_mismatch');

    if (!agree) newErrors.agree = t('validation.accept_terms');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await axios.post(`${API_URL}/api/Auth/register`, {
        displayName: formData.displayName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      // Успішно — зберігаємо ім'я і показуємо тост
      localStorage.setItem("fullname", formData.displayName.trim());

      $t.success(t('auth.register_success'));

      // Очищаємо форму
      setFormData({
        displayName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      setAgree(false);

      // Опціонально: перенаправлення через 2 секунди
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      if (err.response?.data?.errors) {
        const formattedErrors: Record<string, string> = {};
        Object.keys(err.response.data.errors).forEach((key) => {
          const field = key.toLowerCase();
          formattedErrors[field] = mapError(err.response.data.errors[key][0]);
        });
        setErrors(formattedErrors);
      }

      const raw = err.response?.data?.message || err.response?.data?.title || err.message || '';
      $t.error(mapError(raw));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-10">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-slate-900">{t('auth.create_account')}</h2>
          <p className="mt-3 text-base text-slate-600">
            {t('auth.login')} {" "}
            <a
              href="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500 transition"
            >
              {t('auth.login')}
            </a>
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border border-slate-200/50">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Ім'я */}
            <div>
              <input
                type="text"
                name="displayName"
                placeholder="Михайло Іванович"
                value={formData.displayName}
                onChange={handleChange}
                className={`w-full px-5 py-4 bg-slate-50 border rounded-xl placeholder-slate-400 text-slate-900 text-base focus:outline-none focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 transition ${errors.displayName ? "border-red-500" : "border-slate-300"
                  }`}
              />
              {errors.displayName && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.displayName}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <input
                type="email"
                name="email"
                placeholder={t('auth.email_placeholder')}
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-5 py-4 bg-slate-50 border rounded-xl placeholder-slate-400 text-slate-900 text-base focus:outline-none focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 transition ${errors.email ? "border-red-500" : "border-slate-300"
                  }`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Пароль */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder={t('auth.password_placeholder')}
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-5 py-4 pr-14 bg-slate-50 border rounded-xl placeholder-slate-400 text-slate-900 text-base focus:outline-none focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 transition ${errors.password ? "border-red-500" : "border-slate-300"
                  }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-5 text-slate-500 hover:text-slate-700"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Повтор пароля */}
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                placeholder={t('auth.password_placeholder')}
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-5 py-4 pr-14 bg-slate-50 border rounded-xl placeholder-slate-400 text-slate-900 text-base focus:outline-none focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 transition ${errors.confirmPassword ? "border-red-500" : "border-slate-300"
                  }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute inset-y-0 right-0 flex items-center pr-5 text-slate-500 hover:text-slate-700"
              >
                {showConfirm ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Чекбокс */}
            <div className="flex items-center">
              <input
                id="agree"
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
              />
              <label htmlFor="agree" className="ml-3 text-sm text-gray-700">
                  {t('auth.agree_prefix')} {" "}
                  <a href="/terms" className="text-indigo-600 hover:underline cursor-pointer">
                    {t('auth.terms')}
                  </a>
                </label>
            </div>
            {errors.agree && (
              <p className="text-sm text-red-600 -mt-3">{errors.agree}</p>
            )}

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
