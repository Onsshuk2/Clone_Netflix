// src/pages/DashboardCartoons.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { useFavorites } from "../../lib/useFavorites";
import { Heart } from "lucide-react";
import toast from "react-hot-toast";

const TMDB_API_URL = import.meta.env.VITE_TMDB_API_URL;
const TMDB_IMG_BASE = import.meta.env.VITE_TMDB_IMG_BASE;
const TMDB_TOKEN = import.meta.env.VITE_TMDB_TOKEN;

const DashboardCartoons: React.FC = () => {
  const { t } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [displayItems, setDisplayItems] = useState<any[]>([]);
  const [allItems, setAllItems] = useState<any[]>([]);
  const [visibleCount, setVisibleCount] = useState(20);
  const [loading, setLoading] = useState(true);
  const [searchMode, setSearchMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [displaySearchTerm, setDisplaySearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [topCartoons, setTopCartoons] = useState<any[]>([]);

  const authHeaders = {
    Authorization: `Bearer ${TMDB_TOKEN}`,
    "Content-Type": "application/json;charset=utf-8",
  };

  // Завантаження топ мультфільмів при першому вході
  useEffect(() => {
    const loadTopCartoons = async () => {
      setLoading(true);
      setError(null);
      setSearchMode(false);

      try {
        const pagesToLoad = 5;
        const results: any[] = [];

        for (let page = 1; page <= pagesToLoad; page++) {
          const response = await fetch(
            `${TMDB_API_URL}/discover/movie?language=uk-UA&sort_by=vote_average.desc&vote_count.gte=300&with_genres=16&without_keywords=210024&page=${page}`,
            { headers: authHeaders }
          );

          if (!response.ok) throw new Error("TMDB error " + response.status);

          const data = await response.json();

          const filtered = (data.results || []).filter(
            (item: any) => item.original_language !== "ja"
          );

          results.push(...filtered);
        }

        const sorted = results
          .sort((a: any, b: any) => b.vote_average - a.vote_average)
          .slice(0, 100);

        setTopCartoons(sorted);
        setAllItems(sorted);
        setVisibleCount(20);
        setDisplayItems(sorted.slice(0, 20));
      } catch (err) {
        setError(t('cartoons.loading_error'));
        setAllItems([]);
        setDisplayItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadTopCartoons();
  }, []);

  // === ПРОСТА ЛОГІКА: ЗАВЖДИ ПРОКРУЧУВАТИ ВГОРУ ПРИ МОНТУВАННІ СТОРІНКИ ===
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []); // Виконується один раз при першому рендері

  // Пошук мультфільмів
  const searchCartoons = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    const term = searchTerm.trim();
    if (term.length < 2) {
      setError(t('common.search_min_chars'));
      return;
    }

    setLoading(true);
    setError(null);
    setSearchMode(true);
    setVisibleCount(20);
    setDisplaySearchTerm(term);

    try {
      const response = await fetch(
        `${TMDB_API_URL}/search/movie?language=uk-UA&query=${encodeURIComponent(
          term
        )}&include_adult=false`,
        { headers: authHeaders }
      );

      if (!response.ok) throw new Error("TMDB search error");

      const data = await response.json();

      const cartoonResults = (data.results || [])
        .filter((item: any) => {
          const isAnimation = item.genre_ids?.includes(16);
          const isNotAnime = item.original_language !== "ja";
          return isAnimation && isNotAnime;
        })
        .slice(0, 100);

      if (cartoonResults.length > 0) {
        setAllItems(cartoonResults);
        setDisplayItems(cartoonResults.slice(0, 20));
      } else {
        setError(
          "Мультфільм не знайдено. Спробуйте: Король Лев, Холодне серце, Шрек, Вгору, Історія іграшок, Міньйони..."
        );
        setAllItems([]);
        setDisplayItems([]);
      }
    } catch (err) {
      setError("Помилка пошуку. Перевірте інтернет або токен.");
      setAllItems([]);
      setDisplayItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Повернення до топ
  const resetToTop = () => {
    setSearchMode(false);
    setSearchTerm("");
    setDisplaySearchTerm("");
    setError(null);
    setAllItems(topCartoons);
    setVisibleCount(20);
    setDisplayItems(topCartoons.slice(0, 20));
    window.scrollTo(0, 0); // При поверненні до топу — теж вгору
  };

  // Показати ще
  const loadMore = () => {
    if (loading) return;
    const nextCount = Math.min(visibleCount + 20, allItems.length);
    setVisibleCount(nextCount);
    setDisplayItems(allItems.slice(0, nextCount));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <h1 className="text-5xl md:text-6xl font-bold text-center mb-6">
          {t('cartoons.welcome')}
        </h1>
        <p className="text-xl md:text-2xl text-center text-gray-400 mb-12">
          {searchMode ? `${t('dashboard.search_results')} "${displaySearchTerm}"` : t('cartoons.top_100')}
        </p>

        {searchMode && (
          <div className="text-center mb-8">
            <button
              onClick={resetToTop}
              className="px-8 py-3 bg-teal-700 hover:bg-teal-600 rounded-xl font-semibold text-lg transition shadow"
            >
              {t('dashboard.back')}
            </button>
          </div>
        )}

        <form onSubmit={searchCartoons} className="max-w-3xl mx-auto mb-16">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('cartoons.search_placeholder')}
              className="flex-1 px-6 py-5 rounded-xl bg-gray-800 border border-gray-700 focus:outline-none focus:border-teal-500 text-lg placeholder-gray-500 transition"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-12 py-5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-800 rounded-xl font-bold text-lg transition shadow-lg"
            >
              {loading && searchMode ? t('common.searching') : t('common.find_button')}
            </button>
          </div>
        </form>

        {error && !loading && (
          <div className="text-center text-red-400 text-xl bg-red-900/20 py-6 rounded-lg mb-12">
            {error}
          </div>
        )}

        {loading && displayItems.length === 0 && (
          <div className="text-center text-2xl py-20">
            {searchMode ? t('cartoons.searching') : t('cartoons.loading')}
          </div>
        )}

        {!loading && displayItems.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
              {displayItems.map((item) => (
                <div key={item.id} className="group relative">
                  <Link
                    to={`/details/movie/${item.id}`}
                    className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 block"
                  >
                    {item.poster_path ? (
                      <img
                        src={`${TMDB_IMG_BASE}${item.poster_path}`}
                        alt={item.title}
                        className="w-full h-80 object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-80 bg-gray-700 flex items-center justify-center">
                        <span className="text-gray-500 text-center px-4">
                          {t('common.no_image')}
                        </span>
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs bg-teal-600 px-2 py-1 rounded">
                          Мультфільм
                        </span>
                      </div>
                      <h3
                        className="text-lg font-semibold line-clamp-2"
                        title={item.title}
                      >
                        {item.title}
                      </h3>
                      <p className="text-gray-400 mt-2 text-sm">
                        {item.release_date?.slice(0, 4) || "Невідомо"} рік
                      </p>
                      {item.vote_average > 0 && (
                        <p className="text-teal-400 mt-2 font-bold">
                          ⭐ {item.vote_average.toFixed(1)}
                        </p>
                      )}
                    </div>
                  </Link>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      toggleFavorite({
                        id: item.id,
                        mediaType: 'movie',
                        title: item.title,
                        posterPath: item.poster_path,
                        voteAverage: item.vote_average,
                        releaseDate: item.release_date,
                      });
                      const isFav = isFavorite(item.id, 'movie');
                      if (isFav) {
                        toast.success(t('favorites.removed'));
                      } else {
                        toast.success(t('favorites.added'));
                      }
                    }}
                    className="absolute top-3 right-3 p-2 bg-black/60 rounded-full hover:bg-black/80 transition-colors z-10 opacity-0 group-hover:opacity-100"
                  >
                    <Heart
                      size={24}
                      className={isFavorite(item.id, 'movie') ? 'fill-red-500 text-red-500' : 'text-white'}
                    />
                  </button>
                </div>
              ))}
            </div>

            {visibleCount < allItems.length && (
              <div className="text-center mt-12">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-10 py-4 bg-teal-600 hover:bg-teal-700 disabled:opacity-70 rounded-xl font-bold text-xl transition shadow-lg"
                >
                  {t('common.load_more')}
                </button>
              </div>
            )}
          </>
        )}

        {!loading && displayItems.length === 0 && !error && (
          <div className="text-center mt-32 text-3xl text-gray-500">
            Введіть назву мультфільму для пошуку
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardCartoons;