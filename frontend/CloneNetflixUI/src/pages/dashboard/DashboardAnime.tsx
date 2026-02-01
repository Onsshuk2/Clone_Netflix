// src/pages/DashboardAnime.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { useFavorites } from "../../lib/useFavorites";
import { Heart } from "lucide-react";
import toast from "react-hot-toast";

import { fetchTopAnime, searchAnime } from "../../api/tmdbDashboard";

const DashboardAnime: React.FC = () => {
  const { t, getTMDBLanguage } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [displayItems, setDisplayItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchMode, setSearchMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [displaySearchTerm, setDisplaySearchTerm] = useState("");
  const [topAnime, setTopAnime] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 🔹 ДОДАНО ТІЛЬКИ ДЛЯ АНІМАЦІЇ
  const [animatingId, setAnimatingId] = useState<number | null>(null);

  const language = getTMDBLanguage();

  useEffect(() => {
    const loadTopAnime = async () => {
      setLoading(true);
      setError(null);
      setSearchMode(false);
      setSearchTerm("");
      setDisplaySearchTerm("");

      try {
        const sorted = await fetchTopAnime(language);

        setTopAnime(sorted);
        setDisplayItems(sorted.slice(0, 20));
      } catch (err) {
        console.error("Помилка завантаження топ-аніме:", err);
        setDisplayItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadTopAnime();
  }, [language, t]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const searchAnimeHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    const term = searchTerm.trim();
    if (term.length < 2) {
      setError(t("series.search_min_chars") || "Мінімум 2 символи");
      return;
    }

    setLoading(true);
    setSearchMode(true);
    setDisplaySearchTerm(term);

    try {
      const results = await searchAnime(term, language, 1);

      if (results.length > 0) {
        setDisplayItems(results.slice(0, 20));
      } else {
        setError(t("anime.search_error") || "Нічого не знайдено");
        setDisplayItems([]);
      }
    } catch (err) {
      console.error("Помилка пошуку аніме:", err);
      setDisplayItems([]);
    } finally {
      setLoading(false);
    }
  };

  const resetToTopAnime = () => {
    setSearchMode(false);
    setSearchTerm("");
    setDisplaySearchTerm("");
    setDisplayItems(topAnime.slice(0, 20));
    window.scrollTo(0, 0);
  };


  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <h1 className="text-5xl md:text-6xl font-bold text-center mb-6">
          {t("anime.welcome")}
        </h1>
        <p className="text-xl md:text-2xl text-center text-gray-400 mb-12">
          {searchMode
            ? `${t("dashboard.search_results")} "${displaySearchTerm}"`
            : t("anime.top")}
        </p>

        {searchMode && (
          <div className="text-center mb-8">
            <button
              onClick={resetToTopAnime}
              className="px-8 py-3 bg-purple-700 hover:bg-purple-600 rounded-xl font-semibold text-lg transition shadow"
            >
              {t("dashboard.back")}
            </button>
          </div>
        )}

        <form onSubmit={searchAnimeHandler} className="max-w-3xl mx-auto mb-16">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t("anime.search_placeholder")}
              className="flex-1 px-6 py-5 rounded-xl bg-gray-800 border border-gray-700 focus:outline-none focus:border-purple-500 text-lg placeholder-gray-500 transition"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-12 py-5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 rounded-xl font-bold text-lg transition shadow-lg"
            >
              {loading && searchMode
                ? t("common.searching")
                : t("common.find_button")}
            </button>
          </div>
          {error && (
            <div className="mt-4 text-red-500 text-center font-semibold">
              {error}
            </div>
          )}
        </form>

        {!loading && displayItems.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
              {displayItems.map((item) => {
                const title = item.title || item.name || "Без назви";
                const year =
                  item.release_date?.slice(0, 4) ||
                  item.first_air_date?.slice(0, 4) ||
                  t("common.unknown");
                const mediaType =
                  item.media_type || (item.first_air_date ? "tv" : "movie");

                return (
                  <div
                    key={`${item.id}-${mediaType}`}
                    className="group relative h-full"
                  >
                    <Link
                      to={`/details/${mediaType}/${item.id}`}
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
                            <p className="text-purple-400 mt-1 font-bold">
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
                          mediaType,
                          title,
                          posterPath: item.poster_path,
                          voteAverage: item.vote_average,
                          releaseDate:
                            item.release_date || item.first_air_date,
                        });

                        const isFav = isFavorite(item.id, mediaType);
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
                            isFavorite(item.id, mediaType)
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
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardAnime;
