import React, { useState, useEffect } from "react";

const TMDB_API_URL = import.meta.env.VITE_TMDB_API_URL;
const TMDB_IMG_BASE = import.meta.env.VITE_TMDB_IMG_BASE;
const TMDB_TOKEN = import.meta.env.VITE_TMDB_TOKEN;

const DashboardAnime: React.FC = () => {
  const [displayItems, setDisplayItems] = useState<any[]>([]);
  const [allItems, setAllItems] = useState<any[]>([]);
  const [visibleCount, setVisibleCount] = useState(20);
  const [loading, setLoading] = useState(true);
  const [searchMode, setSearchMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [displaySearchTerm, setDisplaySearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [topAnime, setTopAnime] = useState<any[]>([]);

  const authHeaders = {
    Authorization: `Bearer ${TMDB_TOKEN}`,
    "Content-Type": "application/json;charset=utf-8",
  };

  // Фільтри для аніме
  const animeFilters =
    "with_keywords=210024&with_genres=16&with_original_language=ja&vote_count.gte=50";

  // Завантаження топ аніме (фільми + серіали)
  useEffect(() => {
    const loadTopAnime = async () => {
      setLoading(true);
      setError(null);
      setSearchMode(false);

      try {
        const results: any[] = [];

        // Топ аніме-фільми (3 сторінки ~60)
        for (let page = 1; page <= 3; page++) {
          const res = await fetch(
            `${TMDB_API_URL}/discover/movie?language=uk-UA&sort_by=vote_average.desc&page=${page}&${animeFilters}`,
            { headers: authHeaders }
          );
          if (!res.ok) throw new Error("TMDB movie error");
          const data = await res.json();
          results.push(...(data.results || []));
        }

        // Топ аніме-серіали (3 сторінки ~60)
        for (let page = 1; page <= 3; page++) {
          const res = await fetch(
            `${TMDB_API_URL}/discover/tv?language=uk-UA&sort_by=vote_average.desc&page=${page}&${animeFilters}`,
            { headers: authHeaders }
          );
          if (!res.ok) throw new Error("TMDB tv error");
          const data = await res.json();
          results.push(...(data.results || []));
        }

        // Сортуємо за рейтингом і беремо топ-100
        const sorted = results
          .sort((a: any, b: any) => b.vote_average - a.vote_average)
          .slice(0, 100)
          .map((item: any) => ({
            ...item,
            media_type: item.first_air_date ? "tv" : "movie", // Додаємо тип
          }));

        setTopAnime(sorted);
        setAllItems(sorted);
        setVisibleCount(20);
        setDisplayItems(sorted.slice(0, 20));
      } catch (err) {
        setError(
          "Помилка завантаження топ аніме. Перевірте токен або інтернет."
        );
        setAllItems([]);
        setDisplayItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadTopAnime();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Пошук аніме (фільми + серіали)
  const searchAnime = async (e: React.FormEvent) => {
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
        `${TMDB_API_URL}/search/multi?language=uk-UA&query=${encodeURIComponent(
          term
        )}&include_adult=false`,
        { headers: authHeaders }
      );

      if (!response.ok) throw new Error("TMDB search error");

      const data = await response.json();

      // Фільтруємо тільки аніме (movie або tv)
      const animeResults = (data.results || [])
        .filter((item: any) => {
          const isAnimeKeyword = item.keyword_ids?.includes(210024);
          const isJapanese = item.original_language === "ja";
          const isAnimation = item.genre_ids?.includes(16);
          return (
            (item.media_type === "movie" || item.media_type === "tv") &&
            (isAnimeKeyword || (isJapanese && isAnimation))
          );
        })
        .slice(0, 100);

      if (animeResults.length > 0) {
        setAllItems(animeResults);
        setDisplayItems(animeResults.slice(0, 20));
      } else {
        setError(
          "Аніме не знайдено. Спробуйте іншу назву (Наруто, Ван Піс, Атака титанів, Твоє ім'я...)."
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
  const resetToTopAnime = () => {
    setSearchMode(false);
    setSearchTerm("");
    setDisplaySearchTerm("");
    setError(null);
    setAllItems(topAnime);
    setVisibleCount(20);
    setDisplayItems(topAnime.slice(0, 20));
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
          Ласкаво просимо до Nexo - Anime!
        </h1>
        <p className="text-xl md:text-2xl text-center text-gray-400 mb-12">
          {searchMode
            ? `Результати пошуку: "${displaySearchTerm}"`
            : "Топ аніме (фільми та серіали)"}
        </p>

        {searchMode && (
          <div className="text-center mb-8">
            <button
              onClick={resetToTopAnime}
              className="px-8 py-3 bg-purple-700 hover:bg-purple-600 rounded-xl font-semibold text-lg transition shadow"
            >
              ← Повернутись до топ аніме
            </button>
          </div>
        )}

        <form onSubmit={searchAnime} className="max-w-3xl mx-auto mb-16">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Шукати аніме: Наруто, Ван Піс, Атака титанів, Токійський гуль, Твоє ім'я..."
              className="flex-1 px-6 py-5 rounded-xl bg-gray-800 border border-gray-700 focus:outline-none focus:border-purple-500 text-lg placeholder-gray-500 transition"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-12 py-5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 rounded-xl font-bold text-lg transition shadow-lg"
            >
              {loading && searchMode ? "Шукаємо..." : "Знайти"}
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
            {searchMode ? "Шукаємо аніме..." : "Завантажуємо топ аніме..."}
          </div>
        )}

        {!loading && displayItems.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
              {displayItems.map((item) => (
                <div
                  key={item.id + item.media_type}
                  className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
                >
                  {item.poster_path ? (
                    <img
                      src={`${TMDB_IMG_BASE}${item.poster_path}`}
                      alt={item.title || item.name}
                      className="w-full h-80 object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-80 bg-gray-700 flex items-center justify-center">
                      <span className="text-gray-500 text-center px-4">
                        Постер відсутній
                      </span>
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs bg-purple-600 px-2 py-1 rounded">
                        {item.media_type === "tv" ? "Серіал" : "Фільм"}
                      </span>
                    </div>
                    <h3
                      className="text-lg font-semibold line-clamp-2"
                      title={item.title || item.name}
                    >
                      {item.title || item.name}
                    </h3>
                    <p className="text-gray-400 mt-2 text-sm">
                      {item.release_date?.slice(0, 4) ||
                        item.first_air_date?.slice(0, 4) ||
                        "Невідомо"}{" "}
                      рік
                    </p>
                    {item.vote_average > 0 && (
                      <p className="text-purple-400 mt-2 font-bold">
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
                  disabled={loading}
                  className="px-10 py-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-70 rounded-xl font-bold text-xl transition shadow-lg"
                >
                  Показати ще
                </button>
              </div>
            )}
          </>
        )}

        {!loading && displayItems.length === 0 && !error && (
          <div className="text-center mt-32 text-3xl text-gray-500">
            Введіть назву аніме для пошуку
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardAnime;
