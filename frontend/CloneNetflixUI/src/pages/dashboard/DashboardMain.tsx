import React, { useState, useEffect } from "react";

const TMDB_API_URL = import.meta.env.VITE_TMDB_API_URL;
const TMDB_IMG_BASE = import.meta.env.VITE_TMDB_IMG_BASE;
const TMDB_TOKEN = import.meta.env.VITE_TMDB_TOKEN;

interface MediaItem {
  id: number;
  title: string;
  original_title?: string;
  name?: string;
  original_name?: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  media_type: "movie" | "tv" | "animation" | "anime";
}

const WelcomeDashboard: React.FC = () => {
  const [displayItems, setDisplayItems] = useState<MediaItem[]>([]);
  const [allItems, setAllItems] = useState<MediaItem[]>([]);
  const [visibleCount, setVisibleCount] = useState(20);
  const [loading, setLoading] = useState(true);
  const [searchMode, setSearchMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [displaySearchTerm, setDisplaySearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [topSorted, setTopSorted] = useState<MediaItem[]>([]); // Тепер просто сортований, без shuffle

  const authHeaders = {
    Authorization: `Bearer ${TMDB_TOKEN}`,
    "Content-Type": "application/json;charset=utf-8",
  };

  useEffect(() => {
    const loadTopMixed = async () => {
      setLoading(true);
      setError(null);
      setSearchMode(false);

      try {
        const results: MediaItem[] = [];

        // 1. Популярні фільми
        const moviesRes = await fetch(`${TMDB_API_URL}/movie/popular?language=uk-UA&page=1`, { headers: authHeaders });
        if (moviesRes.ok) {
          const data = await moviesRes.json();
          results.push(...data.results.slice(0, 25).map((m: any) => ({
            ...m,
            media_type: "movie" as const,
            title: m.title,
          })));
        }

        // 2. Популярні серіали
        const tvRes = await fetch(`${TMDB_API_URL}/tv/popular?language=uk-UA&page=1`, { headers: authHeaders });
        if (tvRes.ok) {
          const data = await tvRes.json();
          results.push(...data.results.slice(0, 25).map((m: any) => ({
            ...m,
            media_type: "tv" as const,
            title: m.name,
            release_date: m.first_air_date,
          })));
        }

        // 3. Анімаційні фільми (мультфільми)
        const animationRes = await fetch(
          `${TMDB_API_URL}/discover/movie?language=uk-UA&with_genres=16&sort_by=popularity.desc&page=1`,
          { headers: authHeaders }
        );
        if (animationRes.ok) {
          const data = await animationRes.json();
          results.push(...data.results.slice(0, 25).map((m: any) => ({
            ...m,
            media_type: "animation" as const,
          })));
        }

        // 4. Аніме (серіали)
        const animeRes = await fetch(
          `${TMDB_API_URL}/discover/tv?language=uk-UA&with_genres=16&sort_by=popularity.desc&page=1`,
          { headers: authHeaders }
        );
        if (animeRes.ok) {
          const data = await animeRes.json();
          results.push(...data.results.slice(0, 25).map((m: any) => ({
            ...m,
            media_type: "anime" as const,
            title: m.name,
            release_date: m.first_air_date,
          })));
        }

        // СОРТУВАННЯ ЗА РЕЙТИНГОМ (найвищий зверху)
        const sortedByRating = [...results].sort((a, b) => b.vote_average - a.vote_average);

        setTopSorted(sortedByRating);
        setAllItems(sortedByRating);
        setVisibleCount(20);
        setDisplayItems(sortedByRating.slice(0, 20));
      } catch (err) {
        setError("Помилка завантаження контенту. Перевірте токен TMDB або інтернет.");
        setAllItems([]);
        setDisplayItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadTopMixed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Пошук — без змін
  const searchMovies = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    const term = searchTerm.trim();
    if (term.length < 2) {
      setError("Введіть хоча б 2 символи.");
      return;
    }

    setLoading(true);
    setError(null);
    setSearchMode(true);
    setVisibleCount(20);
    setDisplaySearchTerm(term);

    try {
      const response = await fetch(
        `${TMDB_API_URL}/search/movie?language=uk-UA&query=${encodeURIComponent(term)}`,
        { headers: authHeaders }
      );
      if (!response.ok) throw new Error("Search error");

      const data = await response.json();
      if (data.results?.length > 0) {
        const results: MediaItem[] = data.results.slice(0, 100).map((m: any) => ({
          ...m,
          media_type: "movie" as const,
        }));
        // Також сортуємо результати пошуку за рейтингом
        const sorted = results.sort((a, b) => b.vote_average - a.vote_average);
        setAllItems(sorted);
        setDisplayItems(sorted.slice(0, 20));
      } else {
        setError("Нічого не знайдено.");
        setAllItems([]);
        setDisplayItems([]);
      }
    } catch {
      setError("Помилка пошуку.");
    } finally {
      setLoading(false);
    }
  };

  const resetToTop = () => {
    setSearchMode(false);
    setSearchTerm("");
    setDisplaySearchTerm("");
    setError(null);
    setAllItems(topSorted);
    setVisibleCount(20);
    setDisplayItems(topSorted.slice(0, 20));
  };

  const loadMore = () => {
    if (loading) return;
    const nextCount = Math.min(visibleCount + 20, allItems.length);
    setVisibleCount(nextCount);
    setDisplayItems(allItems.slice(0, nextCount));
  };

  // Бейджі
  const getBadgeStyle = (type: string) => {
    switch (type) {
      case "movie": return "bg-orange-600/90";
      case "tv": return "bg-blue-600/90";
      case "animation": return "bg-purple-600/90";
      case "anime": return "bg-pink-600/90";
      default: return "bg-gray-600/90";
    }
  };

  const getBadgeText = (type: string) => {
    switch (type) {
      case "movie": return "КІНО";
      case "tv": return "TV";
      case "animation": return "АНІМАЦІЯ";
      case "anime": return "АНІМЕ";
      default: return "КІНО";
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <h1 className="text-5xl md:text-6xl font-bold text-center mb-6">
          Ласкаво просимо до Nexo Cinema!
        </h1>
        <p className="text-xl md:text-2xl text-center text-gray-400 mb-12">
          {searchMode
            ? `Результати пошуку: "${displaySearchTerm}"`
            : "Топ-100: фільми, серіали, мультфільми та аніме (сортовані за рейтингом)"}
        </p>

        {searchMode && (
          <div className="text-center mb-8">
            <button
              onClick={resetToTop}
              className="px-8 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-semibold text-lg transition shadow"
            >
              ← Повернутись до топ-100
            </button>
          </div>
        )}

        <form onSubmit={searchMovies} className="max-w-3xl mx-auto mb-16">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Пошук фільмів: Оппенгеймер, Гра престолів, Наруто, Шрек..."
              className="flex-1 px-6 py-5 rounded-xl bg-gray-800 border border-gray-700 focus:outline-none focus:border-orange-500 text-lg placeholder-gray-500 transition"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-12 py-5 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-800 rounded-xl font-bold text-lg transition shadow-lg"
            >
              Знайти
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
            {searchMode ? "Шукаємо..." : "Завантажуємо найкращий контент..."}
          </div>
        )}

        {!loading && displayItems.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
              {displayItems.map((item) => (
                <div
                  key={`${item.media_type}-${item.id}`}
                  className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 relative"
                >
                  <div className="absolute top-3 left-3 z-10">
                    <span className={`px-3 py-1 text-xs font-bold ${getBadgeStyle(item.media_type)} backdrop-blur-md rounded-full`}>
                      {getBadgeText(item.media_type)}
                    </span>
                  </div>

                  {item.poster_path ? (
                    <img
                      src={`${TMDB_IMG_BASE}${item.poster_path}`}
                      alt={item.title || item.name}
                      className="w-full h-80 object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-80 bg-gray-700 flex items-center justify-center">
                      <span className="text-gray-500 text-center px-4">Постер відсутній</span>
                    </div>
                  )}

                  <div className="p-5">
                    <h3 className="text-lg font-semibold line-clamp-2" title={item.title || item.name}>
                      {item.title || item.name || item.original_title || item.original_name}
                    </h3>
                    <p className="text-gray-400 mt-2 text-sm">
                      {(item.release_date || item.first_air_date)?.slice(0, 4) || "Невідомо"} рік
                    </p>
                    {item.vote_average > 0 && (
                      <p className="text-yellow-400 mt-2 font-bold">
                        ⭐ {item.vote_average.toFixed(1)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {visibleCount < allItems.length && (
              <div className="text-center mt-12">
                <button
                  onClick={loadMore}
                  className="px-10 py-4 bg-orange-600 hover:bg-orange-700 rounded-xl font-bold text-xl transition shadow-lg"
                >
                  Показати ще
                </button>
              </div>
            )}
          </>
        )}

        {!loading && displayItems.length === 0 && !error && (
          <div className="text-center mt-32 text-3xl text-gray-500">
            Введіть назву для пошуку
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomeDashboard;