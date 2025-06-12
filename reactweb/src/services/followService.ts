import axiosInstance from "./axiosInstance";
import { API_BASE_URL } from "./apiConfig";

export interface UserMini {
  _id: string;
  name: string;
  username?: string;
}

export interface FollowerDoc {
  _id: string;
  follower: UserMini;
  following: UserMini;
}

export interface FollowCounts {
  followers: number;
  following: number;
}

// Seguir a un usuario (idempotente)
export const followUser = (userId: string) =>
  axiosInstance.post(`${API_BASE_URL}/followers/follow/${userId}`);

// Obtener la lista de followers de un usuario (poblado)
export const getFollowers = (userId: string) =>
  axiosInstance.get<{ success: boolean; followers: FollowerDoc[] }>(
    `${API_BASE_URL}/followers/${userId}`
  );

// Obtener la lista de usuarios a los que sigue userId (poblado)
export const getFollowing = (userId: string) =>
  axiosInstance.get<{ success: boolean; following: FollowerDoc[] }>(
    `${API_BASE_URL}/followers/following/${userId}`
  );

// Obtener contadores de siguiendo/seguidores
export const getFollowCounts = (userId: string) =>
  axiosInstance.get<FollowCounts>(`${API_BASE_URL}/followers/count/${userId}`);

// Dejar de seguir a un usuario
export const unfollowUser = (userId: string) =>
  axiosInstance.delete(`${API_BASE_URL}/followers/unfollow/${userId}`);

// Eliminar seguidor
export const removeFollower = (followerId: string) =>
  axiosInstance.delete(`${API_BASE_URL}/followers/remove/${followerId}`);
