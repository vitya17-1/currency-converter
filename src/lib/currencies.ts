import type { CurrencyMeta } from '../types'

let cache: Record<string, CurrencyMeta> | null = null

export async function loadCurrencies(): Promise<Record<string, CurrencyMeta>> {
  if (cache) return cache
  try {
    const res = await fetch('/currencies.json')
    if (!res.ok) throw new Error('Failed to load currencies')
    const arr = (await res.json()) as CurrencyMeta[]
    const map: Record<string, CurrencyMeta> = {}
    for (const c of arr) {
      map[c.code] = c
    }
    cache = map
    return map
  } catch {
    cache = {}
    return {}
  }
}

export function getDisplayLabel(code: string, map?: Record<string, CurrencyMeta>): string {
  const meta = map?.[code]
  if (!meta) return code
  return `${meta.symbol || ''} ${code} — ${meta.name}`.trim()
}

