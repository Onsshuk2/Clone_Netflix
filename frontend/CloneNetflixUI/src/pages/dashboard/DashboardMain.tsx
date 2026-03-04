// src/pages/DashboardMain.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SimpleHeroSlider from "../../lib/Slider";
import { Heart } from "lucide-react";
import { Clock } from "lucide-react";

import toast from "react-hot-toast";

import { useLanguage } from "../../contexts/LanguageContext";
import { useFavorites } from "../../lib/useFavorites";
import { fetchDashboardInitialData, searchMulti } from "../../api/tmdbDashboard";
import { useLoading } from "../../lib/useLoading";

interface Movie {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: "movie" | "tv";
  genre_ids?: number[];
}

const WATCH_LATER_KEY = "watchLaterList";


interface DashboardMainProps {
  selectedGenres: number[];
  selectedRating: number | null;
}

const DashboardMain: React.FC<DashboardMainProps> = ({ selectedGenres, selectedRating }) => {

  const { t, getTMDBLanguage } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { withLoading } = useLoading();

  const [nowPlaying, setNowPlaying] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [popularTv, setPopularTv] = useState<Movie[]>([]);
  const [popularAnime, setPopularAnime] = useState<Movie[]>([]);
  const [popularCartoons, setPopularCartoons] = useState<Movie[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [searchMode, setSearchMode] = useState(false);

  const language = getTMDBLanguage();
  interface WatchLaterItem {
    id: number;
    title: string;
    posterUrl?: string;
  }

  const [watchLaterList, setWatchLaterList] = useState<WatchLaterItem[]>(() => {
    return JSON.parse(localStorage.getItem(WATCH_LATER_KEY) || "[]");
  });

  useEffect(() => {
    withLoading(async () => {
      try {
        const data = await fetchDashboardInitialData(language);
        setNowPlaying(data.nowPlaying);
        setPopularMovies(data.popularMovies);
        setPopularTv(data.popularTv);
        // Fetch anime and cartoons
        const [anime, cartoons] = await Promise.all([
          (await import("../../api/tmdbDashboard")).fetchTopAnime(language),
          (await import("../../api/tmdbDashboard")).fetchTopCartoons(language)
        ]);
        setPopularAnime(anime);
        setPopularCartoons(cartoons);
      } catch (err) {
        console.error(err);
      }
    });
  }, [language]);

  // Фільтрація по жанрах тільки по локальних даних
  useEffect(() => {
    if (selectedGenres.length === 0) {
      setSearchMode(false);
      setSearchResults([]);
      return;
    }
    // Фільтруємо всі типи: фільми, серіали, аніме, мультфільми
    const filteredMovies = popularMovies.filter((item) =>
      item.genre_ids && selectedGenres.some((gid) => item.genre_ids?.includes(gid))
    );
    const filteredTv = popularTv.filter((item) =>
      item.genre_ids && selectedGenres.some((gid) => item.genre_ids?.includes(gid))
    );
    const filteredAnime = popularAnime.filter((item) =>
      item.genre_ids && selectedGenres.some((gid) => item.genre_ids?.includes(gid))
    );
    const filteredCartoons = popularCartoons.filter((item) =>
      item.genre_ids && selectedGenres.some((gid) => item.genre_ids?.includes(gid))
    );
    setSearchResults([
      ...filteredMovies,
      ...filteredTv,
      ...filteredAnime,
      ...filteredCartoons
    ]);
    setSearchMode(true);
  }, [selectedGenres, popularMovies, popularTv, popularAnime, popularCartoons]);

  useEffect(() => {
    const handleStorage = () => {
      setWatchLaterList(JSON.parse(localStorage.getItem(WATCH_LATER_KEY) || "[]"));
    };
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  useEffect(() => {
    setWatchLaterList(JSON.parse(localStorage.getItem(WATCH_LATER_KEY) || "[]"));
  }, [language]);

  const searchContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    await withLoading(async () => {
      try {
        setSearchMode(true);
        const results = await searchMulti(searchTerm.trim(), language);
        setSearchResults(results.slice(0, 30));
      } catch (err) {
        console.error(err);
      }
    });
  };

  // Filtering logic
  const filterItems = (items: Movie[]) => {
    return items.filter((item) => {
      const genreMatch =
        selectedGenres.length === 0 ||
        (item.genre_ids && selectedGenres.some((gid) => item.genre_ids?.includes(gid)));
      const ratingMatch = selectedRating === null || item.vote_average >= selectedRating;
      return genreMatch && ratingMatch;
    });
  };

  const renderGrid = (items: Movie[], mediaType: "movie" | "tv") => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
      {filterItems(items).map((item) => {
        const type = item.media_type || mediaType;
        const isFav = isFavorite(item.id, type);
        const isWatchLater = watchLaterList.some((m: WatchLaterItem) => m.id === item.id);
        return (
          <div
            key={item.id}
            className="relative group bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/90 rounded-3xl shadow-2xl p-3 transition-all duration-300 hover:scale-[1.03] hover:shadow-3xl"
          >
            <Link to={`/details/${type}/${item.id}`}
              className="block overflow-hidden rounded-2xl poster-hover relative"
            >
              <img
                src={
                  item.poster_path
                    ? `${import.meta.env.VITE_TMDB_IMG_BASE}${item.poster_path}`
                    : "/no-image.png"
                }
                className="rounded-2xl w-full h-[340px] md:h-[440px] object-cover object-center transition-transform duration-500 poster-img"
                alt={item.title || item.name || "Poster"}
                style={{ aspectRatio: '2/3', minHeight: 220, maxHeight: 320 }}
              />
              {/* Hover overlay for title, year, rating */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                <h3 className="text-lg md:text-xl font-bold text-white mb-2 line-clamp-2">
                  {item.title || item.name}
                </h3>
                <div className="flex items-center justify-between">
                  <p className="text-gray-300 text-sm">
                    {(item.release_date || item.first_air_date || "").slice(0, 4) || "Невідомо"}
                  </p>
                  {item.vote_average > 0 && (
                    <p className="text-yellow-400 font-bold flex items-center gap-1">
                      ⭐ {item.vote_average.toFixed(1)}
                    </p>
                  )}
                </div>
              </div>
              {/* Smooth shadow on hover */}
              <div className="absolute inset-0 shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </Link>

            {/* Кнопка улюблене (правий верх) */}
            <button
              onClick={() => {
                const result = toggleFavorite({
                  id: item.id,
                  mediaType: type,
                  title: item.title || item.name || "",
                  posterPath: item.poster_path,
                  voteAverage: item.vote_average,
                });
                toast.success(
                  result
                    ? t("favorites.added")
                    : t("favorites.removed")
                );
              }}
              className="absolute top-4 right-4 z-10 heart-hover"
              title={isFav ? t("favorites.remove") : t("favorites.add")}
            >
              <Heart
                className={
                  (isFav
                    ? "fill-red-500 text-red-500"
                    : "text-white") +
                  " transition-transform duration-300 heart-anim drop-shadow-lg"
                }
                size={28}
              />
            </button>

            {/* Кнопка "на потім" (лівий верх) */}
            <button
              onClick={() => {
                let updated;
                if (isWatchLater) {
                  updated = watchLaterList.filter((m) => m.id !== item.id);
                } else {
                  updated = [...watchLaterList, {
                    id: item.id,
                    title: item.title || item.name || "Видалити зі списку на потім",
                    posterUrl: item.poster_path ? `${import.meta.env.VITE_TMDB_IMG_BASE}${item.poster_path}` : undefined,
                  }];
                }
                setWatchLaterList(updated);
                localStorage.setItem(WATCH_LATER_KEY, JSON.stringify(updated));
                if (!isWatchLater) {
                  toast.success(t('watchLater.added'));
                } else {
                  toast.success(t('watchLater.remove') || 'Видалено зі списку на потім');
                }
              }}
              className={`absolute top-4 left-4 p-2 rounded-full z-10 bg-blue-600 text-white shadow transition-all duration-300 hover:scale-110 ${isWatchLater ? "bg-pink-600" : "bg-blue-600"}`}
              title={isWatchLater ? t("watchLater.remove") || "Видалити зі списку на потім" : t("watchLater.add") || "Додати у список на потім"}
            >
              <Clock size={24} className={isWatchLater ? "text-pink-200 opacity-80" : "text-white opacity-60 group-hover:opacity-90 transition-all duration-300"} />
            </button>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-0">
      <header className="w-full px-0 py-0 bg-gray-950/80 border-b border-gray-800/60 shadow-lg sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 px-6 py-4">
          <div className="flex-1 flex items-center gap-4">
            <span className="text-2xl font-black bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent tracking-tight">Nexo Cinema</span>
          </div>
          <div className="flex-1 flex justify-end">
            <form onSubmit={searchContent} className="flex items-center gap-2">
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('dashboard.search') || "Пошук..."}
                className="px-4 py-2 rounded-xl bg-gray-800/80 border border-gray-700 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none transition w-48 md:w-64"
              />
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full px-6 py-8">
        {!searchMode && nowPlaying.length > 0 && (
          <SimpleHeroSlider movies={nowPlaying} />
        )}

        {searchMode
          ? (
              searchResults.length > 0
                ? renderGrid(searchResults, "movie")
                : <div className="text-center text-lg text-pink-400 font-bold py-12">Нічого не знайдено</div>
            )
          : (
            <>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400 drop-shadow-lg tracking-tight">
                {t('dashboard.top_movies')}
              </h2>
              {renderGrid(popularMovies, "movie")}

              <h2 className="text-3xl md:text-4xl font-extrabold my-8 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-400 drop-shadow-lg tracking-tight">
                {t('dashboard.top_series')}
              </h2>
              {renderGrid(popularTv, "tv")}
            </>
          )}
      </main>
    </div>
  );
};

export default DashboardMain;