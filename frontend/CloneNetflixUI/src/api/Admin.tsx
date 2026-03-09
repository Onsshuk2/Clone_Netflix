// src/api/Admin.ts
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    Accept: "application/json",
  },
});

// Інтерсептори (залишаємо майже без змін, вони корисні)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // НЕ встановлюємо Content-Type для FormData — axios сам додасть правильний boundary
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    // Логування (можна залишити для дебагу, або закоментувати в продакшені)
    console.log(`→ ${config.method?.toUpperCase()} ${config.url}`);
    if (config.data instanceof FormData) {
      for (const [key, value] of config.data.entries()) {
        console.log(
          `  ${key.padEnd(16)}:`,
          value instanceof File
            ? `${value.name} (${(value.size / 1024).toFixed(1)} KB)`
            : value
        );
      }
    } else if (config.data) {
      console.log("  body:", config.data);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      `← ERROR ${error.response?.status || "???"} ${error.config?.url}`
    );
    console.error("  message:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Окремий об'єкт з методами для адмінки користувачів
export const adminUsersApi = {
  // Отримати всіх користувачів
  getAll: async (): Promise<any[]> => {
    try {
      const res = await api.get("/users/admin/get-all");
      let data = res.data;
      if (typeof data === "string") {
        data = JSON.parse(data);
      }
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error("Помилка getAll users:", err);
      throw err;
    }
  },

  // Отримати одного користувача
  getById: async (id: string): Promise<any> => {
    try {
      const res = await api.get(`/users/admin/get-user/${id}`);
      let data = res.data;
      if (typeof data === "string") {
        data = JSON.parse(data);
      }
      return data;
    } catch (err) {
      console.error(`Помилка getById ${id}:`, err);
      throw err;
    }
  },

  // Створити користувача (повна форма)
  create: async (data: {
    userName: string;
    email: string;
    password: string;
    confirmPassword: string;
    dateOfBirth?: string;
    roles?: string[];
    avatar?: File | null;
    planId?: string;
  }) => {
    const fd = new FormData();
    fd.append("userName", data.userName);
    fd.append("email", data.email);
    fd.append("password", data.password);
    fd.append("confirmPassword", data.confirmPassword);

    if (data.dateOfBirth) fd.append("dateOfBirth", data.dateOfBirth);
    if (data.avatar) fd.append("avatar", data.avatar);          // ← ключ "avatar", а не "Image"
    if (data.roles?.length) {
      data.roles.forEach((role) => fd.append("roles", role));
    }
    if (data.planId) fd.append("planId", data.planId);

    return api.post("/users/admin/create", fd);
  },

  // Оновити користувача (підтримка часткового оновлення)
  update: async (
    id: string,
    data: {
      userName?: string;
      email?: string;
      dateOfBirth?: string;
      avatar?: File | null;
      roles?: string[];
      planId?: string;
      isBlocked?: boolean;
    }
  ) => {
    const fd = new FormData();

    // Додаємо тільки ті поля, які передані (бекенд повинен підтримувати часткове оновлення)
    if (data.userName !== undefined) fd.append("userName", data.userName);
    if (data.email !== undefined) fd.append("email", data.email);
    if (data.dateOfBirth !== undefined) fd.append("dateOfBirth", data.dateOfBirth);
    if (data.avatar !== undefined && data.avatar) fd.append("avatar", data.avatar);
    if (data.roles !== undefined) {
      // Якщо передаємо масив — очищаємо попередні ролі та додаємо нові
      data.roles.forEach((role) => fd.append("roles", role));
    }
    if (data.planId !== undefined) fd.append("planId", data.planId);
    if (data.isBlocked !== undefined) {
      fd.append("isBlocked", data.isBlocked.toString());
    }

    // Якщо жодного поля не передано — можна кинути помилку або повернути порожній проміс
    if (fd.entries().next().done) {
      throw new Error("Немає даних для оновлення");
    }

    return api.put(`/users/admin/update/${id}`, fd);
  },

  // Видалити користувача
  delete: async (id: string) => {
    return api.delete(`/users/admin/delete/${id}`);
  },

  // Окремий метод для зміни тільки статусу блокування (зручніше використовувати)
  toggleBlock: async (id: string, isBlocked: boolean) => {
    return adminUsersApi.update(id, { isBlocked });
  },
};