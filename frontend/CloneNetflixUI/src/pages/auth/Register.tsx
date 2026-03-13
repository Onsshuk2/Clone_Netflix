// src/pages/Register.tsx
import { useState } from "react";
<<<<<<< HEAD
=======
import axios from "axios";
>>>>>>> b629eb947d56b1837a8fae1f71e47b3ebc8be3a3
import { Eye, EyeOff } from "lucide-react";
import { $t } from "../../lib/toast";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";

<<<<<<< HEAD


const API_URL = import.meta.env.VITE_API_URL;


=======
const API_URL = import.meta.env.VITE_API_URL;

>>>>>>> b629eb947d56b1837a8fae1f71e47b3ebc8be3a3
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
<<<<<<< HEAD
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
=======
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
>>>>>>> b629eb947d56b1837a8fae1f71e47b3ebc8be3a3
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
<<<<<<< HEAD
      newErrors.email = t("validation.enter_email") || "Введіть email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = t("validation.invalid_email") || "Невірний формат email";
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = t("validation.enter_dob") || "Вкажіть дату народження";
    }

    if (!formData.password) {
      newErrors.password = t("validation.enter_password") || "Введіть пароль";
    } else if (formData.password.length < 8) {
      newErrors.password = t("validation.password_min") || "Пароль має бути не менше 8 символів";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t("validation.passwords_mismatch") || "Паролі не співпадають";
    }

    if (!agree) {
      newErrors.agree = t("validation.accept_terms") || "Потрібна згода з умовами";
=======
      newErrors.email = t('validation.enter_email');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = t('validation.invalid_email');
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = t('validation.enter_dob');
    }

    if (!formData.password) {
      newErrors.password = t('validation.enter_password');
    } else if (formData.password.length < 8) {
      newErrors.password = t('validation.password_min');
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('validation.passwords_mismatch');
    }

    if (!agree) {
      newErrors.agree = t('validation.accept_terms');
>>>>>>> b629eb947d56b1837a8fae1f71e47b3ebc8be3a3
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

<<<<<<< HEAD
  // Звичайна реєстрація (email + пароль)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
=======
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
>>>>>>> b629eb947d56b1837a8fae1f71e47b3ebc8be3a3

    const payload = {
      Email: formData.email.trim(),
      Password: formData.password,
      ConfirmPassword: formData.confirmPassword,
      DateOfBirth: formData.dateOfBirth,
    };

<<<<<<< HEAD
    try {
      const res = await fetch(`${API_URL}/api/Auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        const message =
          errData.message ||
          errData.errors?.Email?.[0] ||
          errData.errors?.Password?.[0] ||
          "Помилка реєстрації";
        throw new Error(message);
      }

      $t.success(t("auth.register_success") || "Реєстрація успішна! Увійдіть в акаунт.");
      setTimeout(() => navigate("/login"), 1800);
    } catch (err: any) {
      const msg = err.message || t("auth.error_generic") || "Щось пішло не так...";

      if (msg.toLowerCase().includes("already") || msg.includes("вже існує")) {
        setErrors({ email: t("auth.email_taken") || "Такий email вже зареєстровано" });
      }

      $t.error(msg);
=======
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
>>>>>>> b629eb947d56b1837a8fae1f71e47b3ebc8be3a3
    } finally {
      setIsLoading(false);
    }
  };

<<<<<<< HEAD


  return (

    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-indigo-950/40 to-black px-4 py-12">
      <div className="w-full max-w-lg bg-gray-900/85 backdrop-blur-2xl rounded-3xl border border-gray-800/60 shadow-2xl shadow-indigo-950/50 overflow-hidden transform transition-all duration-500 hover:shadow-indigo-900/40">
        <div className="px-10 pt-14 pb-12">
=======
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-indigo-950/40 to-black px-4 py-12">
      <div className="w-full max-w-lg bg-gray-900/85 backdrop-blur-2xl rounded-3xl border border-gray-800/60 shadow-2xl shadow-indigo-950/50 overflow-hidden transform transition-all duration-500 hover:shadow-indigo-900/40">
        <div className="px-10 pt-14 pb-12">
          {/* Заголовок з градієнтом */}
>>>>>>> b629eb947d56b1837a8fae1f71e47b3ebc8be3a3
          <h2 className="text-4xl sm:text-5xl font-extrabold text-center mb-4 bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent tracking-tight drop-shadow-lg">
            {t("auth.create_account") || "Створити акаунт"}
          </h2>

          <p className="text-center text-gray-400 mb-10 text-base font-light">
<<<<<<< HEAD
            {t("auth.already_have_account") || "Вже є акаунт?"}{" "}
=======
            {t('auth.already_have_account')} {" "}
>>>>>>> b629eb947d56b1837a8fae1f71e47b3ebc8be3a3
            <a
              href="/login"
              className="text-indigo-400 hover:text-indigo-300 transition-colors duration-200 font-medium"
            >
<<<<<<< HEAD
              {t("auth.login") || "Увійти"}
=======
              {t('auth.login')}
>>>>>>> b629eb947d56b1837a8fae1f71e47b3ebc8be3a3
            </a>
          </p>

          <form className="space-y-8" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <input
                type="email"
                name="email"
<<<<<<< HEAD
                placeholder={t("auth.email_placeholder") || "Ваш email"}
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-6 py-4 bg-gray-800/70 border ${errors.email ? "border-red-500/60" : "border-gray-700/80"
                  } rounded-2xl text-white placeholder-gray-500 text-base focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 focus:shadow-lg focus:shadow-indigo-500/20 outline-none transition-all duration-300 ease-in-out shadow-inner`}
                autoComplete="email"
                required
              />
              {errors.email && <p className="mt-2 text-sm text-red-400">{errors.email}</p>}
=======
                placeholder={t('auth.email_placeholder')}
                value={formData.email}
                onChange={handleChange}
                className={`
                  w-full px-6 py-4 
                  bg-gray-800/70 border border-gray-700/80 rounded-2xl 
                  text-white placeholder-gray-500 text-base
                  focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 focus:shadow-lg focus:shadow-indigo-500/20
                  outline-none transition-all duration-300 ease-in-out
                  shadow-inner
                  ${errors.email ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/30" : ""}
                `}
                required
                autoComplete="email"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-400 font-medium">{errors.email}</p>
              )}
