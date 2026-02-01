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

type ClientUser = {
  email: string;
  phone: string | null;
  avatarKey: string | null;
  avatarUrl: string | null;
  birthDate?: string | null;
};

export type Client = {
  id: number;
  name: string;
  lastName: string;
  user?: ClientUser;
  gender: string;
  age?: number | null;
  weight: number;
  height: number;
  bloodPressure: string;
  objective: number;
  workoutDaysPerWeek: number;
  observation: string;
  createdAt: string;
  hasRegistered?: boolean;
};

export type ClientAllData = {
  id: number;
  name: string;
  lastName: string;
  user?: ClientUser;
  gender: string;
  age?: number | null;
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
  hasRegistered?: boolean;
};
