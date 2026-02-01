/**
 * Calcula a idade em anos a partir de uma data de nascimento.
 * @param birthDate - Data no formato ISO (yyyy-mm-dd) ou string parseável
 * @returns Idade em anos ou null se a data for inválida
 */
export function calculateAgeFromBirthDate(
  birthDate: string | null | undefined
): number | null {
  if (!birthDate?.trim()) return null;
  const birth = new Date(birthDate.split("T")[0]);
  if (isNaN(birth.getTime())) return null;
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
