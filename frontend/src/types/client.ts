import { AnamneseClientAll } from "./anamnese";
import { Personal } from "./personal";

export type Client = {
  id: number;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  age: number;
  weight: number;
  height: number;
  bloodPressure: string;
  objective: number;
  workoutDaysPerWeek: number;
  observation: string;
  createdAt: string;
};

export type ClientAllData = {
  id: number;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  age: number;
  weight: number;
  height: number;
  bloodPressure: string;
  objective: number;
  workoutDaysPerWeek: number;
  observation: string;
  createdAt: string;
  personal?: Personal;
  anamnese?: AnamneseClientAll;
};
