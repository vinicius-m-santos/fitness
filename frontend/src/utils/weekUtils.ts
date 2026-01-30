import { format, getISOWeek, parseISO, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Returns Monday of the week for a given date (week starts Monday).
 */
export function getMondayOfWeek(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 });
}

/**
 * ISO week number (1-53).
 */
export function getWeekNumber(date: Date): number {
  return getISOWeek(date);
}

/**
 * Format as "Semana 22 (27 jan – 2 fev)".
 */
export function formatWeekLabel(monday: Date): string {
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  const startStr = format(monday, "d MMM", { locale: ptBR });
  const endStr = format(sunday, "d MMM", { locale: ptBR });
  const weekNum = getWeekNumber(monday);
  return `Semana ${weekNum} (${startStr} – ${endStr})`;
}

/**
 * Get Monday of current week as YYYY-MM-DD.
 */
export function getCurrentWeekStart(): string {
  const monday = getMondayOfWeek(new Date());
  return format(monday, "yyyy-MM-dd");
}

/**
 * Get list of week start dates for selector (current week + previous N weeks).
 */
export function getWeekOptions(count: number = 12): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  let d = getMondayOfWeek(new Date());
  for (let i = 0; i < count; i++) {
    options.push({
      value: format(d, "yyyy-MM-dd"),
      label: formatWeekLabel(d),
    });
    d = new Date(d);
    d.setDate(d.getDate() - 7);
  }
  return options;
}
