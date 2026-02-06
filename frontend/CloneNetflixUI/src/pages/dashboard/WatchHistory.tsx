// src/pages/dashboard/WatchHistory.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { useWatchHistory } from "../../lib/useWatchHistory";
import { ArrowLeft, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import { fetchContentDetails } from "../../api/tmdbDashboard";

import { useLoading } from "../../lib/useLoading";   // ← ДОДАНО ІМПОРТ ХУКА

const TMDB_IMG_BASE = import.meta.env.VITE_TMDB_IMG_BASE;

interface ItemDetail {
  id: number | string;
  title: string;
  poster: string | null;
  type: string;
  watchedAt: number;
}

const WatchHistory: React.FC = () => {
  const { language, getTMDBLanguage, t } = useLanguage();
  const { items, clearHistory, removeItem } = useWatchHistory();
  const { withLoading } = useLoading();   // ← ДОДАНО ВИКЛИК ХУКА

  const [details, setDetails] = useState<ItemDetail[]>([]);
  const [loading, setLoading] = useState(false);

  const tmdbLang = getTMDBLanguage();

  useEffect(() => {
    withLoading(async () => {   // ← ОБГОРНУТО В withLoading
      if (items.length === 0) {
        setDetails([]);
        return;
      }

      setLoading(true);
      try {
        const results = await Promise.all(
          items.map(async (it) => {
            try {
              const mapType = (t: string) => (t === 'tv' || t === 'series' ? 'tv' : 'movie');
              const d = await fetchContentDetails(mapType(it.type) as 'movie' | 'tv', String(it.id), tmdbLang);

              const title = d.title || d.name || t('common.unknown');
              return {
                id: it.id,
                title,
                poster: d.poster_path || it.poster_path || null,
                type: it.type,
                watchedAt: it.watchedAt,
              } as ItemDetail;
            } catch (e) {
              return {
                id: it.id,
                title: t('common.unknown'),
                poster: it.poster_path || null,
                type: it.type,
                watchedAt: it.watchedAt,
              } as ItemDetail;
            }
          })
        );

        setDetails(results);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    });
  }, [items, tmdbLang, t]);

  const handleRemove = (id: number | string, type: string) => {
    removeItem(id, type);
    toast.success(t('watch_history.removed'));
  };

  const handleClearAll = () => {
    if (window.confirm(t('watch_history.confirm_clear'))) {
      clearHistory();
      toast.success(t('watch_history.cleared'));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-6 py-3 bg-gray-800/50 hover:bg-gray-700 rounded-xl transition"
          >
            <ArrowLeft size={20} />
            {t('dashboard.back')}
          </Link>

          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            {t('watch_history.title')}
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[600px]">
            <Trash2 size={80} className="text-gray-600 mb-6" />
            <p className="text-2xl text-gray-400 text-center mb-8">
              {t('watch_history.empty')}
            </p>
            <Link
              to="/dashboard"
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl font-bold text-lg transition"
            >
              {t('dashboard.back')}
            </Link>
          </div>
        ) : (
          <>
            {/* Stats & Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
              <div className="text-gray-400 text-lg">
                {t('watch_history.title')}: <span className="text-indigo-400 font-bold">{items.length}</span>
              </div>

              <button
                onClick={handleClearAll}
                className="flex items-center gap-2 px-6 py-3 bg-red-900/40 hover:bg-red-900/60 text-red-300 hover:text-red-200 rounded-xl transition border border-red-800/50"
              >
                <Trash2 size={18} />
                {t('watch_history.clear')}
              </button>
            </div>

            {/* Loading */}
            {loading ? (
              <div className="flex justify-center items-center min-h-[400px]">
                <p className="text-xl text-gray-400 animate-pulse">{t('common.loading')}...</p>
              </div>
            ) : (
              /* Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
                {details.map((d) => (
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
                          <p className="text-gray-500 text-xs">
                            {d.type === 'movie' ? 'Фільм' : 'Серіал'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemove(d.id, d.type);
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

export default WatchHistory;