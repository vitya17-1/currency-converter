import type { CachedRates, RatesResponse } from '../types'

const STORAGE_KEY = 'cc_cached_rates_v1'
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

function readCache(): CachedRates | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CachedRates
    if (!parsed || !parsed.payload || !parsed.payload.rates) return null
    return parsed
  } catch {
    return null
  }
}

function writeCache(payload: RatesResponse) {
  const record: CachedRates = { payload, fetchedAt: Date.now() }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record))
  } catch {
    // ignore quota errors
  }
}

export function isCacheFresh(now = Date.now()): boolean {
  const cache = readCache()
  if (!cache) return false
  return now - cache.fetchedAt < CACHE_TTL_MS
}

export function getCachedRates(): CachedRates | null {
  return readCache()
}

export async function fetchRates(force = false): Promise<CachedRates> {
  const now = Date.now()
  const cached = readCache()
  if (!force && cached && now - cached.fetchedAt < CACHE_TTL_MS) {
    return cached
  }

  // VATComply API: https://api.vatcomply.com/rates
  const response = await fetch('https://api.vatcomply.com/rates')
  if (!response.ok) {
    if (cached) return cached // fallback to cached if available
    throw new Error('Failed to fetch rates')
  }
  const data = (await response.json()) as RatesResponse
  // Expected: { base: 'EUR', date?: 'YYYY-MM-DD', rates: { USD: 1.08, ... } }
  writeCache(data)
  return { payload: data, fetchedAt: Date.now() }
}

export function computeRate(from: string, to: string, base: string, rates: Record<string, number>): number | null {
  if (from === to) return 1
  const rateTo = to === base ? 1 : rates[to]
  const rateFrom = from === base ? 1 : rates[from]
  if (!rateTo || !rateFrom) return null
  // Formula: rate(A→B) = rate(Base→B) / rate(Base→A)
  return rateTo / rateFrom
}

export function parseAmount(input: string): number | null {
  // Support both ',' and '.' as decimal separators
  if (!input) return null
  let cleaned = input.replace(/,/g, '.')
  // Allow only digits and one dot
  cleaned = cleaned.replace(/[^0-9.]/g, '')
  const parts = cleaned.split('.')
  if (parts.length > 2) return null
  const num = Number(cleaned)
  return Number.isFinite(num) ? num : null
}

