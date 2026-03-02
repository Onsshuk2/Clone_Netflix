import React, { useEffect, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { fetchGenres } from "../api/tmdbGenres.tsx";

interface FilterBarProps {
  selectedGenre: number | null;
  setSelectedGenre: (genreId: number | null) => void;
  selectedRating: number | null;
  setSelectedRating: (rating: number | null) => void;
}


const FilterBar: React.FC<FilterBarProps> = ({
  selectedGenre,
  setSelectedGenre,
  selectedRating,
  setSelectedRating,
}) => {
  const { t, getTMDBLanguage } = useLanguage();
  const [genres, setGenres] = useState<{ id: number; name: string }[]>([]);
  const [genreDropdownOpen, setGenreDropdownOpen] = useState(false);

  useEffect(() => {
    fetchGenres(getTMDBLanguage()).then((data: { id: number; name: string }[]) => {
      setGenres(data);
    });
  }, [getTMDBLanguage]);

  // Dropdown for genres, slider for rating
  return (
    <div className="flex flex-row gap-4 items-center justify-center py-3 w-full">
      {/* Genre Dropdown */}
      <div className="relative">
        <button
          className="px-4 py-2 bg-[#18181b] rounded-xl border border-[#27272a] shadow flex items-center min-w-[120px] justify-between transition-all hover:bg-[#232326] focus:outline-none font-medium text-white text-sm"
          onClick={() => setGenreDropdownOpen((open) => !open)}
        >
          <span className="truncate">
            {selectedGenre === null
              ? t("filter.genres_all")
              : genres.find((g) => g.id === selectedGenre)?.name}
          </span>
          <svg
            className="ml-2 w-4 h-4 text-[#e11d48]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        {genreDropdownOpen && (
          <div className="absolute left-0 mt-2 w-full max-h-48 overflow-y-auto bg-[#18181b] border border-[#27272a] rounded-xl shadow z-30 animate-fade-in">
            <div
              className={`px-4 py-2 cursor-pointer transition-colors text-white text-sm font-medium ${selectedGenre === null ? "bg-[#e11d48]/80" : "hover:bg-[#232326]"}`}
              tabIndex={0}
              role="button"
              aria-selected={selectedGenre === null}
              onClick={() => {
                setSelectedGenre(null);
                setGenreDropdownOpen(false);
              }}
            >
              {t("filter.genres_all")}
            </div>
            {genres.map((genre) => (
              <div
                key={genre.id}
                className={`px-4 py-2 cursor-pointer transition-colors text-white text-sm font-medium ${selectedGenre === genre.id ? "bg-[#e11d48]/80" : "hover:bg-[#232326]"}`}
                tabIndex={0}
                role="button"
                aria-selected={selectedGenre === genre.id}
                onClick={() => {
                  setSelectedGenre(genre.id);
                  setGenreDropdownOpen(false);
                }}
              >
                {genre.name}
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Rating Slider */}
      <div className="flex flex-col items-center gap-1 min-w-[120px]">
        <label htmlFor="rating-slider" className="text-xs font-medium text-white mb-0 tracking-tight">{t("filter.rating_label")}</label>
        <div className="flex items-center gap-2 w-full">
          <input
            id="rating-slider"
            type="range"
            min={5}
            max={9}
            step={1}
            value={selectedRating ?? 5}
            onChange={e => setSelectedRating(Number(e.target.value))}
            className="accent-[#e11d48] w-full h-1 rounded-full bg-[#232326]"
          />
          <span className="px-2 py-0.5 rounded-xl bg-[#e11d48] text-white text-xs font-bold min-w-[28px] text-center border border-[#e11d48]">{selectedRating ?? t("filter.rating_all")}</span>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
