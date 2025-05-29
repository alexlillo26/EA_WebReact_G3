import axiosInstance from "./axiosInstance";
import { API_BASE_URL } from "./apiConfig";

// Seguir a un usuario (el backend toma el follower del token)
export const followUser = (userId: string) => {
  return axiosInstance.post(`${API_BASE_URL}/followers/follow/${userId}`);
};

// Obtener la lista de followers de un usuario
export const getFollowers = (userId: string) =>
  axiosInstance
    .get<{
      success: boolean;
      followers: { follower: { _id: string } }[];
    }>(`${API_BASE_URL}/followers/${userId}`)
    .then(res => res.data);

// Dejar de seguir a un usuario
export const unfollowUser = (userId: string) =>
  axiosInstance.delete(`${API_BASE_URL}/followers/follow/${userId}`);
