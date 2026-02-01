import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useWatchHistory } from '../../lib/useWatchHistory';
import { fetchContentDetails } from '../../api/tmdbDashboard';

const TMDB_IMG_BASE = import.meta.env.VITE_TMDB_IMG_BASE;

interface ItemDetail {
  id: number | string;
  title: string;
  poster: string | null;
  type: string;
  watchedAt: number;
}

const WatchHistory: React.FC = () => {
  const { language, getTMDBLanguage, t } = useLanguage();
  const { items, clearHistory, removeItem } = useWatchHistory();
  const [details, setDetails] = useState<ItemDetail[]>([]);
  const [loading, setLoading] = useState(false);

  const tmdbLang = getTMDBLanguage();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const results = await Promise.all(
          items.map(async (it) => {
            try {
              const mapType = (t: string) => (t === 'tv' || t === 'series' ? 'tv' : 'movie');
              const d = await fetchContentDetails(mapType(it.type) as 'movie' | 'tv', String(it.id), tmdbLang);
              const title = d.title || d.name || t('common.unknown');
              return {
                id: it.id,
                title,
                poster: d.poster_path || it.poster_path || null,
                type: it.type,
                watchedAt: it.watchedAt,
              } as ItemDetail;
            } catch (e) {
              return {
                id: it.id,
                title: t('common.unknown'),
                poster: it.poster_path || null,
                type: it.type,
                watchedAt: it.watchedAt,
              } as ItemDetail;
            }
          })
        );
        if (!mounted) return;
        setDetails(results);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [items, tmdbLang, t]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">{t('watch_history.title')}</h1>

      {items.length === 0 ? (
        <p className="text-gray-400">{t('watch_history.empty')}</p>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="text-gray-300">{t('watch_history.title')}: <span className="text-indigo-400 font-bold">{items.length}</span></div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-red-600 rounded" onClick={() => clearHistory()}>{t('watch_history.clear')}</button>
            </div>
          </div>

          {loading ? (
            <p className="text-gray-400">{t('common.loading')}</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {details.map((d) => (
                <div key={`${d.type}-${d.id}`} className="bg-gray-900 rounded-lg overflow-hidden shadow-md">
                  {d.poster ? (
                    <img src={`${TMDB_IMG_BASE}${d.poster}`} alt={d.title} className="w-full h-48 object-cover" />
                  ) : (
                    <div className="w-full h-48 bg-gray-800 flex items-center justify-center text-gray-500">{t('common.poster_missing')}</div>
                  )}
                  <div className="p-3">
                    <div className="font-medium text-white truncate">{d.title}</div>
                    <div className="text-sm text-gray-400 mt-2">{new Date(d.watchedAt).toLocaleString(language)}</div>
                    <div className="mt-3 flex gap-2">
                      <button className="px-3 py-1 bg-red-600 rounded text-sm" onClick={() => removeItem(d.id, d.type)}>{t('watch_history.remove')}</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WatchHistory;
