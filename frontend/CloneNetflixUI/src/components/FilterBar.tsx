import React, { useEffect, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
// Статичний перелік жанрів
const STATIC_GENRES = [
  { id: 28, name: "Бойовик" },
  { id: 12, name: "Пригоди" },
  { id: 16, name: "Анімація" },
  { id: 35, name: "Комедія" },
  { id: 80, name: "Кримінал" },
  { id: 99, name: "Документальний" },
  { id: 18, name: "Драма" },
  { id: 10751, name: "Сімейний" },
  { id: 14, name: "Фентезі" },
  { id: 36, name: "Історія" },
  { id: 27, name: "Жахи" },
  { id: 10402, name: "Музика" },
  { id: 9648, name: "Містика" },
  { id: 10749, name: "Мелодрама" },
  { id: 878, name: "Наукова фантастика" },
  { id: 10770, name: "Телефільм" },
  { id: 53, name: "Трилер" },
  { id: 10752, name: "Військовий" },
  { id: 37, name: "Вестерн" },
];

interface FilterBarProps {
  selectedGenres: number[];
  setSelectedGenres: (genreIds: number[]) => void;
  selectedRating: number | null;
  setSelectedRating: (rating: number | null) => void;
}


const FilterBar: React.FC<FilterBarProps> = (props) => {
  const {
    selectedGenres,
    setSelectedGenres,
    selectedRating,
    setSelectedRating,
  } = {
    selectedGenres: [],
    ...props
  };
  const { t, getTMDBLanguage } = useLanguage();
  const [genres] = useState<{ id: number; name: string }[]>(STATIC_GENRES);
  const [genreDropdownOpen, setGenreDropdownOpen] = useState(false);

  // Senior frontend: genre pills, modern colors, smooth transitions, clear separation
  return (
    <div className="flex flex-col gap-6">
      <div>
        <label className="block text-xs font-semibold text-indigo-300 mb-2 tracking-wide">{t("filter.genres_label") || "Жанри"}</label>
        <div className="flex flex-wrap gap-2">
          <button
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all border ${(Array.isArray(selectedGenres) && selectedGenres.length === 0) ? "bg-gradient-to-r from-indigo-500 to-pink-500 text-white border-indigo-500 shadow-lg" : "bg-gray-900 text-indigo-200 border-gray-700 hover:bg-indigo-950/60"}`}
            onClick={() => setGenreDropdownOpen((v) => !v)}
            type="button"
          >
            {t("filter.genres_all")}
          </button>
          {genreDropdownOpen && (
            <div className="absolute mt-2 w-64 bg-gray-900/96 border border-gray-800 rounded-2xl shadow-2xl z-50 p-4 animate-fade-in">
              <div className="flex flex-wrap gap-2">
                {genres.map((genre) => (
                  <button
                    key={genre.id}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all border ${(Array.isArray(selectedGenres) && selectedGenres.includes(genre.id)) ? "bg-gradient-to-r from-indigo-500 to-pink-500 text-white border-indigo-500 shadow-lg" : "bg-gray-900 text-indigo-200 border-gray-700 hover:bg-indigo-950/60"}`}
                    onClick={() => {
                      if (Array.isArray(selectedGenres) && selectedGenres.includes(genre.id)) {
                        setSelectedGenres(selectedGenres.filter((id) => id !== genre.id));
                      } else {
                        setSelectedGenres([...(Array.isArray(selectedGenres) ? selectedGenres : []), genre.id]);
                      }
                      setGenreDropdownOpen(false);
                    }}
                  >
                    {genre.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="pt-2">
        <label htmlFor="rating-slider" className="block text-xs font-semibold text-indigo-300 mb-2 tracking-wide">{t("filter.rating_label")}</label>
        <div className="flex items-center gap-3">
          <input
            id="rating-slider"
            type="range"
            min={5}
            max={9}
            step={1}
            value={selectedRating ?? 5}
            onChange={e => setSelectedRating(Number(e.target.value))}
            className="accent-pink-500 w-full h-2 rounded-full bg-gradient-to-r from-indigo-900 via-gray-900 to-pink-900 shadow-inner"
          />
          <span className="px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white text-xs font-bold border border-indigo-500 shadow-lg min-w-[32px] text-center">{selectedRating ?? t("filter.rating_all")}</span>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
