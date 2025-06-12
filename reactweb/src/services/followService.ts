import axiosInstance from "./axiosInstance";
import { API_BASE_URL } from "./apiConfig";

export interface UserMini {
  _id: string;
  name: string;
  username: string;
}

export interface FollowerItem {
  _id: string;
  follower: UserMini;
}

export interface FollowingItem {
  _id: string;
  following: UserMini;
}

export interface FollowCounts {
  followers: number;
  following: number;
}

// Seguir a un usuario
export const followUser = (userId: string) =>
  axiosInstance.post(
    `${API_BASE_URL}/api/followers/follow/${userId}`
  );

// Dejar de seguir
export const unfollowUser = (userId: string) =>
  axiosInstance.delete(
    `${API_BASE_URL}/api/followers/unfollow/${userId}`
  );

// Obtener quién te sigue
export const getFollowers = (userId: string) =>
  axiosInstance.get<{ success: boolean; followers: FollowerItem[] }>(
    `${API_BASE_URL}/api/followers/${userId}`
  );

// Obtener a quién sigues
export const getFollowing = (userId: string) =>
  axiosInstance.get<{ success: boolean; following: FollowingItem[] }>(
    `${API_BASE_URL}/api/followers/following/${userId}`
  );

// Contadores
export const getFollowCounts = (userId: string) =>
  axiosInstance.get<FollowCounts>(
    `${API_BASE_URL}/api/followers/count/${userId}`
  );

// Eliminar seguidor
export const removeFollower = (followerId: string) =>
  axiosInstance.delete(
    `${API_BASE_URL}/api/followers/remove/${followerId}`
  );

// Añadir: Guardar la suscripción push en el backend con la ruta correcta
export const storePushSubscription = (subscription: PushSubscription) =>
  axiosInstance.post(
    `${API_BASE_URL}/api/followers/save-subscription`,
    { subscription },
    { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
  );

// Comprueba si currentUser sigue al userId
export const checkFollowUser = (userId: string) =>
  axiosInstance.get<{ following: boolean }>(
    `${API_BASE_URL}/api/followers/check/${userId}`
  );

// No hay función explícita aquí, pero el endpoint se usa en App.tsx para enviar la suscripción push.
