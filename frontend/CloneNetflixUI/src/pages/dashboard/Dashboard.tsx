import React, { useState, useEffect } from "react";

const TMDB_API_URL = import.meta.env.VITE_TMDB_API_URL;
const TMDB_IMG_BASE = import.meta.env.VITE_TMDB_IMG_BASE;

const TMDB_TOKEN = import.meta.env.VITE_TMDB_TOKEN;

const WelcomeDashboardMovies: React.FC = () => {
  const [displayMovies, setDisplayMovies] = useState<any[]>([]);
  const [allMovies, setAllMovies] = useState<any[]>([]);
  const [visibleCount, setVisibleCount] = useState(20);
  const [loading, setLoading] = useState(true);
  const [searchMode, setSearchMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [displaySearchTerm, setDisplaySearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [top100Movies, setTop100Movies] = useState<any[]>([]); // Зберігаємо оригінальний топ-100

  const authHeaders = {
    Authorization: `Bearer ${TMDB_TOKEN}`,
    "Content-Type": "application/json;charset=utf-8",
  };

  // Завантаження топ‑100 фільмів при першому відкритті
  useEffect(() => {
    const loadTop100 = async () => {
      setLoading(true);
      setError(null);
      setSearchMode(false);

      try {
        const pagesToLoad = 5;
        const results: any[] = [];

        for (let page = 1; page <= pagesToLoad; page++) {
          const response = await fetch(
            `${TMDB_API_URL}/movie/top_rated?language=uk-UA&page=${page}`,
            { headers: authHeaders }
          );

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            console.error("TMDB top_rated error:", response.status, errData);
            throw new Error("TMDB top_rated error " + response.status);
          }

          const data = await response.json();
          if (data.results) {
            results.push(...data.results);
          }
        }

        setTop100Movies(results); // Зберігаємо оригінал
        setAllMovies(results);
        setVisibleCount(20);
        setDisplayMovies(results.slice(0, 20));
      } catch (err) {
        setError(
          "Помилка завантаження топ‑100 фільмів. Перевірте інтернет або токен TMDB."
        );
        setAllMovies([]);
        setDisplayMovies([]);
      } finally {
        setLoading(false);
      }
    };

    loadTop100();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Пошук фільмів
  const searchMovies = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    const term = searchTerm.trim();
    if (term.length < 2) {
      setError("Введіть хоча б 2 символи для пошуку.");
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
        )}&page=1`,
        { headers: authHeaders }
      );

      if (!response.ok) {
        throw new Error("TMDB search error " + response.status);
      }

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const results = data.results.slice(0, 100);
        setAllMovies(results);
        setDisplayMovies(results.slice(0, 20));
      } else {
        setError("Нічого не знайдено. Спробуйте іншу назву або частину назви.");
        setAllMovies([]);
        setDisplayMovies([]);
      }
    } catch (err) {
      setError("Помилка з'єднання з TMDB. Перевірте токен і інтернет.");
      setAllMovies([]);
      setDisplayMovies([]);
    } finally {
      setLoading(false);
    }
  };

  // Повернення до топ-100
  const resetToTop100 = () => {
    setSearchMode(false);
    setSearchTerm("");
    setDisplaySearchTerm("");
    setError(null);
    setAllMovies(top100Movies);
    setVisibleCount(20);
    setDisplayMovies(top100Movies.slice(0, 20));
  };

  // Кнопка "Показати ще"
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
          Ласкаво просимо до Nexo Cinema!
        </h1>
        <p className="text-xl md:text-2xl text-center text-gray-400 mb-12">
          {searchMode
            ? `Результати пошуку: "${displaySearchTerm}"`
            : "Топ‑100 фільмів зараз"}
        </p>

        {/* Кнопка повернення до топ-100 (тільки в режимі пошуку) */}
        {searchMode && (
          <div className="text-center mb-8">
            <button
              onClick={resetToTop100}
              className="px-8 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-semibold text-lg transition shadow"
            >
              ← Повернутись до топ-100 фільмів
            </button>
          </div>
        )}

        {/* Форма пошуку */}
        <form onSubmit={searchMovies} className="max-w-3xl mx-auto mb-16">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Шукати українською: Ілюзія обману, Титанік, Гаррі Поттер, Оппенгеймер..."
              className="flex-1 px-6 py-5 rounded-xl bg-gray-800 border border-gray-700 focus:outline-none focus:border-blue-500 text-lg placeholder-gray-500 transition"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-12 py-5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 rounded-xl font-bold text-lg transition shadow-lg"
            >
              {loading && searchMode ? "Шукаємо..." : "Знайти"}
            </button>
          </div>
        </form>

        {/* Повідомлення про помилку */}
        {error && !loading && (
          <div className="text-center text-red-400 text-xl bg-red-900/20 py-6 rounded-lg mb-12">
            {error}
          </div>
        )}

        {/* Завантаження */}
        {loading && displayMovies.length === 0 && (
          <div className="text-center text-2xl py-20">
            {searchMode
              ? "Шукаємо фільми..."
              : "Завантажуємо топ‑100 фільмів..."}
          </div>
        )}

        {/* Сітка фільмів */}
        {!loading && displayMovies.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
              {displayMovies.map((movie) => (
                <div
                  key={movie.id}
                  className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
                >
                  {movie.poster_path ? (
                    <img
                      src={`${TMDB_IMG_BASE}${movie.poster_path}`}
                      alt={movie.title}
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
                    <h3
                      className="text-lg font-semibold line-clamp-2"
                      title={movie.title}
                    >
                      {movie.title || movie.original_title}
                    </h3>
                    <p className="text-gray-400 mt-2 text-sm">
                      {movie.release_date?.slice(0, 4) || "Невідомо"} рік
                    </p>
                    {movie.vote_average > 0 && (
                      <p className="text-yellow-400 mt-2 font-bold">
                        ⭐ {movie.vote_average.toFixed(1)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Кнопка "Показати ще" */}
            {visibleCount < allMovies.length && (
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

        {/* Початковий стан без результатів */}
        {!loading && displayMovies.length === 0 && !error && (
          <div className="text-center mt-32 text-3xl text-gray-500">
            Введіть назву фільму для пошуку
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomeDashboardMovies;
