import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { useFavorites } from "../../lib/useFavorites";
import { Heart, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

const TMDB_IMG_BASE = import.meta.env.VITE_TMDB_IMG_BASE;

const Favorites: React.FC = () => {
  const { t } = useLanguage();
  const { favorites, removeFavorite } = useFavorites();
  const [favoritesList, setFavoritesList] = useState<typeof favorites>([]);

  useEffect(() => {
    setFavoritesList(favorites);
  }, [favorites]);

  const handleRemove = (id: number, mediaType: 'movie' | 'tv') => {
    removeFavorite(id, mediaType);
    toast.success(t('favorites.removed'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок */}
        <div className="flex items-center gap-4 mb-10">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-6 py-3 bg-gray-800/50 hover:bg-gray-700 rounded-xl transition"
          >
            <ArrowLeft size={20} />
            {t('dashboard.back')}
          </Link>
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            {t('favorites.title')}
          </h1>
        </div>

        {/* Порожна сторінка */}
        {favoritesList.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[600px]">
            <Heart size={80} className="text-gray-600 mb-6" />
            <p className="text-2xl text-gray-400 text-center mb-8">
              {t('favorites.empty')}
            </p>
            <Link
              to="/dashboard"
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl font-bold text-lg transition"
            >
              {t('dashboard.back')}
            </Link>
          </div>
        ) : (
          <>
            {/* Кількість улюблених */}
            <div className="mb-8 text-gray-400">
              {t('favorites.title')}: <span className="text-indigo-400 font-bold">{favoritesList.length}</span>
            </div>

            {/* Сітка улюблених */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
              {favoritesList.map((item) => (
                <div key={item.id} className="group relative">
                  <Link
                    to={`/details/${item.mediaType}/${item.id}`}
                    className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 block"
                  >
                    {item.posterPath ? (
                      <img
                        src={`${TMDB_IMG_BASE}${item.posterPath}`}
                        alt={item.title}
                        className="w-full h-80 object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-80 bg-gray-700 flex items-center justify-center">
                        <span className="text-gray-500 text-center px-4">
                          {t('common.no_image')}
                        </span>
                      </div>
                    )}
                    <div className="p-5">
                      <h3
                        className="text-lg font-semibold line-clamp-2"
                        title={item.title}
                      >
                        {item.title}
                      </h3>
                      <p className="text-gray-400 mt-2 text-sm">
                        {item.releaseDate?.slice(0, 4) || t('common.unknown')} {t('common.year')}
                      </p>
                      {item.voteAverage > 0 && (
                        <p className="text-yellow-400 mt-2 font-bold">
                          ⭐ {item.voteAverage.toFixed(1)}
                        </p>
                      )}
                    </div>
                  </Link>

                  {/* Кнопка видалення */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleRemove(item.id, item.mediaType);
                    }}
                    className="absolute top-3 right-3 p-2 bg-black/60 rounded-full hover:bg-black/80 transition-colors z-10 opacity-0 group-hover:opacity-100"
                    title={t('favorites.remove')}
                  >
                    <Heart
                      size={24}
                      className="fill-red-500 text-red-500"
                    />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Favorites;
