// src/pages/DashboardMain.tsx
import { useState, useEffect } from "react";
import FilterBar from "../../components/FilterBar";
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

const DashboardMain: React.FC = () => {
    // Filter state
    const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
    const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const { t, getTMDBLanguage } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { withLoading } = useLoading();

  const [nowPlaying, setNowPlaying] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [popularTv, setPopularTv] = useState<Movie[]>([]);
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
      } catch (err) {
        console.error(err);
      }
    });
  }, [language]);

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
      const genreMatch = selectedGenre === null || (item.genre_ids && item.genre_ids.includes(selectedGenre));
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
              className="block overflow-hidden rounded-2xl poster-hover"
            >
              <img
                src={
                  item.poster_path
                    ? `${import.meta.env.VITE_TMDB_IMG_BASE}${item.poster_path}`
                    : "/no-image.png"
                }
                className="rounded-2xl w-full h-auto object-cover transition-transform duration-500 poster-img"
                alt={item.title || item.name || "Poster"}
              />
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
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {!searchMode && nowPlaying.length > 0 && (
        <SimpleHeroSlider movies={nowPlaying} />
      )}

      <form onSubmit={searchContent} className="my-8">
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search..."
          className="px-4 py-2 text-black rounded"
        />
      </form>

      {/* Filter Bar */}
      <div className="mb-8">
        <FilterBar
          selectedGenre={selectedGenre}
          setSelectedGenre={setSelectedGenre}
          selectedRating={selectedRating}
          setSelectedRating={setSelectedRating}
        />
      </div>

      {searchMode
        ? renderGrid(searchResults, "movie")
        : (
          <>
            <h2 className="text-2xl mb-4">Top Movies</h2>
            {renderGrid(popularMovies, "movie")}

            <h2 className="text-2xl my-4">Top Series</h2>
            {renderGrid(popularTv, "tv")}
          </>
        )}
    </div>
  );
};

export default DashboardMain;