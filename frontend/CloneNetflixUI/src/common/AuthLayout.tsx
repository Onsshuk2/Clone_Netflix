// src/layouts/AuthLayout.tsx
import { Link, Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950 text-gray-100">
      {/* Хедер для авторизації — темний стиль */}
      <header className="bg-gray-900/70 backdrop-blur-2xl shadow-2xl sticky top-0 z-50 border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          {/* Логотип з градієнтом */}
          <Link to="/" className="text-3xl font-black tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Nexo Cinema
          </Link>

          {/* Кнопки Вхід / Реєстрація */}
          <div className="flex items-center gap-6">
            <Link
              to="/login"
              className="text-gray-300 font-medium hover:text-white transition duration-300"
            >
              Вхід
            </Link>
            <Link
              to="/register"
              className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-900/50 transition-all duration-300 transform hover:scale-105"
            >
              Реєстрація
            </Link>
          </div>
        </div>
      </header>

      {/* Основний контент (логін/реєстрація форми) */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}