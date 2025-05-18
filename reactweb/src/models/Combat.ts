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
  id?: string;
  date: Date;
  time: string;
  level: string;
  gym: string | Gym;
  boxers: (string | Boxer)[];
  isHidden?: boolean;
}