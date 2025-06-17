export interface Gym {
    _id?: string; // Opcional, generado por el backend
    name: string;
    email: string;
    phone: string;
    place: string;
    price: number;
    password: string; 
    photos?: string[]; 
    mainPhoto?: string; 
    isHidden?: boolean; // <-- Añadido para filtrar gimnasios ocultos
  }