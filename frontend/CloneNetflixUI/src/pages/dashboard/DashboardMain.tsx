// src/pages/WelcomeDashboard.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SimpleHeroSlider from "../../lib/Slider";
import { Heart } from "lucide-react";
import toast from "react-hot-toast";

import { useLanguage } from "../../contexts/LanguageContext";
import { useFavorites } from "../../lib/useFavorites";

import {
  fetchDashboardInitialData,
  searchMulti,
} from "../../api/tmdbDashboard";

import { useLoading } from "../../lib/useLoading";   // ← ДОДАНО ІМПОРТ ХУКА

interface Movie {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  overview?: string;
  media_type?: "movie" | "tv";
}

const WelcomeDashboard: React.FC = () => {
  const { t, getTMDBLanguage } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { withLoading } = useLoading();   // ← ДОДАНО ВИКЛИК ХУКА

  const [nowPlaying, setNowPlaying] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [popularTv, setPopularTv] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [searchMode, setSearchMode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const language = getTMDBLanguage();

  // Завантаження початкових даних
  useEffect(() => {
    withLoading(async () => {
      setLoading(true);
      try {
        const { nowPlaying, popularMovies, popularTv } =
          await fetchDashboardInitialData(language);

        setNowPlaying(nowPlaying);
        setPopularMovies(popularMovies);
        setPopularTv(popularTv);
      } catch (err) {
        console.error(err);
        setError(t("dashboard.loading_error") || "Помилка завантаження контенту");
      } finally {
        setLoading(false);
      }
    });
  }, [language]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const searchContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    await withLoading(async () => {
      setLoading(true);
      setSearchMode(true);
      setError(null);

      try {
        const results = await searchMulti(searchTerm.trim(), language);
        setSearchResults(results.slice(0, 30));
      } catch (err) {
        console.error(err);
        setError(t("dashboard.search_error") || "Помилка пошуку");
      } finally {
        setLoading(false);
      }
    });
  };

  const resetSearch = () => {
    setSearchMode(false);
    setSearchTerm("");
    setSearchResults([]);
    setError(null);
    window.scrollTo(0, 0);
  };

  const renderGrid = (items: Movie[], mediaType: "movie" | "tv") => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
      {items.map((item) => {
        const type = (item.media_type as "movie" | "tv") || mediaType;

        return (
          <div key={item.id} className="group relative">
            <Link
              to={`/details/${type}/${item.id}`}
              className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 block h-full flex flex-col"
            >
              {item.poster_path ? (
                <img
                  src={`${import.meta.env.VITE_TMDB_IMG_BASE}${item.poster_path}`}
                  alt={item.title || item.name}
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

              <div className="p-5 min-h-[120px] flex flex-col justify-between">
                <h3 className="text-lg font-semibold break-words">
                  {item.title || item.name || t("common.unknown")}
                </h3>
                <div>
                  <p className="text-gray-400 text-sm">
                    {(item.release_date || item.first_air_date || "").slice(0, 4) ||
                      t("common.unknown")}{" "}
                    {t("common.year")}
                  </p>
                  {item.vote_average > 0 && (
                    <p className="text-yellow-400 mt-1 font-bold">
                      ⭐ {item.vote_average.toFixed(1)}
                    </p>
                  )}
                </div>
              </div>
            </Link>

            <button
              onClick={(e) => {
                e.preventDefault();

                const isFav = isFavorite(item.id, type);

                toggleFavorite({
                  id: item.id,
                  mediaType: type,
                  title: item.title || item.name || "",
                  posterPath: item.poster_path,
                  voteAverage: item.vote_average,
                  releaseDate: item.release_date || item.first_air_date,
                });

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
                className={isFavorite(item.id, type) ? "fill-red-500 text-red-500" : "text-white"}
              />
            </button>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Слайдер */}
        {!loading && !searchMode && nowPlaying.length > 0 && (
          <SimpleHeroSlider movies={nowPlaying} />
        )}

        {/* Пошук */}
        <form onSubmit={searchContent} className="max-w-4xl mx-auto mb-20 -mt-8 relative z-10">
          <div className="flex flex-col sm:flex-row gap-4 shadow-2xl">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t("dashboard.search")}
              className="flex-1 px-8 py-6 rounded-xl bg-gray-800 border border-gray-700 focus:outline-none focus:border-blue-500 text-xl placeholder-gray-500 transition"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-16 py-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 rounded-xl font-bold text-xl transition shadow-lg"
            >
              {t("dashboard.find")}
            </button>
          </div>
        </form>

        {searchMode && (
          <div className="text-center mb-8">
            <button
              onClick={resetSearch}
              className="px-8 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-semibold text-lg transition shadow"
            >
              {t("dashboard.back")}
            </button>
          </div>
        )}

        {error && !loading && (
          <div className="text-center text-red-400 text-xl bg-red-900/20 py-6 rounded-lg mb-12">
            {error}
          </div>
        )}

        {/* ← ВИДАЛЕНО локальний {loading ? <GradientLoader /> : ...} */}
        {/* Тепер лоадер працює тільки глобально через withLoading */}

        {searchMode && searchResults.length > 0 ? (
          <div className="mb-20">
            <h2 className="text-4xl font-bold text-center mb-12">
              {t("dashboard.search_results")} "{searchTerm}"
            </h2>
            {renderGrid(searchResults, searchResults[0]?.media_type === "tv" ? "tv" : "movie")}
          </div>
        ) : !searchMode ? (
          <>
            <section className="mt-12 mb-24">
              <h2 className="text-4xl font-bold text-center mb-12">{t("dashboard.top_movies")}</h2>
              {renderGrid(popularMovies, "movie")}
            </section>

            <section className="mb-20">
              <h2 className="text-4xl font-bold text-center mb-12">{t("dashboard.top_series")}</h2>
              {renderGrid(popularTv, "tv")}
            </section>
          </>
        ) : (
          <div className="text-center py-20 text-gray-400 text-xl">
            {t("dashboard.no_results") || "Нічого не знайдено..."}
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomeDashboard;