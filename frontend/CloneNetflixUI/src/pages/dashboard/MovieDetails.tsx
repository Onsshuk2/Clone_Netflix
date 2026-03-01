// src/pages/dashboard/MovieDetails.tsx
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import YouTube from "react-youtube";

import { useLanguage } from "../../contexts/LanguageContext";

import { useWatchHistory } from "../../lib/useWatchHistory";
import {
    fetchContentDetails,
    fetchContentVideos,
    fetchSimilarContent,
} from "../../api/tmdbDashboard";
import { GradientLoader } from "../../components/Loader";
import CommentsSection from '../../components/CommentsSection';

const TMDB_IMG_BASE = import.meta.env.VITE_TMDB_IMG_BASE;
const TMDB_BACKDROP_BASE = "https://image.tmdb.org/t/p/w1280";

type ContentType = "movie" | "tv";

const MovieDetails: React.FC = () => {
    const { type, id } = useParams<{ type: ContentType; id: string }>();
    const navigate = useNavigate();
    const { t, getTMDBLanguage } = useLanguage();

    const [details, setDetails] = useState<any>(null);
    const [videos, setVideos] = useState<any[]>([]);
    const [similar, setSimilar] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const language = getTMDBLanguage();

    const { addToHistory } = useWatchHistory();

    // DEMO: currentUser (замініть на реального користувача з контексту)
    const currentUser = localStorage.getItem('username') || null;
    // DEMO: comments (можна замінити на API)
    const [comments, setComments] = useState<any[]>(() => {
        const saved = localStorage.getItem(`comments_${id}`);
        return saved ? JSON.parse(saved) : [];
    });
    
    const handleEditComment = (edited: any) => {
        const updated = comments.map(c => c.id === edited.id ? edited : c);
        setComments(updated);
        localStorage.setItem(`comments_${id}`, JSON.stringify(updated));
    };
    
    const handleDeleteComment = (commentId: number) => {
        const updated = comments.filter(c => c.id !== commentId);
        setComments(updated);
        localStorage.setItem(`comments_${id}`, JSON.stringify(updated));
    };
    const handleAddComment = (comment: any) => {
        const updated = [comment, ...comments];
        setComments(updated);
        localStorage.setItem(`comments_${id}`, JSON.stringify(updated));
    };


    // Прокрутка вгору при зміні id
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    useEffect(() => {
        if (!id || !type) {
            setError(t("details.invalid_url"));
            setLoading(false);
            return;
        }

        const fetchAll = async () => {
            try {
                setLoading(true);
                setError(null);

                // Деталі
                const detailsData = await fetchContentDetails(type, id, language);
                setDetails(detailsData);

                // Додаємо в історію переглядів
                try {
                    addToHistory({ id: detailsData.id, type: type, poster_path: detailsData.poster_path || null });
                } catch (err) {
                    // nothing
                }

                // Відео
                const videosData = await fetchContentVideos(type, id, language);
                setVideos(videosData);

                // Схожі
                const similarData = await fetchSimilarContent(type, id, language);
                setSimilar(similarData);
            } catch (err) {
                console.error(err);
                setError(t("details.not_found"));
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, [type, id, language, t]); // залежність від мови!

    if (loading) {
        return (
            <GradientLoader />
        );
    }

    if (error || !details) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-red-400 text-xl">
                {error || t("details.not_found")}
            </div>
        );
    }

    const title = details.title || details.name || t("details.unknown_title");
    const year = (details.release_date || details.first_air_date || "").slice(0, 4) || t("common.unknown");

    return (
        <div className="min-h-screen bg-black text-white relative">
            {/* Кнопка Назад */}
            <div className="absolute top-8 left-8 z-30">
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-3 bg-black/70 hover:bg-black/90 backdrop-blur-sm text-white px-6 py-3 rounded-full transition-all shadow-2xl border border-gray-800 hover:border-gray-600"
                >
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    {t("common.back")}
                </button>
            </div>

            {/* Фон (backdrop) */}
            <div className="relative h-[70vh]">
                {details.backdrop_path ? (
                    <img
                        src={`${TMDB_BACKDROP_BASE}${details.backdrop_path}`}
                        alt={title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500">
                        {t("details.no_backdrop")}
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
                <div className="absolute bottom-10 left-10 max-w-4xl">
                    <h1 className="text-5xl md:text-6xl font-black drop-shadow-2xl">{title}</h1>
                    <p className="text-xl md:text-2xl mt-4 text-gray-200">
                        ⭐ {details.vote_average?.toFixed(1) || "—"} • {year}
                    </p>
                </div>
            </div>

            {/* Основний контент */}
            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-20">
                    {details.poster_path ? (
                        <img
                            src={`${TMDB_IMG_BASE}${details.poster_path}`}
                            alt={title}
                            className="rounded-3xl shadow-2xl w-full"
                        />
                    ) : (
                        <div className="w-full aspect-[2/3] bg-gray-800 rounded-3xl flex items-center justify-center text-gray-500">
                            {t("common.poster_missing")}
                        </div>
                    )}

                    <div className="md:col-span-2 space-y-6">
                        <h2 className="text-3xl font-bold">{t("details.overview")}</h2>
                        <p className="text-gray-300 text-lg leading-relaxed">
                            {details.overview || t("details.no_overview")}
                        </p>
                    </div>
                </div>

                {/* Трейлери */}
                {videos.length > 0 && (
                    <div className="mb-20">
                        <h2 className="text-4xl font-black mb-10 text-center">{t("details.trailers")}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {videos.map((v) => (
                                <div key={v.key} className="aspect-video">
                                    <YouTube
                                        videoId={v.key}
                                        opts={{
                                            width: "100%",
                                            height: "100%",
                                            playerVars: { autoplay: 0 },
                                        }}
                                        className="w-full h-full"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Схожі */}
                {similar.length > 0 && (
                    <div>
                        <h2 className="text-4xl font-black mb-10 text-center">{t("details.similar")}</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                            {similar.map((item) => {
                                const itemTitle = item.title || item.name || t("details.unknown_title");
                                const itemType = type; // або можна визначати динамічно, якщо потрібно

                                return (
                                    <Link
                                        key={item.id}
                                        to={`/details/${itemType}/${item.id}`}
                                        className="block hover:scale-105 transition-transform duration-300"
                                    >
                                        <img
                                            src={`${TMDB_IMG_BASE}${item.poster_path}`}
                                            alt={itemTitle}
                                            className="rounded-xl shadow-lg w-full"
                                        />
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}
            {/* Comments Section */}
            <CommentsSection
                comments={comments}
                currentUser={currentUser || undefined}
                onAddComment={handleAddComment}
                onEditComment={handleEditComment}
                onDeleteComment={handleDeleteComment}
            />
            </div>
        </div>
    );
};

export default MovieDetails;