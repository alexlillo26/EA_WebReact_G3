export interface Combat {
    id?: string; // Opcional, generado por el backend
    date: string; // Fecha del combate
    gym: string; // ID del gimnasio
    boxers: string[]; // IDs de los boxeadores
  }