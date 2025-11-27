import { useState } from "react";
import axios from "axios";
import { Eye, EyeOff, CheckCircle } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export default function Register() {
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agree, setAgree] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setServerError("");
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.displayName.trim()) newErrors.displayName = "Введіть ім'я";
    if (!formData.email.trim()) newErrors.email = "Введіть email";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Невірний формат email";

    if (!formData.password) newErrors.password = "Введіть пароль";
    else if (formData.password.length < 6)
      newErrors.password = "Пароль має бути не менше 6 символів";

    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Паролі не співпадають";

    if (!agree) newErrors.agree = "Потрібно прийняти умови";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setServerError("");

    try {
      await axios.post(`${API_URL}/api/Auth/register`, {
        displayName: formData.displayName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      setShowToast(true);
      setFormData({
        displayName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      setAgree(false);

      setTimeout(() => setShowToast(false), 5000);
    } catch (err: any) {
      if (err.response?.data?.errors) {
        const formattedErrors: Record<string, string> = {};
        Object.keys(err.response.data.errors).forEach((key) => {
          formattedErrors[key.toLowerCase()] = err.response.data.errors[key][0];
        });
        setErrors(formattedErrors);
      }

      setServerError(
        err.response?.data?.message ||
          err.response?.data?.title ||
          "Щось пішло не так. Спробуйте ще раз."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Створити акаунт
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Або{" "}
              <a
                href="/login"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                увійти
              </a>
            </p>
          </div>

          <div className="bg-white shadow-xl rounded-2xl p-8">
            {serverError && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {serverError}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <input
                  type="text"
                  name="displayName"
                  placeholder="Михайло Іванович"
                  value={formData.displayName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                    errors.displayName ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.displayName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.displayName}
                  </p>
                )}
              </div>

              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="example@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Пароль"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 pr-12 border rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
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
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Повторіть пароль"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 pr-12 border rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                    errors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
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

              <div className="flex items-center">
                <input
                  id="agree"
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <label htmlFor="agree" className="ml-3 text-sm text-gray-700">
                  Я згоден з{" "}
                  <span className="text-indigo-600 hover:underline cursor-pointer">
                    умовами використання
                  </span>
                </label>
              </div>
              {errors.agree && (
                <p className="text-sm text-red-600 -mt-4">{errors.agree}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3.5 font-semibold rounded-lg shadow-lg transition text-white flex items-center justify-center gap-2 ${
                  isLoading
                    ? "bg-indigo-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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

      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className="bg-green-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3">
            <CheckCircle className="w-6 h-6" />
            <div>
              <p className="font-semibold">Реєстрація успішна!</p>
              <p className="text-sm opacity-90">
                Тепер ви можете увійти в акаунт
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
