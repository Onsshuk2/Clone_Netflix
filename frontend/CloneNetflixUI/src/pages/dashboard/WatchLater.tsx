import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { ArrowLeft, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import { fetchContentDetails } from "../../api/tmdbDashboard";
import { useLoading } from "../../lib/useLoading";

const TMDB_IMG_BASE = import.meta.env.VITE_TMDB_IMG_BASE;

interface StoredItem {
  id: number | string;
  type: string;
  watchedAt: number;
  poster_path?: string | null;
}

interface ItemDetail {
  id: number | string;
  title: string;
  poster: string | null;
  type: string;

  watchedAt: number;
  rating?: number;
}

const LOCAL_STORAGE_KEY = "watchLaterList";

const WatchLater: React.FC = () => {
  const { language, getTMDBLanguage, t } = useLanguage();
  const { withLoading } = useLoading();

  const [storedItems, setStoredItems] = useState<StoredItem[]>([]);

  // Мемоізуємо displayItems — не потрібно кожного разу перезавантажувати
  const [displayItems, setDisplayItems] = useState<ItemDetail[]>([]);

  const tmdbLanguage = getTMDBLanguage();

  // 1. Завантажуємо з localStorage ТІЛЬКИ при монтуванні
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as StoredItem[];
        setStoredItems(parsed);
      } catch (err) {
        console.error("Failed to parse watch later:", err);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
  }, []); // ← ПУСТО — тільки при першому рендері

  // 2. Окремий ефект для завантаження деталей — залежності тільки ті, що дійсно змінюються
  useEffect(() => {
    if (storedItems.length === 0) {
      setDisplayItems([]);
      return;
    }

    let isCurrent = true;

    withLoading(async () => {
      try {
        const results = await Promise.all(
          storedItems.map(async (item) => {
            const contentType = item.type === "tv" || item.type === "series" ? "tv" : "movie";

            try {
              const data = await fetchContentDetails(
                contentType as "movie" | "tv",
                String(item.id),
                tmdbLanguage
              );

              return {
                id: item.id,
                title: data.title || data.name || t("common.unknown"),
                poster: data.poster_path || item.poster_path || null,
                type: item.type,
                watchedAt: Date.now(),
                rating: data.vote_average,
              };
            } catch (err) {
              return {
                id: item.id,
                title: t("common.unknown"),
                poster: item.poster_path || null,
                type: item.type,
                watchedAt: Date.now(),
                rating: undefined,
              };
            }
          })
        );

        if (isCurrent) {
          setDisplayItems(results);
        }
      } catch (err) {
        console.error("Error loading details:", err);
        toast.error(t("common.error") || "Помилка завантаження");
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [storedItems, tmdbLanguage]); // ← ТІЛЬКИ ці дві — t та withLoading прибрано

  const removeItem = (id: number | string) => {
    const updated = storedItems.filter((item) => item.id !== id);
    setStoredItems(updated);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    toast.success(t("watch_later.removed") || "Видалено");
  };

  const clearAll = () => {
    if (window.confirm(t("watch_later.confirm_clear") || "Очистити список?")) {
      setStoredItems([]);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      toast.success(t("watch_later.cleared") || "Очищено");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-6 py-3 bg-gray-800/50 hover:bg-gray-700 rounded-xl transition"
          >
            <ArrowLeft size={20} />
            {t("dashboard.back")}
          </Link>

          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            {language === "uk" ? "Список на потім" : "Watch Later"}
          </h1>
        </div>

        {storedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[600px]">
            <Trash2 size={80} className="text-gray-600 mb-6" />
            <p className="text-2xl text-gray-400 text-center mb-8">
              {language === "uk" ? "Список на потім порожній" : "Watch Later list is empty"}
            </p>
            <Link
              to="/dashboard"
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl font-bold text-lg transition"
            >
              {t("dashboard.back")}
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
              <div className="text-gray-400 text-lg">
                {language === "uk" ? "У списку:" : "In list:"}{" "}
                <span className="text-indigo-400 font-bold">{storedItems.length}</span>
              </div>

              <button
                onClick={clearAll}
                className="flex items-center gap-2 px-6 py-3 bg-red-900/40 hover:bg-red-900/60 text-red-300 hover:text-red-200 rounded-xl transition border border-red-800/50"
              >
                <Trash2 size={18} />
                {language === "uk" ? "Очистити список" : "Clear list"}
              </button>
            </div>

            {displayItems.length === 0 ? (
              <div className="flex justify-center items-center min-h-[400px]">
                <p className="text-xl text-gray-400 animate-pulse">
                  {t("common.loading")}...
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
                {displayItems.map((d) => (
                  <div key={`${d.type}-${d.id}`} className="group relative">
                    <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:scale-[1.03] transition-all duration-300">
                      {d.poster ? (
                        <img
                          src={`${TMDB_IMG_BASE}${d.poster}`}
                          alt={d.title}
                          className="w-full h-80 object-cover flex-shrink-0"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-80 bg-gray-700 flex items-center justify-center flex-shrink-0">
                          <span className="text-gray-500 text-center px-6">
                            {t('common.poster_missing')}
                          </span>
                        </div>
                      )}

                      <div className="p-5 flex flex-col min-h-[140px]">
                        <h3 className="text-lg font-semibold break-words line-clamp-2 mb-3">
                          {d.title}
                        </h3>

                        <div className="mt-auto space-y-1">
                          <p className="text-gray-400 text-sm">
                            {new Date(d.watchedAt).toLocaleDateString(language, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                          <div className="flex justify-between items-center text-xs">
                            <p className="text-gray-500">
                              {d.type === 'movie' ? (language === 'uk' ? 'Фільм' : 'Movie') : (language === 'uk' ? 'Серіал' : 'Series')}
                            </p>
                            {d.rating !== undefined && d.rating > 0 && (
                              <p className="text-amber-400 font-bold flex items-center gap-1">
                                ★ {d.rating.toFixed(1)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        removeItem(d.id);
                      }}
                      className="
                                    absolute top-3 right-3
                                    p-2.5 bg-black/60 rounded-full
                                    hover:bg-black/80
                                    transition-all duration-300
                                    z-10
                                    opacity-0 group-hover:opacity-100
                                    hover:scale-110
                                    active:scale-90
                                  "
                      title={t('watch_history.remove')}
                    >
                      <Trash2 size={22} className="text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WatchLater;