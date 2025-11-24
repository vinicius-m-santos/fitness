import {
  BloodPressureKey,
  ObjectiveKey,
} from "@/utils/constants/Client/constants";
import { AnamneseClientAll } from "@/types/anamnese";
import { Personal } from "@/types/personal";

type ClientTag = {
  id: string;
  label: string;
};

type ClientTags = ClientTag[];

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
  bloodPressure: BloodPressureKey;
  objective: ObjectiveKey;
  workoutDaysPerWeek: number;
  observation: string;
  createdAt: string;
  personal?: Personal;
  anamnese?: AnamneseClientAll;
  tags: ClientTags;
};
