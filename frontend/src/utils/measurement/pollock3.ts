export interface Pollock3Result {
  fatPercentage: number;
  fatMass: number;
  leanMass: number;
}

export function calculatePollock3Male(
  pectoral: number,
  abdominal: number,
  thigh: number,
  age: number,
  weightKg: number
): Pollock3Result {
  const skinfoldSum = pectoral + abdominal + thigh;
  const dc =
    1.10938 -
    0.0008267 * skinfoldSum +
    0.0000016 * skinfoldSum * skinfoldSum -
    0.0002574 * age;
  const fatPercentage = ((4.95 / dc) - 4.5) * 100;
  const fatMass = weightKg * (fatPercentage / 100);
  const leanMass = weightKg - fatMass;
  return {
    fatPercentage: Math.round(fatPercentage * 100) / 100,
    fatMass: Math.round(fatMass * 100) / 100,
    leanMass: Math.round(leanMass * 100) / 100,
  };
}

export function calculatePollock3Female(
  triceps: number,
  suprailiac: number,
  thigh: number,
  age: number,
  weightKg: number
): Pollock3Result {
  const skinfoldSum = triceps + suprailiac + thigh;
  const dc =
    1.0994921 -
    0.0009929 * skinfoldSum +
    0.0000023 * skinfoldSum * skinfoldSum -
    0.0001392 * age;
  const fatPercentage = ((4.95 / dc) - 4.5) * 100;
  const fatMass = weightKg * (fatPercentage / 100);
  const leanMass = weightKg - fatMass;
  return {
    fatPercentage: Math.round(fatPercentage * 100) / 100,
    fatMass: Math.round(fatMass * 100) / 100,
    leanMass: Math.round(leanMass * 100) / 100,
  };
}

export function getAgeForCalculation(
  birthDate: string | null | undefined
): number | null {
  if (!birthDate?.trim()) return null;
  const birth = new Date(birthDate.split("T")[0]);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birth.getDate())
  ) {
    age--;
  }
  return age >= 0 ? age : null;
}
