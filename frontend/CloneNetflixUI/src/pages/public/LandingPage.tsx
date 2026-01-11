// src/pages/LandingPage.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { $t } from "../../lib/toast";
import SimpleHeroSlider from "../../lib/Slider";
import { useLanguage } from "../../contexts/LanguageContext";

const TMDB_API_URL = import.meta.env.VITE_TMDB_API_URL;
const TMDB_IMG_BASE = import.meta.env.VITE_TMDB_IMG_BASE;
const TMDB_TOKEN = import.meta.env.VITE_TMDB_TOKEN;

interface Item {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  overview?: string;
  media_type: "movie" | "tv";
}

const LandingPage: React.FC = () => {
  const { t, getTMDBLanguage, language } = useLanguage();
  const [trending, setTrending] = useState<Item[]>([]);
  const [popularMovies, setPopularMovies] = useState<Item[]>([]);
  const [popularSeries, setPopularSeries] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const authHeaders = {
    Authorization: `Bearer ${TMDB_TOKEN}`,
    "Content-Type": "application/json;charset=utf-8",
  };

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      const tmdbLanguage = getTMDBLanguage();
      try {
        const [trendingRes, moviesRes, seriesRes] = await Promise.all([
          fetch(`${TMDB_API_URL}/trending/all/week?language=${tmdbLanguage}`, { headers: authHeaders }),
          fetch(`${TMDB_API_URL}/movie/popular?language=${tmdbLanguage}&page=1`, { headers: authHeaders }),
          fetch(`${TMDB_API_URL}/tv/popular?language=${tmdbLanguage}&page=1`, { headers: authHeaders }),
        ]);

        if (trendingRes.ok) {
          const data = await trendingRes.json();
          setTrending(
            data.results
              .filter((i: any) => i.media_type === "movie" || i.media_type === "tv")
              .slice(0, 12)
              .map((i: any) => ({ ...i, media_type: i.media_type }))
          );
        }

        if (moviesRes.ok) {
          const data = await moviesRes.json();
          setPopularMovies(data.results.slice(0, 10));
        }

        if (seriesRes.ok) {
          const data = await seriesRes.json();
          setPopularSeries(data.results.slice(0, 10));
        }
      } catch (err) {
        console.error("Помилка завантаження контенту на landing:", err);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    $t.error(t('landing.login_required'), {
      duration: 5000,
    });
  };

  const renderGrid = (items: Item[], title: string) => (
    <section className="mb-20">
      <h2 className="text-4xl md:text-5xl font-black text-center mb-12 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
        {title}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={handleCardClick}
            className="group relative overflow-hidden rounded-2xl shadow-2xl transition-all duration-500 hover:scale-105 hover:shadow-purple-500/20"
          >
            {item.poster_path ? (
              <img
                src={`${TMDB_IMG_BASE}${item.poster_path}`}
                alt={item.title || item.name}
                className="w-full aspect-[2/3] object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
            ) : (
              <div className="w-full aspect-[2/3] bg-gray-800 flex items-center justify-center">
                <span className="text-gray-600 text-sm">{t('common.poster_missing')}</span>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-4">
              <h3 className="text-lg font-bold line-clamp-2">
                {item.title || item.name}
              </h3>
              <p className="text-sm text-gray-300 mt-1">
                {item.vote_average > 0 && `⭐ ${item.vote_average.toFixed(1)}`}
              </p>
              <span className="text-xs mt-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full inline-block">
                {item.media_type === "movie" ? t('landing.movie') : t('landing.series')}
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* HERO SECTION */}
      <div className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Фоновий слайдер — на всю ширину і висоту */}
        {!loading && trending.length > 0 && (
          <div className="absolute inset-0 -z-10">
            <SimpleHeroSlider movies={trending} />
          </div>
        )}

        {/* Темний оверлей + розмиття для кращої читабельності тексту */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

        {/* Контент по центру */}
        <div className="relative z-20 text-center px-6 max-w-5xl mx-auto">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-6 leading-none drop-shadow-2xl">
            <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Nexo
            </span>{" "}
            <span className="text-white">Cinema</span>
          </h1>

          <p className="text-xl md:text-3xl lg:text-4xl text-gray-200 mb-12 max-w-4xl mx-auto font-light drop-shadow-lg">
            {t('landing.tagline')}
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-10">
            <Link
              to="/login"
              className="px-12 py-5 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 rounded-2xl font-bold text-xl shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              {t('landing.login')}
            </Link>
            <Link
              to="/register"
              className="px-12 py-5 bg-white/10 hover:bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105"
            >
              {t('landing.register_free')}
            </Link>
          </div>

          <p className="text-gray-400 text-lg">
            {t('landing.features')}
          </p>
        </div>

        {/* Стрілка вниз */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce z-30">
          <svg className="w-12 h-12 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>

      {/* КОНТЕНТ ПІСЛЯ HERO */}
      <div className="relative z-20 -mt-24 pb-24 px-6">
        <div className="container mx-auto max-w-7xl">
          {loading ? (
            <div className="text-center py-40 text-3xl text-gray-500">
              {t('landing.loading')}
            </div>
          ) : (
            <>
              {renderGrid(popularMovies, t('landing.popular_movies'))}
              {renderGrid(popularSeries, t('landing.top_series'))}
            </>
          )}

          {/* Фінальний заклик до дії */}
          <div className="mt-20 py-20 bg-gradient-to-r from-purple-900/40 via-pink-900/30 to-cyan-900/40 rounded-3xl border border-white/10 backdrop-blur-md text-center">
            <h2 className="text-4xl md:text-6xl font-black mb-8 bg-gradient-to-r from-cyan-300 to-purple-400 bg-clip-text text-transparent">
              {t('landing.cta_title')}
            </h2>
            <p className="text-xl md:text-2xl text-gray-200 mb-10 max-w-3xl mx-auto">
              {t('landing.cta_description')}
            </p>
            <Link
              to="/register"
              className="inline-block px-14 py-6 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-700 hover:via-pink-700 hover:to-cyan-700 rounded-2xl font-bold text-2xl shadow-2xl transition-all duration-500 transform hover:scale-110"
            >
              {t('landing.register_free')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;