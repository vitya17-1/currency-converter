export type CurrencyMeta = {
  name: string
  symbol: string
  symbolNative?: string
  decimalDigits?: number
  rounding?: number
  code: string
  namePlural?: string
  countryCodeISO2?: string
  flagSrc?: string
}

export type RatesResponse = {
  date?: string
  base: string
  rates: Record<string, number>
}

export type CachedRates = {
  payload: RatesResponse
  fetchedAt: number // epoch ms
}

export type ConverterState = {
  amountInput: string
  fromCurrency: string
  toCurrency: string
}

export type ConversionResult = {
  valid: boolean
  value?: number
  error?: string
}

