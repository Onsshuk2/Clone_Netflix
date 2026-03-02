// src/api/tmdbGenres.ts

const TMDB_API_URL = import.meta.env.VITE_TMDB_API_URL;
const TMDB_TOKEN = import.meta.env.VITE_TMDB_TOKEN;

const authHeaders = {
    Authorization: `Bearer ${TMDB_TOKEN}`,
    "Content-Type": "application/json;charset=utf-8",
};

export interface Genre {
    id: number;
    name: string;
}

export const fetchGenres = async (language: string): Promise<Genre[]> => {
    const res = await fetch(
        `${TMDB_API_URL}/genre/movie/list?language=${language}`,
        { headers: authHeaders }
    );
    if (!res.ok) throw new Error("Genre fetch failed");
    const data = await res.json();
    return data.genres || [];
};

export const fetchTvGenres = async (language: string): Promise<Genre[]> => {
    const res = await fetch(
        `${TMDB_API_URL}/genre/tv/list?language=${language}`,
        { headers: authHeaders }
    );
    if (!res.ok) throw new Error("TV Genre fetch failed");
    const data = await res.json();
    return data.genres || [];
};
