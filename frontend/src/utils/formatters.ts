
export function telegramHandle(link: string): string {
  return link.replace(/^https?:\/\/t\.me\//, '@').replace(/\/$/, '')
}

export function whatsAppNumber(link: string): string {
  const digits = link.replace(/^https?:\/\/(www\.)?wa\.me\//, '').replace(/\D/g, '')
  if (!digits) return link
  if (digits.length === 12 && digits.startsWith('992')) {
    return `+992 ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10, 12)}`
  }
  return `+${digits}`
}
