// src/services/api.js
const BaseApi = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BASE_URL = BaseApi + "/api"

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: { ...getHeaders(), ...options.headers },
  });

  if (!response.ok) {
    let errorMessage = response.statusText;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch { }
    throw new Error(errorMessage);
  }

  if (response.status === 204) return null;
  return response.json();
}

export const ApiAdminFilms = {

  // ────────────────────────────────────────────────
  // Collections
  // ────────────────────────────────────────────────
  collections: {
    getAll: () => apiRequest('/collections/get-all'),
    getById: (id) => apiRequest(`/collections/get/${id}`),
    create: (data) => apiRequest('/collections/create', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiRequest(`/collections/update/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiRequest(`/collections/delete/${id}`, { method: 'DELETE' }),
  },

  // ────────────────────────────────────────────────
  // Contents (фільми / серіали)
  // ────────────────────────────────────────────────
  contents: {
    create: (data) => apiRequest('/contents/create', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id) => apiRequest(`/contents/delete/${id}`, { method: 'DELETE' }),
    update: (id, data) => apiRequest(`/contents/update/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    getAll: () => apiRequest('/contents/get'),
    getById: (id) => apiRequest(`/contents/get-details/${id}`),
  },

  // ────────────────────────────────────────────────
  // Episodes
  // ────────────────────────────────────────────────
  episodes: {
    addToContent: (contentId, data) => apiRequest(`/episodes/add/${contentId}`, { method: 'POST', body: JSON.stringify(data) }),
    delete: (id) => apiRequest(`/episodes/delete/${id}`, { method: 'DELETE' }),
    update: (id, data) => apiRequest(`/episodes/update/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    getByContent: (contentId) => apiRequest(`/episodes/get-episodes/content-id/${contentId}`),
    getById: (id) => apiRequest(`/episodes/get/${id}`),
  },

  // ────────────────────────────────────────────────
  // Franchises
  // ────────────────────────────────────────────────
  franchises: {
    getAll: () => apiRequest('/franchises/get-all'),
    getById: (id) => apiRequest(`/franchises/get/${id}`),
    create: (data) => apiRequest('/franchises/create', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiRequest(`/franchises/update/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiRequest(`/franchises/delete/${id}`, { method: 'DELETE' }),
  },

  // ────────────────────────────────────────────────
  // Genres
  // ────────────────────────────────────────────────
  genres: {
    getAll: () => apiRequest('/genres/get-all'),
    getById: (id) => apiRequest(`/genres/get/${id}`),
    create: (data) => apiRequest('/genres/create', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiRequest(`/genres/update/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiRequest(`/genres/delete/${id}`, { method: 'DELETE' }),
  },
};