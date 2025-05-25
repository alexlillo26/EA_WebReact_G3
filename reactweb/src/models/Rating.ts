export interface Rating {
  _id?: string;
  combat: string;
  from: string;
  to: string;
  score: number; // 1 to 5 stars
  comment?: string;
  createdAt?: string;
}