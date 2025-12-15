// src/api/user.ts
import api from "./Api";
import { toast } from "react-hot-toast";

// Типи відповідей від бекенду
interface UpdateProfileRequest {
  displayName: string;
  profilePictureUrl?: string | null;
}

interface UpdateProfileResponse {
  profilePictureUrl?: string;
  // інші поля, якщо бек повертає
}

// Оновлення профілю (і ім'я, і аватар)
export const updateMyProfile = async (
  data: UpdateProfileRequest
): Promise<UpdateProfileResponse> => {
  try {
    const response = await api.put("/User/update-my-profile", data);
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Не вдалося оновити профіль";
    toast.error(message);
    throw new Error(message);
  }
};
