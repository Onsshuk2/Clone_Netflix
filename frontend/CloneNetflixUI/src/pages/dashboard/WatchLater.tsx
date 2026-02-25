import { useEffect, useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";

interface Movie {
  id: string;
  title: string;
  posterUrl?: string;
}

const LOCAL_STORAGE_KEY = "watchLaterList";

export default function WatchLater() {
  const { language } = useLanguage();
  const [movies, setMovies] = useState<Movie[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) setMovies(JSON.parse(saved));
  }, []);

  const removeMovie = (id: string) => {
    const updated = movies.filter((m) => m.id !== id);
    setMovies(updated);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950 py-10 px-5">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-black text-center mb-10 bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
          {language === "uk" ? "Список на потім" : "Watch Later List"}
        </h1>
        <div className="bg-gray-900/70 backdrop-blur-xl rounded-3xl border border-gray-800 shadow-2xl p-8">
          {movies.length === 0 ? (
            <div className="text-center text-gray-400 text-xl py-16">
              {language === "uk" ? "Список порожній. Додавайте фільми, які хочете переглянути пізніше." : "Your list is empty. Add movies you want to watch later."}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {movies.map((movie) => (
                <div key={movie.id} className="bg-gray-800 rounded-xl shadow-lg p-4 flex flex-col items-center">
                  <img
                    src={movie.posterUrl || "https://via.placeholder.com/200x300?text=No+Poster"}
                    alt={movie.title}
                    className="w-40 h-60 object-cover rounded-lg mb-4"
                  />
                  <div className="text-lg font-semibold text-white mb-2 text-center">{movie.title}</div>
                  <button
                    onClick={() => removeMovie(movie.id)}
                    className="px-6 py-2 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl text-white font-semibold shadow transition hover:from-red-500 hover:to-pink-500 mt-2"
                  >
                    {language === "uk" ? "Видалити" : "Remove"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
