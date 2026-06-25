// Formats a TJS amount the Russian way, e.g. 398610 -> "398 610 сомони".
export function formatMoney(value: number): string {
  return `${Math.round(value).toLocaleString('ru-RU')} сомони`
}
