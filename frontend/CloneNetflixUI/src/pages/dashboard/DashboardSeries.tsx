// src/pages/DashboardSeries.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const TMDB_API_URL = import.meta.env.VITE_TMDB_API_URL;
const TMDB_IMG_BASE = import.meta.env.VITE_TMDB_IMG_BASE;
const TMDB_TOKEN = import.meta.env.VITE_TMDB_TOKEN;

const DashboardSeries: React.FC = () => {
  const [displaySeries, setDisplaySeries] = useState<any[]>([]);
  const [allSeries, setAllSeries] = useState<any[]>([]);
  const [visibleCount, setVisibleCount] = useState(20);
  const [loading, setLoading] = useState(true);
  const [searchMode, setSearchMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [displaySearchTerm, setDisplaySearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [topSeries, setTopSeries] = useState<any[]>([]);

  const authHeaders = {
    Authorization: `Bearer ${TMDB_TOKEN}`,
    "Content-Type": "application/json;charset=utf-8",
  };

  // Завантаження топ-100 серіалів (без аніме)
  useEffect(() => {
    const loadTopSeries = async () => {
      setLoading(true);
      setError(null);
      setSearchMode(false);

      try {
        const pagesToLoad = 5;
        const results: any[] = [];

        for (let page = 1; page <= pagesToLoad; page++) {
          const response = await fetch(
            `${TMDB_API_URL}/tv/top_rated?language=uk-UA&page=${page}`,
            { headers: authHeaders }
          );

          if (!response.ok) throw new Error("TMDB error " + response.status);

          const data = await response.json();
          if (data.results) {
            const filtered = data.results.filter(
              (item: any) =>
                !(
                  item.genre_ids.includes(16) && item.original_language === "ja"
                )
            );
            results.push(...filtered);
          }
        }

        const top100 = results.slice(0, 100);

        setTopSeries(top100);
        setAllSeries(top100);
        setVisibleCount(20);
        setDisplaySeries(top100.slice(0, 20));
      } catch (err) {
        setError("Помилка завантаження топ серіалів. Перевірте токен або інтернет.");
        setAllSeries([]);
        setDisplaySeries([]);
      } finally {
        setLoading(false);
      }
    };

    loadTopSeries();
  }, []);

  // === ПРОСТА ЛОГІКА: ЗАВЖДИ ПРОКРУЧУВАТИ ВГОРУ ПРИ МОНТУВАННІ СТОРІНКИ ===
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []); // Виконується один раз при першому рендері

  // Пошук серіалів
  const searchSeries = async (e: React.FormEvent) => {
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
        `${TMDB_API_URL}/search/tv?language=uk-UA&query=${encodeURIComponent(term)}&include_adult=false`,
        { headers: authHeaders }
      );

      if (!response.ok) throw new Error("TMDB search error");

      const data = await response.json();

      const filteredResults = (data.results || [])
        .filter(
          (item: any) =>
            !(item.genre_ids?.includes(16) && item.original_language === "ja")
        )
        .slice(0, 100);

      if (filteredResults.length > 0) {
        setAllSeries(filteredResults);
        setDisplaySeries(filteredResults.slice(0, 20));
      } else {
        setError(
          "Серіали не знайдено. Спробуйте: Гра престолів, Пуститися берега, Друзі, ВандаВіжн, Чорне дзеркало..."
        );
        setAllSeries([]);
        setDisplaySeries([]);
      }
    } catch (err) {
      setError("Помилка пошуку. Перевірте інтернет або токен.");
      setAllSeries([]);
      setDisplaySeries([]);
    } finally {
      setLoading(false);
    }
  };

  // Повернення до топ-списку
  const resetToTop = () => {
    setSearchMode(false);
    setSearchTerm("");
    setDisplaySearchTerm("");
    setError(null);
    setAllSeries(topSeries);
    setVisibleCount(20);
    setDisplaySeries(topSeries.slice(0, 20));
    window.scrollTo(0, 0); // При поверненні до топу — теж вгору
  };

  // Показати ще
  const loadMore = () => {
    if (loading) return;
    const nextCount = Math.min(visibleCount + 20, allSeries.length);
    setVisibleCount(nextCount);
    setDisplaySeries(allSeries.slice(0, nextCount));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <h1 className="text-5xl md:text-6xl font-bold text-center mb-6">
          Ласкаво просимо до Nexo - Series!
        </h1>
        <p className="text-xl md:text-2xl text-center text-gray-400 mb-12">
          {searchMode
            ? `Результати пошуку: "${displaySearchTerm}"`
            : "Топ-100 серіалів усіх часів"}
        </p>

        {searchMode && (
          <div className="text-center mb-8">
            <button
              onClick={resetToTop}
              className="px-8 py-3 bg-blue-700 hover:bg-blue-600 rounded-xl font-semibold text-lg transition shadow"
            >
              ← Повернутись до топ серіалів
            </button>
          </div>
        )}

        <form onSubmit={searchSeries} className="max-w-3xl mx-auto mb-16">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Шукати серіали: Гра престолів, Пуститися берега, Друзі, ВандаВіжн, Чорне дзеркало..."
              className="flex-1 px-6 py-5 rounded-xl bg-gray-800 border border-gray-700 focus:outline-none focus:border-blue-500 text-lg placeholder-gray-500 transition"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-12 py-5 bg-green-600 hover:bg-green-700 disabled:bg-green-800 rounded-xl font-bold text-lg transition shadow-lg"
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

        {loading && displaySeries.length === 0 && (
          <div className="text-center text-2xl py-20">
            {searchMode ? "Шукаємо серіали..." : "Завантажуємо топ серіалів..."}
          </div>
        )}

        {!loading && displaySeries.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
              {displaySeries.map((series) => (
                <Link
                  key={series.id}
                  to={`/details/tv/${series.id}`}
                  className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 block"
                >
                  {series.poster_path ? (
                    <img
                      src={`${TMDB_IMG_BASE}${series.poster_path}`}
                      alt={series.name}
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
                      <span className="text-xs bg-blue-600 px-2 py-1 rounded">
                        Серіал
                      </span>
                    </div>
                    <h3
                      className="text-lg font-semibold line-clamp-2"
                      title={series.name}
                    >
                      {series.name}
                    </h3>
                    <p className="text-gray-400 mt-2 text-sm">
                      {series.first_air_date?.slice(0, 4) || "Невідомо"} рік
                    </p>
                    {series.vote_average > 0 && (
                      <p className="text-blue-400 mt-2 font-bold">
                        ⭐ {series.vote_average.toFixed(1)}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {visibleCount < allSeries.length && (
              <div className="text-center mt-12">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-10 py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 rounded-xl font-bold text-xl transition shadow-lg"
                >
                  Показати ще
                </button>
              </div>
            )}
          </>
        )}

        {!loading && displaySeries.length === 0 && !error && (
          <div className="text-center mt-32 text-3xl text-gray-500">
            Введіть назву серіалу для пошуку
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardSeries;