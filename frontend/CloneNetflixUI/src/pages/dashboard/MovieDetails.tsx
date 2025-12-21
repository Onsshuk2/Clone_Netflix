// src/pages/dashboard/MovieDetails.tsx
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import YouTube from "react-youtube";

const TMDB_API_URL = import.meta.env.VITE_TMDB_API_URL;
const TMDB_IMG_BASE = import.meta.env.VITE_TMDB_IMG_BASE;
const TMDB_BACKDROP_BASE = "https://image.tmdb.org/t/p/w1280";
const TMDB_TOKEN = import.meta.env.VITE_TMDB_TOKEN;

const authHeaders = {
    Authorization: `Bearer ${TMDB_TOKEN}`,
    "Content-Type": "application/json;charset=utf-8",
};

type ContentType = "movie" | "tv";

const MovieDetails: React.FC = () => {
    const { type, id } = useParams<{ type: ContentType; id: string }>();
    const navigate = useNavigate(); // Для повернення назад

    const [details, setDetails] = useState<any>(null);
    const [videos, setVideos] = useState<any[]>([]);
    const [similar, setSimilar] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Прокрутка вгору при зміні id
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    useEffect(() => {
        if (!id || !type) {
            setError("Неправильний URL");
            setLoading(false);
            return;
        }

        const fetchAll = async () => {
            try {
                setLoading(true);
                setError(null);

                // Деталі контенту
                const detailsRes = await fetch(
                    `${TMDB_API_URL}/${type}/${id}?language=uk-UA`,
                    { headers: authHeaders }
                );
                if (!detailsRes.ok) throw new Error("Details error");
                const detailsData = await detailsRes.json();
                setDetails(detailsData);

                // Відео (трейлери)
                const videosRes = await fetch(
                    `${TMDB_API_URL}/${type}/${id}/videos?language=uk-UA`,
                    { headers: authHeaders }
                );
                if (videosRes.ok) {
                    const videosData = await videosRes.json();
                    setVideos(
                        videosData.results.filter(
                            (v: any) =>
                                v.site === "YouTube" &&
                                ["Trailer", "Teaser", "Clip"].includes(v.type)
                        )
                    );
                }

                // Схожий контент
                const similarRes = await fetch(
                    `${TMDB_API_URL}/${type}/${id}/similar?language=uk-UA&page=1`,
                    { headers: authHeaders }
                );
                if (similarRes.ok) {
                    const similarData = await similarRes.json();
                    setSimilar(similarData.results.slice(0, 20));
                }
            } catch {
                setError("Контент не знайдено");
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, [type, id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-3xl text-gray-400">
                Завантаження...
            </div>
        );
    }

    if (error || !details) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-red-400 text-xl">
                {error || "Контент не знайдено"}
            </div>
        );
    }

    const title = details.title || details.name;
    const year = (details.release_date || details.first_air_date || "").slice(0, 4);

    return (
        <div className="min-h-screen bg-black text-white relative">
            {/* КНОПКА "НАЗАД" — тепер у потоці сторінки, не фіксована зверху */}
            <div className="absolute top-8 left-8 z-30"> {/* Контейнер для відступів */}
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex cursor-pointer items-center gap-3 bg-black/70 hover:bg-black/90 backdrop-blur-sm text-white px-6 py-3 rounded-full transition-all shadow-2xl border border-gray-800 hover:border-gray-600"
                >
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                    Назад
                </button>
            </div>

            {/* ФОНОВЕ ЗОБРАЖЕННЯ (BACKDROP) */}
            <div className="relative h-[70vh]">
                <img
                    src={`${TMDB_BACKDROP_BASE}${details.backdrop_path}`}
                    alt={title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
                <div className="absolute bottom-10 left-10 max-w-4xl">
                    <h1 className="text-5xl md:text-6xl font-black drop-shadow-2xl">
                        {title}
                    </h1>
                    <p className="text-xl md:text-2xl mt-4 text-gray-200">
                        ⭐ {details.vote_average.toFixed(1)} • {year}
                    </p>
                </div>
            </div>

            {/* ОСНОВНИЙ КОНТЕНТ */}
            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-20">
                    <img
                        src={`${TMDB_IMG_BASE}${details.poster_path}`}
                        alt={title}
                        className="rounded-3xl shadow-2xl w-full"
                    />
                    <div className="md:col-span-2 space-y-6">
                        <h2 className="text-3xl font-bold">Опис</h2>
                        <p className="text-gray-300 text-lg leading-relaxed">
                            {details.overview || "Опис відсутній."}
                        </p>
                    </div>
                </div>

                {/* ТРЕЙЛЕРИ */}
                {videos.length > 0 && (
                    <div className="mb-20">
                        <h2 className="text-4xl font-black mb-10 text-center">
                            Трейлери
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {videos.map((v) => (
                                <div key={v.key} className="aspect-video">
                                    <YouTube
                                        videoId={v.key}
                                        opts={{
                                            width: "100%",
                                            height: "100%",
                                            playerVars: {
                                                autoplay: 0,
                                            },
                                        }}
                                        className="w-full h-full"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* СХОЖІ ФІЛЬМИ/СЕРІАЛИ */}
                {similar.length > 0 && (
                    <div>
                        <h2 className="text-4xl font-black mb-10 text-center">
                            Схожі
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                            {similar.map((item) => (
                                <Link
                                    key={item.id}
                                    to={`/details/${type}/${item.id}`}
                                    className="block hover:scale-105 transition-transform duration-300"
                                >
                                    <img
                                        src={`${TMDB_IMG_BASE}${item.poster_path}`}
                                        alt={item.title || item.name}
                                        className="rounded-xl shadow-lg w-full"
                                    />
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MovieDetails;