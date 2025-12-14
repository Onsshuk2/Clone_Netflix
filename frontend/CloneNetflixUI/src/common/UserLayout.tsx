// src/layouts/UserLayout.tsx
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { LogOut, User, ShoppingBag, ArrowUp } from "lucide-react"; // Додано ArrowUp

export default function UserLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false); // Новий стан для кнопки
  const dropdownRef = useRef<HTMLDivElement>(null);

  const token = localStorage.getItem("token");
  const isAuthenticated = !!token;

  let user = null;

  if (isAuthenticated) {
    const userJson = localStorage.getItem("user");
    if (userJson) {
      try {
        const parsedUser = JSON.parse(userJson);
        user = {
          name: parsedUser.name || "Користувач",
          avatar:
            parsedUser.avatar ||
            "https://i.pinimg.com/736x/24/49/08/2449080f7429c683bc9cba619c237d01.jpg",
          email: parsedUser.email || "",
        };
      } catch (e) {
        console.error("Не вдалося розпарсити user з localStorage", e);
      }
    }
  }

  // Закриття дропдауну при кліку поза ним
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  // Відстеження скролу для кнопки "наверх"
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Функція плавного скролу наверх
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsOpen(false);
    navigate("/login", { replace: true });
  };

  // Активні стани кнопок
  const isMoviesActive =
    location.pathname === "/dashboard" ||
    location.pathname.startsWith("/dashboard/");
  const isAnimeActive =
    location.pathname === "/dashboard-anime" ||
    location.pathname.startsWith("/dashboard-anime/");
  const isSeriesActive =
    location.pathname === "/dashboard-series" ||
    location.pathname.startsWith("/dashboard-series/");

  const baseButtonClasses =
    "inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white rounded-full shadow-xl transition-all duration-300 border-2 border-white/20 backdrop-blur-sm";

  const activeButtonClasses =
    "bg-gradient-to-r from-orange-700 to-amber-700 shadow-2xl shadow-orange-800/60 scale-105 ring-4 ring-white/40";

  const inactiveButtonClasses =
    "bg-gradient-to-r from-orange-500 to-amber-500 shadow-orange-600/40 hover:from-orange-600 hover:to-amber-600 hover:shadow-2xl hover:shadow-orange-700/50 hover:scale-105 hover:-translate-y-1 active:scale-95";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 relative">
      <header className="bg-orange-600 text-white shadow-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/dashboard" className="text-2xl font-black cursor-pointer">
            FoodDelivery
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/dashboard"
              className={`${baseButtonClasses} ${
                isMoviesActive ? activeButtonClasses : inactiveButtonClasses
              }`}
            >
              Movies
            </Link>

            <Link
              to="/dashboard-anime"
              className={`${baseButtonClasses} ${
                isAnimeActive ? activeButtonClasses : inactiveButtonClasses
              }`}
            >
              Anime
            </Link>

            <Link
              to="/dashboard-series"
              className={`${baseButtonClasses} ${
                isSeriesActive ? activeButtonClasses : inactiveButtonClasses
              }`}
            >
              Series
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 hover:bg-orange-700 px-4 py-2 rounded-xl transition"
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt=""
                    className="w-10 h-10 rounded-full ring-4 ring-white/30"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-white text-orange-600 flex items-center justify-center font-bold text-xl ring-4 ring-white/30">
                    {user?.name[0]}
                  </div>
                )}
                <span className="hidden md:block font-medium">
                  {user?.name}
                </span>
              </button>

              {/* Дропдаун профілю — без змін */}
              {isOpen && (
                <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                  <div className="p-5 bg-gradient-to-r from-orange-500 to-red-500 text-white">
                    <p className="font-bold text-lg">{user?.name}</p>
                    <p className="text-sm opacity-90">Преміум користувач</p>
                  </div>
                  <div className="py-3">
                    <Link
                      to="/profile"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 text-gray-800"
                    >
                      <User className="w-5 h-5" /> Профіль
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 text-gray-800"
                    >
                      <ShoppingBag className="w-5 h-5" /> Замовлення
                    </Link>
                    <div className="h-px bg-gray-200 my-2 mx-5" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-3 px-5 py-3 hover:bg-red-50 text-red-600 font-medium"
                    >
                      <LogOut className="w-5 h-5" /> Вийти
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <Outlet />
      </main>

      <footer className="bg-white border-t py-8 text-center text-gray-600">
        © 2025 FoodDelivery. Всі права захищені.
      </footer>

      {/* Кнопка "Повернутися наверх" */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-40 
                     w-14 h-14 bg-orange-600 hover:bg-orange-700 
                     rounded-full shadow-2xl flex items-center justify-center 
                     transition-all duration-300 
                     hover:scale-110 active:scale-95 
                     border-4 border-white/30"
          aria-label="Повернутися наверх"
        >
          <ArrowUp className="w-7 h-7 text-white" />
        </button>
      )}
    </div>
  );
}
