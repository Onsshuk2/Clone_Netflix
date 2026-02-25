// src/pages/DashboardMovies.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { useFavorites } from "../../lib/useFavorites";
import { Heart } from "lucide-react";
import { Clock } from "lucide-react";
import toast from "react-hot-toast";

import { fetchTopRatedMovies, searchMoviesOnly } from "../../api/tmdbDashboard";
import { useLoading } from "../../lib/useLoading";

const DashboardMovies: React.FC = () => {
  const { t, getTMDBLanguage } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { withLoading } = useLoading();

  const [displayMovies, setDisplayMovies] = useState<any[]>([]);
  const [allMovies, setAllMovies] = useState<any[]>([]);
  const [visibleCount, setVisibleCount] = useState(20);
  const [searchMode, setSearchMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [displaySearchTerm, setDisplaySearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [top100Movies, setTop100Movies] = useState<any[]>([]);

  const language = getTMDBLanguage();

  // Завантаження топ-100
  useEffect(() => {
    withLoading(async () => {
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
        console.error("Помилка завантаження:", err);
        setError(t("movies.loading_error"));
        setAllMovies([]);
        setDisplayMovies([]);
      }
    });
  }, [language]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Пошук
  const searchMovies = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    const term = searchTerm.trim();
    if (term.length < 2) {
      setError(t("movies.search_min_chars"));
      return;
    }

    await withLoading(async () => {
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
        setError(t("movies.connection_error"));
        setAllMovies([]);
        setDisplayMovies([]);
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
    const nextCount = Math.min(visibleCount + 20, allMovies.length);
    setVisibleCount(nextCount);
    setDisplayMovies(allMovies.slice(0, nextCount));
  };

  const [watchLaterList, setWatchLaterList] = useState<any[]>(() => {
    return JSON.parse(localStorage.getItem("watchLaterList") || "[]");
  });

  useEffect(() => {
    const handleStorage = () => {
      setWatchLaterList(JSON.parse(localStorage.getItem("watchLaterList") || "[]"));
    };
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  useEffect(() => {
    setWatchLaterList(JSON.parse(localStorage.getItem("watchLaterList") || "[]"));
  }, [language]);

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

        {/* SEARCH */}
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
              className="px-12 py-5 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-lg transition shadow-lg"
            >
              {t("common.find_button")}
            </button>
          </div>
        </form>

        {error && (
          <div className="text-center text-red-400 text-xl bg-red-900/20 py-6 rounded-lg mb-12">
            {error}
          </div>
        )}

        {displayMovies.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-xl">
            {t("movies.no_results")}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
              {displayMovies.map((movie) => {
                const title = movie.title || movie.original_title || "Без назви";
                const year = movie.release_date?.slice(0, 4) || t("common.unknown");
                const favorite = isFavorite(movie.id, "movie");
                const isWatchLater = watchLaterList.some((m: any) => m.id === movie.id);
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
                          {t("common.poster_missing")}
                        </div>
                      )}

                      <div className="p-5 flex flex-col justify-between flex-grow">
                        <h3 className="text-lg font-semibold line-clamp-2">
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

                    {/* Кнопка "на потім" (лівий верх) */}
                    <button
                      onClick={() => {
                        let updated;
                        if (isWatchLater) {
                          updated = watchLaterList.filter((m: any) => m.id !== movie.id);
                        } else {
                          updated = [...watchLaterList, {
                            id: movie.id,
                            title: movie.title || movie.original_title || "",
                            posterUrl: movie.poster_path ? `${import.meta.env.VITE_TMDB_IMG_BASE}${movie.poster_path}` : undefined,
                          }];
                        }
                        setWatchLaterList(updated);
                        localStorage.setItem("watchLaterList", JSON.stringify(updated));
                        if (!isWatchLater) {
                          toast.success(t('watchLater.added'));
                        } else {
                          toast.success(t('watchLater.remove') || 'Видалено зі списку на потім');
                        }
                      }}
                      className={`absolute top-3 left-3 p-2 rounded-full z-10 bg-blue-600 text-white shadow transition-all duration-300 hover:scale-110 ${isWatchLater ? "bg-pink-600" : "bg-blue-600"}`}
                      title={isWatchLater ? t("watchLater.remove") || "Видалити зі списку на потім" : t("watchLater.add") || "Додати у список на потім"}
                    >
                      <Clock size={22} className={isWatchLater ? "text-pink-200 opacity-80" : "text-white opacity-60 group-hover:opacity-90 transition-all duration-300"} />
                    </button>

                    {/* Кнопка улюблене (правий верх) */}
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

                        toast.success(
                          favorite
                            ? t("favorites.removed")
                            : t("favorites.added")
                        );
                      }}
                      className="absolute top-3 right-3 p-2 bg-black/60 rounded-full hover:bg-black/80 transition z-10 opacity-0 group-hover:opacity-100"
                    >
                      <Heart
                        size={24}
                        className={
                          favorite
                            ? "fill-red-500 text-red-500"
                            : "text-white"
                        }
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
                  className="px-12 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-lg transition shadow-lg"
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