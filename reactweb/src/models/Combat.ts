export interface Boxer {
  _id?: string;
  name?: string;
  [key: string]: any;
}

export interface Gym {
  _id?: string;
  name?: string;
  [key: string]: any;
}

export interface Combat {
  _id?: string;
  creator: string; // id del usuario que crea la invitación
  opponent: string; // id del usuario invitado
  date: Date | string;
  time: string;
  level: string;
  gym: string; // id del gimnasio
  status: 'pending' | 'accepted' | 'rejected';
  createdAt?: Date | string;
  updatedAt?: Date | string;
  boxers?: (string | Boxer)[];
  image?: string;
  // ...otros campos opcionales...
}