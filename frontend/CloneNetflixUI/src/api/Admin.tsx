// src/api/Admin.ts
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // або import.meta.env.VITE_API_URL
  headers: {
    Accept: "application/json",
  },
});

// Автоматичне додавання токена + логування запитів
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Для FormData НЕ встановлюємо Content-Type вручну — axios сам додасть boundary
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    console.log(`→ ${config.method?.toUpperCase()} ${config.url}`);
    if (config.data instanceof FormData) {
      for (const [key, value] of config.data.entries()) {
        console.log(`  ${key}:`, value instanceof File ? `${value.name} (${value.size} байт)` : value);
      }
    } else {
      console.log("  body:", config.data);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    console.log(`← ${response.status} ${response.config.url}`);
    console.log("  data:", response.data);
    return response;
  },
  (error) => {
    console.error(`← ERROR ${error.response?.status || "???"} ${error.config?.url}`);
    console.error("  message:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const adminApi = {
  // GET /api/users/admin/get-all
  getAllUsers: async (): Promise<any[]> => {
    const res = await api.get("/users/admin/get-all");
    // Якщо приходить текст — намагаємось парсити
    if (typeof res.data === "string") {
      try {
        return JSON.parse(res.data);
      } catch {
        return [];
      }
    }
    return res.data || [];
  },

  // GET /api/users/admin/get-user/{id}
  getUserById: async (id: string): Promise<any> => {
    const res = await api.get(`/users/admin/get-user/${id}`);
    let data = res.data;
    if (typeof data === "string") {
      try {
        data = JSON.parse(data);
      } catch { }
    }
    return data;
  },

  // POST /api/users/admin/create (multipart/form-data)
  createUser: async (form: {
    Username: string;
    Email: string;
    Password: string;
    ConfirmPassword: string;
    DateOfBirth?: string; // "yyyy-MM-dd"
    Image?: File | null;
    Roles?: string[];     // ["User"], ["Admin", "Moderator"] тощо
    PlanId?: string;
  }) => {
    const formData = new FormData();
    formData.append("Username", form.Username);
    formData.append("Email", form.Email);
    formData.append("Password", form.Password);
    formData.append("ConfirmPassword", form.ConfirmPassword);

    if (form.DateOfBirth) {
      formData.append("DateOfBirth", form.DateOfBirth);
    }
    if (form.Image) {
      formData.append("Image", form.Image);
    }
    if (form.Roles && form.Roles.length > 0) {
      form.Roles.forEach(role => formData.append("Roles", role));
    }
    if (form.PlanId) {
      formData.append("PlanId", form.PlanId);
    }

    const res = await api.post("/users/admin/create", formData);
    return res.data;
  },

  // PUT /api/users/admin/update/{id} (multipart/form-data)
  updateUser: async (
    id: string,
    form: {
      Id?: string; // можна передати ще раз, якщо бекенд вимагає
      Username?: string;
      Email?: string;
      DateOfBirth?: string;
      Image?: File | null;
      Roles?: string[];
      PlanId?: string;
    }
  ) => {
    const formData = new FormData();
    formData.append("Id", id); // на всяк випадок

    if (form.Username) formData.append("Username", form.Username);
    if (form.Email) formData.append("Email", form.Email);
    if (form.DateOfBirth) formData.append("DateOfBirth", form.DateOfBirth);
    if (form.Image) formData.append("Image", form.Image);
    if (form.Roles) {
      form.Roles.forEach(role => formData.append("Roles", role));
    }
    if (form.PlanId) formData.append("PlanId", form.PlanId);

    const res = await api.put(`/users/admin/update/${id}`, formData);
    return res.data;
  },

  // DELETE /api/users/admin/delete/{id}
  deleteUser: async (id: string) => {
    const res = await api.delete(`/users/admin/delete/${id}`);
    return res.data;
  },
};