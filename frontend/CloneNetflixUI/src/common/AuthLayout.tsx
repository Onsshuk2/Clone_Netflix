// src/layouts/AuthLayout.tsx
import { Link, Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Хедер для незареєстрованих */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <Link
            to="/"
            className="text-3xl font-black text-orange-600 cursor-pointer"
          >
            Nexo Cinema
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-gray-700 cursor-pointer font-medium hover:text-orange-600 transition"
            >
              Вхід
            </Link>
            <Link
              to="/register"
              className="bg-orange-600 cursor-pointer text-white px-7 py-3 rounded-xl font-semibold hover:bg-orange-700 transition shadow-lg"
            >
              Реєстрація
            </Link>
          </div>
        </div>
      </header>

      {/* Контент сторінки */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
