// Asegúrate que este archivo se llame Combat.ts y esté en la carpeta src/models/

// import { Types } from 'mongoose'; // Solo si usas tipos de Mongoose directamente, sino string está bien para IDs

// Interfaz para el objeto Gym que esperas del backend
export interface GymDetails { // <-- ¿Está exportada?
  _id: string;
  name: string;
  location?: string;
}

// Interfaz para el objeto Opponent que esperas del backend
export interface OpponentDetails { // <-- ¿Está exportada?
  id?: string;
  username: string;
  profileImage?: string;
}

// Interfaz para un registro individual en el historial de combates
// (Esta es una de las que da error si no se exporta o no existe)
export interface CombatHistoryEntry { // <-- ¡ASEGÚRATE QUE ESTÉ EXPORTADA!
  _id: string;
  date: string;
  time: string;
  level?: string;
  gym: GymDetails | null;
  opponent: OpponentDetails | null;
  result: 'Victoria' | 'Derrota' | 'Empate';
  status: 'completed';
}

// Interfaz para la estructura completa de la respuesta de la API de historial
// (Esta es la otra que da error si no se exporta o no existe)
export interface CombatHistoryApiResponse { // <-- ¡ASEGÚRATE QUE ESTÉ EXPORTADA!
  message: string;
  data: {
    combats: CombatHistoryEntry[];
    totalCombats: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}

// Tu interfaz Combat original, si la mantienes y es diferente, también debería estar aquí
export interface Combat { // Esta es la que tus otras funciones de servicio ya usan
  _id?: string;
  creator: string;
  opponent: string; // ID del oponente (diferente a OpponentDetails)
  date: Date | string;
  time: string;
  level: string;
  gym: string; // ID del gym (diferente a GymDetails)
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'active' | 'cancelled'; // Asegúrate que este enum esté completo
  createdAt?: Date | string;
  updatedAt?: Date | string;
  // ... otros campos si los tienes de antes
}