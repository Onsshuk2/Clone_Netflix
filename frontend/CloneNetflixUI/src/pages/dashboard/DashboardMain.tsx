// src/pages/WelcomeDashboard.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SimpleHeroSlider from "../../lib/Slider";

const TMDB_API_URL = import.meta.env.VITE_TMDB_API_URL;
const TMDB_IMG_BASE = import.meta.env.VITE_TMDB_IMG_BASE;
const TMDB_TOKEN = import.meta.env.VITE_TMDB_TOKEN;

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
  const [nowPlaying, setNowPlaying] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [popularTv, setPopularTv] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [searchMode, setSearchMode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authHeaders = {
    Authorization: `Bearer ${TMDB_TOKEN}`,
    "Content-Type": "application/json;charset=utf-8",
  };

  // Завантаження контенту
  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      try {
        const [nowRes, popMoviesRes, popTvRes] = await Promise.all([
          fetch(`${TMDB_API_URL}/movie/now_playing?language=uk-UA&page=1`, { headers: authHeaders }),
          fetch(`${TMDB_API_URL}/movie/popular?language=uk-UA&page=1`, { headers: authHeaders }),
          fetch(`${TMDB_API_URL}/tv/popular?language=uk-UA&page=1`, { headers: authHeaders }),
        ]);

        if (nowRes.ok) {
          const data = await nowRes.json();
          setNowPlaying(data.results);
        }
        if (popMoviesRes.ok) {
          const data = await popMoviesRes.json();
          setPopularMovies(data.results);
        }
        if (popTvRes.ok) {
          const data = await popTvRes.json();
          setPopularTv(data.results);
        }
      } catch (err) {
        console.error(err);
        setError("Помилка завантаження контенту");
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, []);

  // === ПРОСТА ЛОГІКА: ЗАВЖДИ ПРОКРУЧУВАТИ ВГОРУ ПРИ МОНТУВАННІ СТОРІНКИ ===
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []); // Порожній масив залежностей — виконується тільки один раз при першому рендері

  const searchContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setSearchMode(true);

    try {
      const response = await fetch(
        `${TMDB_API_URL}/search/multi?language=uk-UA&query=${encodeURIComponent(searchTerm.trim())}&include_adult=false`,
        { headers: authHeaders }
      );
      if (response.ok) {
        const data = await response.json();
        const filtered = data.results.filter(
          (item: any) => item.media_type === "movie" || item.media_type === "tv"
        );
        setSearchResults(filtered.slice(0, 30));
      } else {
        setError("Помилка пошуку");
      }
    } catch {
      setError("Помилка з'єднання");
    } finally {
      setLoading(false);
    }
  };

  const resetSearch = () => {
    setSearchMode(false);
    setSearchTerm("");
    setSearchResults([]);
    window.scrollTo(0, 0); // При поверненні з пошуку — теж вгору
  };

  const renderGrid = (items: Movie[], mediaType: "movie" | "tv") => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
      {items.map((item) => {
        const type = (item.media_type as "movie" | "tv") || mediaType;

        return (
          <Link
            key={item.id}
            to={`/details/${type}/${item.id}`}
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
              <h3 className="text-lg font-semibold line-clamp-2">
                {item.title || item.name}
              </h3>
              <p className="text-gray-400 text-sm mt-2">
                {(item.release_date || item.first_air_date || "").slice(0, 4) ||
                  "Невідомо"}{" "}
                рік
              </p>
              {item.vote_average > 0 && (
                <p className="text-yellow-400 mt-2 font-bold">
                  ⭐ {item.vote_average.toFixed(1)}
                </p>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Слайдер з новинками */}
        {!loading && <SimpleHeroSlider movies={nowPlaying} />}

        {/* Пошук */}
        <form onSubmit={searchContent} className="max-w-4xl mx-auto mb-20 -mt-8 relative z-10">
          <div className="flex flex-col sm:flex-row gap-4 shadow-2xl">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Пошук: Пуститися берега, Декстер, Наруто, Оппенгеймер..."
              className="flex-1 px-8 py-6 rounded-xl bg-gray-800 border border-gray-700 focus:outline-none focus:border-blue-500 text-xl placeholder-gray-500 transition"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-16 py-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 rounded-xl font-bold text-xl transition shadow-lg"
            >
              Знайти
            </button>
          </div>
        </form>

        {searchMode && (
          <div className="text-center mb-8">
            <button
              onClick={resetSearch}
              className="px-8 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-semibold text-lg transition shadow"
            >
              ← Повернутись до головної
            </button>
          </div>
        )}

        {error && (
          <div className="text-center text-red-400 text-xl bg-red-900/20 py-6 rounded-lg mb-12">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-center text-2xl py-20">Завантажуємо контент...</div>
        )}

        {/* Результати пошуку */}
        {!loading && searchMode && searchResults.length > 0 && (
          <div className="mb-20">
            <h2 className="text-4xl font-bold text-center mb-12">
              Результати пошуку: "{searchTerm}"
            </h2>
            {renderGrid(searchResults, searchResults[0]?.media_type === "tv" ? "tv" : "movie")}
          </div>
        )}

        {/* Головний контент */}
        {!loading && !searchMode && (
          <>
            <section className="mt-12 mb-24">
              <h2 className="text-4xl font-bold text-center mb-12">Топ 20 популярних фільмів</h2>
              {renderGrid(popularMovies, "movie")}
            </section>

            <section className="mb-20">
              <h2 className="text-4xl font-bold text-center mb-12">Топ 20 популярних серіалів</h2>
              {renderGrid(popularTv, "tv")}
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default WelcomeDashboard;