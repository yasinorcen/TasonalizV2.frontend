/**
 * Formatting helpers for Turkish numbers, currency, percentages, and dates.
 */

export function formatCurrency(
  value: number | null | undefined,
  currency: string = 'TRY',
  fractionDigits: number = 2
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 'Veri Yok'
  }
  const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '₺'
  return `${ new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value)} ${symbol}`
}

export function formatCompactNumber(
  value: number | null | undefined,
  currency: string = ''
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 'Veri Yok'
  }
  const abs = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  const suffix = currency ? ` ${currency}` : ''

  if (abs >= 1_000_000_000) {
    return `${sign}${(abs / 1_000_000_000).toLocaleString('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} Mrd${suffix}`
  }
  if (abs >= 1_000_000) {
    return `${sign}${(abs / 1_000_000).toLocaleString('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} Mn${suffix}`
  }
  return `${ value.toLocaleString('tr-TR', {
    maximumFractionDigits: 2,
  })}${suffix}`
}

export function formatFullAccounting(
  value: number | null | undefined,
  currency: string = 'TRY'
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '— (Veri Yok)'
  }
  return `${new Intl.NumberFormat('tr-TR', {
    maximumFractionDigits: 0,
  }).format(value)} ${currency}`
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '—'
  }
  const sign = value > 0 ? '+' : ''
  return `%${sign}${value.toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function formatDateTime(isoString: string | null | undefined): string {
  if (!isoString) return 'Belirtilmedi'
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return isoString
  return new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}
