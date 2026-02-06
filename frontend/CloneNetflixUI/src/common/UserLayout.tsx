// src/layouts/UserLayout.tsx
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { LogOut, User, CreditCard, ArrowUp, Heart } from "lucide-react";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useLanguage } from "../contexts/LanguageContext";
import AnimatedOutlet from "../components/AnimatedOutlet";

export default function UserLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const token = localStorage.getItem("token");
  const isAuthenticated = !!token;

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"; // або твій базовий URL

  // Дефолтний аватар (стабільний, темний стиль, підходить до теми)
  const DEFAULT_AVATAR =
    "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

  // Об'єкт користувача
  const user = (() => {
    if (!isAuthenticated) return null;

    const userJson = localStorage.getItem("user");
    if (!userJson) return null;

    try {
      const parsed = JSON.parse(userJson);

      const displayName =
        parsed.userName?.trim() ||
        (parsed.email || "").split("@")[0]?.trim() ||
        "Користувач";

      return {
        name: displayName,
        avatarUrl: parsed.avatarUrl || parsed.avatar || null,
        email: parsed.email || "",
      };
    } catch (e) {
      console.error("Не вдалося розпарсити user з localStorage", e);
      return null;
    }
  })();

  // Функція для коректного src аватара (така ж логіка, як у Profile)
  const getAvatarSrc = () => {
    if (!user?.avatarUrl) return DEFAULT_AVATAR;

    // Якщо вже повний URL — беремо як є
    if (user.avatarUrl.startsWith("http://") || user.avatarUrl.startsWith("https://")) {
      return user.avatarUrl;
    }

    // Якщо відносний шлях — додаємо API_URL + чистимо префікси
    let cleanPath = user.avatarUrl
      .replace(/^\/+/, "")
      .replace(/^(images\/|uploads\/|avatars\/)?/, "");

    return `${API_URL}/images/${cleanPath}`;
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsOpen(false);
    navigate("/", { replace: true });
  };

  const handleNavClick = () => {
    scrollToTop();
  };

  const isMoviesActive = location.pathname.startsWith("/dashboard-films");
  const isAnimeActive = location.pathname.startsWith("/dashboard-anime");
  const isSeriesActive = location.pathname.startsWith("/dashboard-series");
  const isCartoonsActive = location.pathname.startsWith("/dashboard-cartoons");
  // const isFavoritesActive = location.pathname === "/favorites";
  const isDashboardActive = location.pathname === "/dashboard" || location.pathname.startsWith("/dashboard/");

  const navButtonClasses =
    "px-5 py-2.5 text-base font-medium rounded-xl transition-all duration-300 hover:bg-indigo-600/30 hover:shadow-lg hover:shadow-indigo-900/50";

  const activeNavButtonClasses = "bg-indigo-600/40 shadow-md shadow-indigo-900/60 ring-2 ring-indigo-500/60";

  return (
    <div className="flex flex-col bg-gradient-to-b from-gray-950 via-black to-gray-950 text-gray-100 relative min-h-screen">
      <header className="bg-gray-900/70 backdrop-blur-2xl shadow-2xl sticky top-0 z-50 border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <Link
            to="/dashboard"
            onClick={handleNavClick}
            className="text-3xl font-black tracking-normal bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"
          >
            Nexo Cinema
          </Link>

          <nav className="hidden md:flex items-center gap-4">
            <Link
              to="/dashboard"
              onClick={handleNavClick}
              className={`${navButtonClasses} ${isDashboardActive ? activeNavButtonClasses : ""}`}
            >
              {t('nav.dashboard')}
            </Link>
            <Link
              to="/dashboard-films"
              onClick={handleNavClick}
              className={`${navButtonClasses} ${isMoviesActive ? activeNavButtonClasses : ""}`}
            >
              {t('nav.movies')}
            </Link>
            <Link
              to="/dashboard-anime"
              onClick={handleNavClick}
              className={`${navButtonClasses} ${isAnimeActive ? activeNavButtonClasses : ""}`}
            >
              {t('nav.anime')}
            </Link>
            <Link
              to="/dashboard-series"
              onClick={handleNavClick}
              className={`${navButtonClasses} ${isSeriesActive ? activeNavButtonClasses : ""}`}
            >
              {t('nav.series')}
            </Link>
            <Link
              to="/dashboard-cartoons"
              onClick={handleNavClick}
              className={`${navButtonClasses} ${isCartoonsActive ? activeNavButtonClasses : ""}`}
            >
              {t('nav.cartoons')}
            </Link>
            {/* <Link
              to="/favorites"
              onClick={handleNavClick}
              className={`${navButtonClasses} ${isFavoritesActive ? activeNavButtonClasses : ""} flex items-center gap-2 mr-6`}
            >
              <Heart size={20} />
              {t('favorites.title')}
            </Link> */}
          </nav>

          <div className="flex items-center gap-6">
            <LanguageSwitcher />
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 hover:bg-gray-800/60 px-4 py-3 rounded-2xl transition backdrop-blur-sm border border-gray-700/40"
              >
                {user ? (
                  <img
                    src={getAvatarSrc()}
                    alt="Аватар"
                    className="w-10 h-10 rounded-full ring-4 ring-indigo-500/30 shadow-xl object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_AVATAR;
                      (e.target as HTMLImageElement).onerror = null;
                    }}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center font-bold text-lg ring-4 ring-indigo-500/30 shadow-xl">
                    ?
                  </div>
                )}
                <span className="hidden md:block font-medium text-gray-200">
                  {user?.name || "Гість"}
                </span>
              </button>

              {isOpen && (
                <div className="absolute right-0 mt-4 w-80 bg-gray-900/96 backdrop-blur-2xl rounded-2xl shadow-2xl border border-gray-800/60 overflow-hidden">
                  <div className="p-6 bg-gradient-to-r from-indigo-900/70 to-purple-900/70 border-b border-gray-800">
                    <p className="font-bold text-xl text-white">{user?.name || "Гість"}</p>
                    <p className="text-sm text-indigo-200 mt-1">{t('user.premium')}</p>
                  </div>
                  <div className="py-3">
                    <Link
                      to="/profile"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-gray-800/60 text-gray-100 transition"
                    >
                      <User className="w-5 h-5 text-indigo-400" />
                      <span className="font-medium">{t('user.profile')}</span>
                    </Link>
                    <Link
                      to="/favorites"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-gray-800/60 text-gray-100 transition"
                    >
                      <Heart className="w-5 h-5 text-red-400" />
                      <span className="font-medium">{t('favorites.title')}</span>
                    </Link>
                    <Link
                      to="/watch-history"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-gray-800/60 text-gray-100 transition"
                    >
                      <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span className="font-medium">{t('watch_history.title')}</span>
                    </Link>
                    <Link
                      to="/subscriptions"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-gray-800/60 text-gray-100 transition"
                    >
                      <CreditCard className="w-5 h-5 text-indigo-400" />
                      <span className="font-medium">{t('user.subscriptions')}</span>
                    </Link>
                    <div className="h-px bg-gray-800/60 my-2 mx-6" />
                    <button
                      onClick={handleLogout}
                      className="w-full cursor-pointer text-left flex items-center gap-4 px-6 py-4 hover:bg-red-950/50 text-red-400 font-medium transition"
                    >
                      <LogOut className="w-5 h-5" />
                      {t('user.exit_account')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <AnimatedOutlet transition="fadeInUp" />
      </main>

      <footer className="bg-black/60 backdrop-blur-md border-t border-gray-800 py-10 text-center">
        <p className="text-gray-500 text-sm">{t('footer.copyright')}</p>
      </footer>

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-10 right-10 z-50 
                     w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-700 
                     hover:from-indigo-500 hover:to-purple-600 
                     rounded-full shadow-2xl flex items-center justify-center 
                     transition-all duration-400 
                     hover:scale-110 hover:shadow-indigo-500/60 active:scale-95 
                     ring-4 ring-indigo-600/40"
          aria-label="Повернутися наверх"
        >
          <ArrowUp className="w-7 h-7 text-white" />
        </button>
      )}
    </div>
  );
}