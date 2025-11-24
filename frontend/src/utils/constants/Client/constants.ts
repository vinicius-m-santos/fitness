export const OBJECTIVES = {
  1: "Ganho de Massa",
  2: "Emagrecimento",
  3: "Condicionamento",
};

export type ObjectiveKey = keyof typeof OBJECTIVES;

export const GENDERS = {
  M: "Masculino",
  F: "Feminino",
};

export const UPLOAD_PROFILE_PHOTO_MAX_FILE_SIZE = 5 * Math.pow(10, 6);

export const CLIENT_TAGS = [
  {
    id: "iniciante",
    label: "Iniciante",
  },
  {
    id: "avancado",
    label: "Avançado",
  },
  {
    id: "lesao",
    label: "Lesão",
  },
  {
    id: "alta_performance",
    label: "Alta Performance",
  },
  {
    id: "emagrecimento",
    label: "Emagrecimento",
  },
  {
    id: "condicionamento",
    label: "Condicionamento",
  },
];

export const BLOOD_PRESSURE = {
  1: "Nenhum",
  2: "Hipertensão",
  3: "Hipotensão",
};

export type BloodPressureKey = keyof typeof BLOOD_PRESSURE;
