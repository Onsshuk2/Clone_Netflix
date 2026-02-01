// src/pages/DashboardCartoons.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { useFavorites } from "../../lib/useFavorites";
import { Heart } from "lucide-react";
import toast from "react-hot-toast";

import { fetchTopCartoons, searchCartoonsOnly } from "../../api/tmdbDashboard";

const DashboardCartoons: React.FC = () => {
  const { t, getTMDBLanguage } = useLanguage();
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

  // 🔹 ДОДАНО ТІЛЬКИ ДЛЯ АНІМАЦІЇ
  const [animatingId, setAnimatingId] = useState<number | null>(null);

  const language = getTMDBLanguage();

  useEffect(() => {
    const loadTopCartoons = async () => {
      setLoading(true);
      setError(null);
      setSearchMode(false);
      setSearchTerm("");
      setDisplaySearchTerm("");

      try {
        const sorted = await fetchTopCartoons(language, 5);

        setTopCartoons(sorted);
        setAllItems(sorted);
        setVisibleCount(20);
        setDisplayItems(sorted.slice(0, 20));
      } catch (err) {
        console.error("Помилка завантаження топ-мультфільмів:", err);
        setError(t("cartoons.loading_error"));
        setAllItems([]);
        setDisplayItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadTopCartoons();
  }, [language, t]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const searchCartoons = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    const term = searchTerm.trim();
    if (term.length < 2) {
      setError(t("common.search_min_chars"));
      return;
    }

    setLoading(true);
    setError(null);
    setSearchMode(true);
    setVisibleCount(20);
    setDisplaySearchTerm(term);

    try {
      const cartoonResults = await searchCartoonsOnly(term, language, 1);

      if (cartoonResults.length > 0) {
        setAllItems(cartoonResults);
        setDisplayItems(cartoonResults.slice(0, 20));
      } else {
        setError(
          t("cartoons.not_found") ||
            "Мультфільм не знайдено. Спробуйте: Король Лев, Шрек, Міньйони..."
        );
        setAllItems([]);
        setDisplayItems([]);
      }
    } catch (err) {
      console.error("Помилка пошуку мультфільмів:", err);
      setError(t("cartoons.connection_error") || "Помилка з'єднання");
      setAllItems([]);
      setDisplayItems([]);
    } finally {
      setLoading(false);
    }
  };

  const resetToTop = () => {
    setSearchMode(false);
    setSearchTerm("");
    setDisplaySearchTerm("");
    setError(null);
    setAllItems(topCartoons);
    setVisibleCount(20);
    setDisplayItems(topCartoons.slice(0, 20));
    window.scrollTo(0, 0);
  };

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
          {t("cartoons.welcome")}
        </h1>
        <p className="text-xl md:text-2xl text-center text-gray-400 mb-12">
          {searchMode
            ? `${t("dashboard.search_results")} "${displaySearchTerm}"`
            : t("cartoons.top_100")}
        </p>

        {searchMode && (
          <div className="text-center mb-8">
            <button
              onClick={resetToTop}
              className="px-8 py-3 bg-teal-700 hover:bg-teal-600 rounded-xl font-semibold text-lg transition shadow"
            >
              {t("dashboard.back")}
            </button>
          </div>
        )}

        <form onSubmit={searchCartoons} className="max-w-3xl mx-auto mb-16">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t("cartoons.search_placeholder")}
              className="flex-1 px-6 py-5 rounded-xl bg-gray-800 border border-gray-700 focus:outline-none focus:border-teal-500 text-lg placeholder-gray-500 transition"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-12 py-5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-800 rounded-xl font-bold text-lg transition shadow-lg"
            >
              {loading && searchMode
                ? t("common.searching")
                : t("common.find_button")}
            </button>
          </div>
        </form>

        {error && (
          <div className="max-w-2xl mx-auto mb-8 text-center text-red-400 bg-red-900/40 rounded-xl p-6 font-semibold text-lg">
            {error}
          </div>
        )}

        {!loading && displayItems.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
              {displayItems.map((item) => {
                const title =
                  item.title || item.original_title || "Без назви";
                const year =
                  item.release_date?.slice(0, 4) ||
                  t("common.unknown");

                return (
                  <div key={item.id} className="group relative h-full">
                    <Link
                      to={`/details/movie/${item.id}`}
                      className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 block h-full flex flex-col"
                    >
                      {item.poster_path ? (
                        <img
                          src={`${import.meta.env.VITE_TMDB_IMG_BASE}${item.poster_path}`}
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
                          {item.vote_average > 0 && (
                            <p className="text-teal-400 mt-1 font-bold">
                              ⭐ {item.vote_average.toFixed(1)}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>

                    {/* ❤️ КНОПКА УЛЮБЛЕНИХ З АНІМАЦІЄЮ */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();

                        setAnimatingId(item.id);

                        toggleFavorite({
                          id: item.id,
                          mediaType: "movie",
                          title,
                          posterPath: item.poster_path,
                          voteAverage: item.vote_average,
                          releaseDate: item.release_date,
                        });

                        const isFav = isFavorite(item.id, "movie");
                        toast.success(
                          isFav
                            ? t("favorites.removed")
                            : t("favorites.added")
                        );

                        setTimeout(() => setAnimatingId(null), 300);
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
                        className={`
                          transition-all duration-300
                          ${
                            isFavorite(item.id, "movie")
                              ? "fill-red-500 text-red-500 scale-110"
                              : "text-white"
                          }
                          ${
                            animatingId === item.id
                              ? "scale-125 rotate-12"
                              : ""
                          }
                        `}
                      />
                    </button>
                  </div>
                );
              })}
            </div>

            {visibleCount < allItems.length && (
              <div className="text-center mt-12">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-10 py-4 bg-teal-600 hover:bg-teal-700 disabled:opacity-70 rounded-xl font-bold text-xl transition shadow-lg"
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

export default DashboardCartoons;
