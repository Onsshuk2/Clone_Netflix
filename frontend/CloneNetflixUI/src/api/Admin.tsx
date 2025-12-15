// src/api/admin.ts
import api from "../api/Api"; // головне — використовуй глобальний api з токеном!

export const adminApi = {
  getAllUsers: async () => {
    const res = await api.get("/User/all");
    return Array.isArray(res.data) ? res.data : res.data?.data || [];
  },

  getUserById: (id: string) => api.get(`/User/by-id/${id}`),

  createUser: (data: any) => {
    const { email, displayName, password, profilePictureUrl } = data;
    const payload = {
      email: email.trim(),
      displayName: displayName.trim(),
      password,
      ...(profilePictureUrl &&
        profilePictureUrl.trim() && { profilePictureUrl }),
    };
    return api.post("/User/create", payload);
  },

  updateUser: (id: string, data: any) => {
    const { email, displayName, profilePictureUrl } = data;
    const payload = {
      ...(email && { email: email.trim() }),
      ...(displayName && { displayName: displayName.trim() }),
      ...(profilePictureUrl !== undefined && {
        profilePictureUrl: profilePictureUrl || null,
      }),
    };
    return api.put(`/User/update/${id}`, payload);
  },

  deleteUser: (id: string) => api.delete(`/User/delete/${id}`),
};
