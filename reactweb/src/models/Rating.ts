export interface Rating {
  _id?: string;
  combat: string;
  from: string;
  to: string;
  punctuality: number;
  attitude: number;
  intensity: number;
  sportmanship: number;
  technique: number;
  comment?: string;
  createdAt?: string;
}