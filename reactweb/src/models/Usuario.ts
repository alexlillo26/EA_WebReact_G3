export interface Usuario {
    id?: string; // Opcional, generado por el backend
    name: string;
    birthDate: Date;
    email: string;
    password: string;
  }