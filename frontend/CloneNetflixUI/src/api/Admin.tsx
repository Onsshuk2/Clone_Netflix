// src/api/admin.ts
import axios from "axios";

// Використовуємо ТІЛЬКИ ОДИН глобальний api з токеном (з твого src/api/api.ts)
// import Api from "../api/Api"; // ← ЦЕ САМЕ ГОЛОВНЕ!

// Якщо дуже хочеш окремий інстанс — то хоча б з правильною базою і токеном:
const adminApiInstance = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/User`,
});

// Додаємо токен (обов’язково!)
adminApiInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const adminApi = {
  // Повертаємо ТІЛЬКИ МАСИВ користувачів (це найголовніше!)
  getAllUsers: async () => {
    const res = await adminApiInstance.get("/all");
    // Твій бекенд може повертати або масив, або { data: [...] }
    const raw = res.data;
    return Array.isArray(raw) ? raw : raw?.data || raw?.users || [];
  },

  getUserById: async (id: string | number) => {
    const res = await adminApiInstance.get(`/by-id/${id}`);
    return res.data?.data || res.data;
  },

  createUser: (data: any) => adminApiInstance.post("/create", data),

  updateUser: (id: string | number, data: any) =>
    adminApiInstance.put(`/update/${id}`, data),

  deleteUser: (id: string | number) => adminApiInstance.delete(`/delete/${id}`),
};