>>>>>>> b629eb947d56b1837a8fae1f71e47b3ebc8be3a3
            </div>

            {/* Дата народження */}
            <div>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
<<<<<<< HEAD
                className={`w-full px-6 py-4 bg-gray-800/70 border ${errors.dateOfBirth ? "border-red-500/60" : "border-gray-700/80"
                  } rounded-2xl text-white text-base focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 focus:shadow-lg focus:shadow-indigo-500/20 outline-none transition-all duration-300 ease-in-out shadow-inner`}
                required
              />
              {errors.dateOfBirth && (
                <p className="mt-2 text-sm text-red-400">{errors.dateOfBirth}</p>
=======
                className={`
                  w-full px-6 py-4 
                  bg-gray-800/70 border border-gray-700/80 rounded-2xl 
                  text-white text-base
                  focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 focus:shadow-lg focus:shadow-indigo-500/20
                  outline-none transition-all duration-300 ease-in-out
                  shadow-inner
                  ${errors.dateOfBirth ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/30" : ""}
                `}
              />
              {errors.dateOfBirth && (
                <p className="mt-2 text-sm text-red-400 font-medium">{errors.dateOfBirth}</p>
>>>>>>> b629eb947d56b1837a8fae1f71e47b3ebc8be3a3
              )}
            </div>

            {/* Пароль */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
<<<<<<< HEAD
                placeholder={t("auth.password_placeholder") || "Пароль"}
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-6 py-4 pr-14 bg-gray-800/70 border ${errors.password ? "border-red-500/60" : "border-gray-700/80"
                  } rounded-2xl text-white placeholder-gray-500 text-base focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 focus:shadow-lg focus:shadow-indigo-500/20 outline-none transition-all duration-300 ease-in-out shadow-inner`}
                autoComplete="new-password"
                required
=======
                placeholder={t('auth.password_placeholder')}
                value={formData.password}
                onChange={handleChange}
                className={`
                  w-full px-6 py-4 pr-14 
                  bg-gray-800/70 border border-gray-700/80 rounded-2xl 
                  text-white placeholder-gray-500 text-base
                  focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 focus:shadow-lg focus:shadow-indigo-500/20
                  outline-none transition-all duration-300 ease-in-out
                  shadow-inner
                  ${errors.password ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/30" : ""}
                `}
                required
                autoComplete="new-password"
>>>>>>> b629eb947d56b1837a8fae1f71e47b3ebc8be3a3
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
<<<<<<< HEAD
                className="absolute top-1/2 right-5 -translate-y-1/2 text-gray-400 hover:text-indigo-400 transition-colors duration-200"
=======
                className="
                  absolute top-1/2 right-5 -translate-y-1/2 
                  text-gray-400 hover:text-indigo-400 transition-colors duration-200
                "
>>>>>>> b629eb947d56b1837a8fae1f71e47b3ebc8be3a3
              >
                {showPassword ? (
                  <EyeOff className="w-6 h-6" strokeWidth={2.5} />
                ) : (
                  <Eye className="w-6 h-6" strokeWidth={2.5} />
                )}
              </button>
<<<<<<< HEAD
              {errors.password && <p className="mt-2 text-sm text-red-400">{errors.password}</p>}
            </div>

            {/* Підтвердження пароля */}
=======
              {errors.password && (
                <p className="mt-2 text-sm text-red-400 font-medium">{errors.password}</p>
              )}
            </div>

            {/* Повтор пароля */}
>>>>>>> b629eb947d56b1837a8fae1f71e47b3ebc8be3a3
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
<<<<<<< HEAD
                placeholder={t("auth.confirm_password") || "Підтвердіть пароль"}
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-6 py-4 pr-14 bg-gray-800/70 border ${errors.confirmPassword ? "border-red-500/60" : "border-gray-700/80"
                  } rounded-2xl text-white placeholder-gray-500 text-base focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 focus:shadow-lg focus:shadow-indigo-500/20 outline-none transition-all duration-300 ease-in-out shadow-inner`}
                autoComplete="new-password"
                required
=======
                placeholder={t('auth.password_placeholder')}
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`
                  w-full px-6 py-4 pr-14 
                  bg-gray-800/70 border border-gray-700/80 rounded-2xl 
                  text-white placeholder-gray-500 text-base
                  focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 focus:shadow-lg focus:shadow-indigo-500/20
                  outline-none transition-all duration-300 ease-in-out
                  shadow-inner
                  ${errors.confirmPassword ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/30" : ""}
                `}
                required
                autoComplete="new-password"
>>>>>>> b629eb947d56b1837a8fae1f71e47b3ebc8be3a3
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
<<<<<<< HEAD
                className="absolute top-1/2 right-5 -translate-y-1/2 text-gray-400 hover:text-indigo-400 transition-colors duration-200"
=======
                className="
                  absolute top-1/2 right-5 -translate-y-1/2 
                  text-gray-400 hover:text-indigo-400 transition-colors duration-200
                "
>>>>>>> b629eb947d56b1837a8fae1f71e47b3ebc8be3a3
              >
                {showConfirm ? (
                  <EyeOff className="w-6 h-6" strokeWidth={2.5} />
                ) : (
                  <Eye className="w-6 h-6" strokeWidth={2.5} />
                )}
              </button>
              {errors.confirmPassword && (
<<<<<<< HEAD
                <p className="mt-2 text-sm text-red-400">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Згода з умовами */}
=======
                <p className="mt-2 text-sm text-red-400 font-medium">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Згода */}
>>>>>>> b629eb947d56b1837a8fae1f71e47b3ebc8be3a3
            <div className="flex items-center gap-3 pt-2">
              <input
                id="agree"
                type="checkbox"
                checked={agree}
<<<<<<< HEAD
                onChange={(e) => setAgree(e.target.checked)}
                className="h-5 w-5 text-indigo-600 rounded border-gray-700/80 focus:ring-indigo-500/50 bg-gray-800/70"
              />
              <label htmlFor="agree" className="text-sm text-gray-300 select-none">
                {t("auth.agree_prefix") || "Я погоджуюсь з"}{" "}
=======
                onChange={e => setAgree(e.target.checked)}
                className="h-5 w-5 text-indigo-600 rounded border-gray-700/80 focus:ring-indigo-500/50 bg-gray-800/70"
              />
              <label htmlFor="agree" className="text-sm text-gray-300 select-none">
                {t('auth.agree_prefix')} {" "}
>>>>>>> b629eb947d56b1837a8fae1f71e47b3ebc8be3a3
                <a
                  href="/terms"
                  className="text-indigo-400 hover:text-indigo-300 transition-colors duration-200 underline underline-offset-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
<<<<<<< HEAD
                  {t("auth.terms") || "умовами використання"}
                </a>
              </label>
            </div>
            {errors.agree && <p className="text-sm text-red-400">{errors.agree}</p>}
=======
                  {t('auth.terms')}
                </a>
              </label>
            </div>
            {errors.agree && (
              <p className="mt-2 text-sm text-red-400 font-medium">{errors.agree}</p>
            )}
>>>>>>> b629eb947d56b1837a8fae1f71e47b3ebc8be3a3

            {/* Кнопка реєстрації */}
            <button
              type="submit"
              disabled={isLoading}
<<<<<<< HEAD
              className={`relative w-full py-4 px-6 rounded-2xl font-semibold text-lg text-white transition-all duration-300 ease-in-out transform shadow-xl shadow-indigo-900/40 overflow-hidden ${isLoading
                ? "bg-indigo-700/50 cursor-wait opacity-70"
                : "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 active:scale-[0.98] hover:shadow-2xl hover:shadow-purple-900/50"
                }`}
=======
              className={`
                relative w-full py-4 px-6 rounded-2xl font-semibold text-lg text-white
                transition-all duration-300 ease-in-out transform
                shadow-xl shadow-indigo-900/40 overflow-hidden
                ${isLoading
                  ? "bg-indigo-700/50 cursor-wait opacity-70"
                  : "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 active:scale-[0.98] hover:shadow-2xl hover:shadow-purple-900/50"
                }
              `}
>>>>>>> b629eb947d56b1837a8fae1f71e47b3ebc8be3a3
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg
                    className="animate-spin h-6 w-6 text-white"
<<<<<<< HEAD
=======
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
>>>>>>> b629eb947d56b1837a8fae1f71e47b3ebc8be3a3
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
<<<<<<< HEAD
                  {t("auth.registering") || "Реєстрація..."}
                </span>
              ) : (
                t("auth.register_button") || "Зареєструватися"
              )}
            </button>
          </form>


        </div>
      </div>
    </div>

=======
                  {t('auth.registering') || "Реєстрація..."}
                </span>
              ) : (
                t('auth.register_button') || "Зареєструватися"
              )}

              {/* Легкий градієнтний ефект при наведенні */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </button>
          </form>
        </div>
      </div>
    </div>
>>>>>>> b629eb947d56b1837a8fae1f71e47b3ebc8be3a3
  );
}