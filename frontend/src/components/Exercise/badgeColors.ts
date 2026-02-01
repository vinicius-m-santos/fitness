/**
 * Mapeamento de cores para classes completas do Tailwind.
 * Usar strings completas evita que o purge do Tailwind remova as classes em produção,
 * já que classes dinâmicas como `bg-${color}-100` não são detectadas no build.
 */
export const BADGE_COLOR_CLASSES: Record<string, string> = {
  gray:
    "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
  blue:
    "bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-300",
  green:
    "bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-300",
  purple:
    "bg-purple-100 text-purple-800 dark:bg-purple-700 dark:text-purple-300",
  red:
    "bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-300",
  yellow:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-300",
  pink:
    "bg-pink-100 text-pink-800 dark:bg-pink-700 dark:text-pink-300",
  brown:
    "bg-amber-100 text-amber-800 dark:bg-amber-700 dark:text-amber-300",
  amber:
    "bg-amber-100 text-amber-800 dark:bg-amber-700 dark:text-amber-300",
  indigo:
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-700 dark:text-indigo-300",
  slate:
    "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300",
  cyan:
    "bg-cyan-100 text-cyan-800 dark:bg-cyan-700 dark:text-cyan-300",
  violet:
    "bg-violet-100 text-violet-800 dark:bg-violet-700 dark:text-violet-300",
  teal:
    "bg-teal-100 text-teal-800 dark:bg-teal-700 dark:text-teal-300",
  emerald:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-700 dark:text-emerald-300",
  sky:
    "bg-sky-100 text-sky-800 dark:bg-sky-700 dark:text-sky-300",
  orange:
    "bg-orange-100 text-orange-800 dark:bg-orange-700 dark:text-orange-300",
  fuchsia:
    "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-700 dark:text-fuchsia-300",
  rose:
    "bg-rose-100 text-rose-800 dark:bg-rose-700 dark:text-rose-300",
  zinc:
    "bg-zinc-100 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-300",
};

const DEFAULT_BADGE_CLASS = BADGE_COLOR_CLASSES.gray;

export function getBadgeClassName(color: string, extra = ""): string {
  const base = BADGE_COLOR_CLASSES[color] ?? DEFAULT_BADGE_CLASS;
  return `${base} ${extra}`.trim();
}
