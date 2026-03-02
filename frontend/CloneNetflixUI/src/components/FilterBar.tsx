import React from "react";
import { useLanguage } from "../contexts/LanguageContext";

interface FilterBarProps {
  genres: string[];
  selectedGenre: string;
  onGenreChange: (genre: string) => void;
  rating: number;
  onRatingChange: (rating: number) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ genres, selectedGenre, onGenreChange, rating, onRatingChange }) => {
  const { t } = useLanguage();
  return (
    <div className="flex flex-wrap gap-6 items-center mb-10 bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-gray-900/60 p-6 rounded-3xl border-2 border-indigo-500/30 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center gap-3 bg-white/5 rounded-2xl px-4 py-3 shadow-lg border border-indigo-400/30 hover:border-purple-400/40 transition-all">
        <div className="relative w-48">
          <select
            value={selectedGenre}
            onChange={e => onGenreChange(e.target.value)}
            className="w-full pl-4 pr-10 py-2 rounded-xl bg-gradient-to-r from-indigo-900/80 to-purple-900/80 text-white border-2 border-indigo-400 focus:border-purple-500 focus:ring-2 focus:ring-indigo-400/30 font-semibold shadow-md hover:bg-indigo-900/60 transition-all cursor-pointer custom-dropdown"
            style={{
              backgroundImage: 'none',
              WebkitAppearance: 'none',
              MozAppearance: 'none',
              appearance: 'none',
            }}
          >
            <option value="" className="text-indigo-400 font-bold bg-indigo-900/60">{t && typeof t === 'function' ? t('filter.genres_all') : 'Всі жанри'}</option>
            {genres.map(g => (
              <option key={g} value={g} className="hover:bg-indigo-600 hover:text-white">{g}</option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-indigo-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" /></svg>
          </span>
        </div>
        <style>{`
          .custom-dropdown option {
            background: linear-gradient(90deg, #312e81 0%, #6d28d9 100%);
            color: #fff;
            font-size: 1rem;
            padding: 0.5rem 1rem;
            border-radius: 0.75rem;
          }
          .custom-dropdown:focus {
            outline: none;
            border-color: #a78bfa;
            box-shadow: 0 0 0 2px #a78bfa44;
          }
        `}</style>
      </div>
      <div className="flex items-center gap-3 bg-white/5 rounded-2xl px-4 py-3 shadow-lg border border-yellow-400/30 hover:border-yellow-500/40 transition-all">
        <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M12 17.75l-6.172 3.24 1.179-6.88L2 9.51l6.9-1L12 2.25l3.1 6.26 6.9 1-5.007 4.6 1.179 6.88z" /></svg>
        <input
          type="range"
          min={0}
          max={10}
          step={0.1}
          value={rating}
          onChange={e => onRatingChange(Number(e.target.value))}
          className="w-32 accent-indigo-500 bg-transparent rounded-full h-2 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-400/30 shadow-md"
          style={{ background: 'linear-gradient(90deg, #6366f1 0%, #a78bfa 100%)' }}
        />
        <span className="text-indigo-400 font-bold text-base ml-2 px-2 py-1 rounded bg-indigo-900/40 shadow">{rating}</span>
      </div>
    </div>
  );
};

export default FilterBar;
