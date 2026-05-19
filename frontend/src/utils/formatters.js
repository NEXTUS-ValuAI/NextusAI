export function num(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "-"
  return Number(value).toFixed(2)
}

export function money(value, currency) {
  if (value === null || value === undefined || Number.isNaN(value)) return "-"
  return `${Number(value).toFixed(2)} ${currency || ""}`
}

export function percent(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "-"
  return `%${Number(value).toFixed(1)}`
}

export function big(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "-"

  const n = Number(value)

  if (Math.abs(n) >= 1_000_000_000) {
    return `${(n / 1_000_000_000).toFixed(2)} B`
  }

  if (Math.abs(n) >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(2)} M`
  }

  return n.toFixed(2)
}
