// src/pages/DashboardMovies.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { useFavorites } from "../../lib/useFavorites";
import { Heart } from "lucide-react";
import toast from "react-hot-toast";

import { fetchTopRatedMovies, searchMoviesOnly } from "../../api/tmdbDashboard";
import { useLoading } from "../../lib/useLoading";   // ← ДОДАНО ІМПОРТ ХУКА

const DashboardMovies: React.FC = () => {
  const { t, getTMDBLanguage } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { withLoading } = useLoading();   // ← ДОДАНО ВИКЛИК ХУКА

  const [displayMovies, setDisplayMovies] = useState<any[]>([]);
  const [allMovies, setAllMovies] = useState<any[]>([]);
  const [visibleCount, setVisibleCount] = useState(20);
  const [loading, setLoading] = useState(true);
  const [searchMode, setSearchMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [displaySearchTerm, setDisplaySearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [top100Movies, setTop100Movies] = useState<any[]>([]);

  const language = getTMDBLanguage();

  useEffect(() => {
    withLoading(async () => {
      setLoading(true);
      setError(null);
      setSearchMode(false);
      setSearchTerm("");
      setDisplaySearchTerm("");

      try {
        const results = await fetchTopRatedMovies(language, 5);

        setTop100Movies(results);
        setAllMovies(results);
        setVisibleCount(20);
        setDisplayMovies(results.slice(0, 20));
      } catch (err) {
        console.error("Помилка завантаження топ-100:", err);
        setError(t("movies.loading_error") || "Не вдалося завантажити фільми");
        setAllMovies([]);
        setDisplayMovies([]);
      } finally {
        setLoading(false);
      }
    });
  }, [language, t]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const searchMovies = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    const term = searchTerm.trim();
    if (term.length < 2) {
      setError(t("movies.search_min_chars") || "Мінімум 2 символи");
      return;
    }

    await withLoading(async () => {
      setLoading(true);
      setError(null);
      setSearchMode(true);
      setVisibleCount(20);
      setDisplaySearchTerm(term);

      try {
        const results = await searchMoviesOnly(term, language, 1);
        const limited = results.slice(0, 100);

        setAllMovies(limited);
        setDisplayMovies(limited.slice(0, 20));
      } catch (err) {
        console.error("Помилка пошуку:", err);
        setError(t("movies.connection_error") || "Помилка з'єднання");
        setAllMovies([]);
        setDisplayMovies([]);
      } finally {
        setLoading(false);
      }
    });
  };

  const resetToTop100 = () => {
    setSearchMode(false);
    setSearchTerm("");
    setDisplaySearchTerm("");
    setError(null);
    setAllMovies(top100Movies);
    setVisibleCount(20);
    setDisplayMovies(top100Movies.slice(0, 20));
    window.scrollTo(0, 0);
  };

  const loadMore = () => {
    if (loading) return;
    const nextCount = Math.min(visibleCount + 20, allMovies.length);
    setVisibleCount(nextCount);
    setDisplayMovies(allMovies.slice(0, nextCount));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <h1 className="text-5xl md:text-6xl font-bold text-center mb-6">
          {t("movies.welcome")}
        </h1>

        <p className="text-xl md:text-2xl text-center text-gray-400 mb-12">
          {searchMode
            ? `${t("dashboard.search_results")} "${displaySearchTerm}"`
            : t("movies.top_100")}
        </p>

        {searchMode && (
          <div className="text-center mb-8">
            <button
              onClick={resetToTop100}
              className="px-8 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-semibold text-lg transition shadow"
            >
              {t("dashboard.back")}
            </button>
          </div>
        )}

        <form onSubmit={searchMovies} className="max-w-3xl mx-auto mb-16">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t("movies.search_placeholder")}
              className="flex-1 px-6 py-5 rounded-xl bg-gray-800 border border-gray-700 focus:outline-none focus:border-blue-500 text-lg placeholder-gray-500 transition"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-12 py-5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 rounded-xl font-bold text-lg transition shadow-lg"
            >
              {loading && searchMode
                ? t("common.searching")
                : t("common.find_button")}
            </button>
          </div>
        </form>

        {error && !loading && (
          <div className="text-center text-red-400 text-xl bg-red-900/20 py-6 rounded-lg mb-12">
            {error}
          </div>
        )}

        {/* ← ВИДАЛЕНО локальний {loading ? <GradientLoader /> : ...} */}
        {/* Тепер лоадер працює тільки глобально через withLoading */}

        {displayMovies.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-xl">
            {t("movies.no_results") || "Нічого не знайдено..."}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
              {displayMovies.map((movie) => {
                const title = movie.title || movie.original_title || "Без назви";
                const year = movie.release_date?.slice(0, 4) || t("common.unknown");

                return (
                  <div key={movie.id} className="group relative h-full">
                    <Link
                      to={`/details/movie/${movie.id}`}
                      className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 block h-full flex flex-col"
                    >
                      {movie.poster_path ? (
                        <img
                          src={`${import.meta.env.VITE_TMDB_IMG_BASE}${movie.poster_path}`}
                          alt={title}
                          className="w-full h-80 object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-80 bg-gray-700 flex items-center justify-center">
                          <span className="text-gray-500 text-center px-4">
                            {t("common.poster_missing")}
                          </span>
                        </div>
                      )}

                      <div className="p-5 min-h-[120px] flex flex-col justify-between flex-grow">
                        <h3 className="text-lg font-semibold break-words line-clamp-2">
                          {title}
                        </h3>
                        <div>
                          <p className="text-gray-400 text-sm">
                            {year} {t("common.year")}
                          </p>
                          {movie.vote_average > 0 && (
                            <p className="text-yellow-400 mt-1 font-bold">
                              ⭐ {movie.vote_average.toFixed(1)}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>

                    <button
                      onClick={(e) => {
                        e.preventDefault();

                        toggleFavorite({
                          id: movie.id,
                          mediaType: "movie",
                          title,
                          posterPath: movie.poster_path,
                          voteAverage: movie.vote_average,
                          releaseDate: movie.release_date,
                        });

                        const isFav = isFavorite(movie.id, "movie");
                        toast.success(isFav ? t("favorites.removed") : t("favorites.added"));
                      }}
                      className="
                        absolute top-3 right-3
                        p-2 bg-black/60 rounded-full
                        hover:bg-black/80
                        transition-all duration-300
                        z-10
                        opacity-0 group-hover:opacity-100
                        hover:scale-110
                        active:scale-90
                      "
                    >
                      <Heart
                        size={24}
                        className={isFavorite(movie.id, "movie") ? "fill-red-500 text-red-500" : "text-white"}
                      />
                    </button>
                  </div>
                );
              })}
            </div>

            {visibleCount < allMovies.length && (
              <div className="text-center mt-12">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-10 py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 rounded-xl font-bold text-xl transition shadow-lg"
                >
                  {t("common.load_more")}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardMovies;