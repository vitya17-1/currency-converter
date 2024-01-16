// src/App.tsx
import { useEffect, useMemo, useState, useCallback } from 'react'
import './styles/app.css'
import { AmountInput } from './components/AmountInput'
import { CurrencySelector } from './components/CurrencySelector'
import { RefreshButton } from './components/RefreshButton'
import { NetworkStatus } from './components/NetworkStatus'
import { Spinner } from './components/Spinner'
import { useDebouncedValue } from './hooks/useDebouncedValue'
import { useLocalStorage } from './hooks/useLocalStorage'
import { loadCurrencies } from './lib/currencies'
import { computeRate, fetchRates, getCachedRates, isCacheFresh, parseAmount } from './lib/ratesService'
import type { ConverterState, CurrencyMeta } from './types'

function App() {
  const [converter, setConverter] = useLocalStorage<ConverterState>('cc_state_v1', {
    amountInput: '1',
    fromCurrency: 'USD',
    toCurrency: 'EUR',
  })

  const [metaMap, setMetaMap] = useState<Record<string, CurrencyMeta>>({})
  const [ratesAt, setRatesAt] = useState<number | undefined>(getCachedRates()?.fetchedAt)
  const [ratesBase, setRatesBase] = useState<string | undefined>(getCachedRates()?.payload.base)
  const [rates, setRates] = useState<Record<string, number>>(getCachedRates()?.payload.rates || {})
  const [loadingRates, setLoadingRates] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadCurrencies().then(setMetaMap).catch(() => setMetaMap({}))
  }, [])

  const load = useCallback(async (force = false) => {
    try {
      setLoadingRates(true)
      setError(null)
      const res = await fetchRates(force)
      setRates(res.payload.rates)
      setRatesBase(res.payload.base)
      setRatesAt(res.fetchedAt)
    } catch (e: any) {
      setError(e?.message || 'Failed to load rates')
    } finally {
      setLoadingRates(false)
    }
  }, [])

  useEffect(() => {
    if (!isCacheFresh()) {
      load()
    }
  }, [load])

  const debouncedAmount = useDebouncedValue(converter.amountInput, 250)
  const parsedAmount = useMemo(() => parseAmount(debouncedAmount), [debouncedAmount])

  const availableCodes = useMemo(() => {
    const set = new Set<string>(Object.keys(rates))
    if (ratesBase) set.add(ratesBase)
    return Array.from(set).sort()
  }, [rates, ratesBase])

  const fromUnknown = useMemo(() => converter.fromCurrency && !availableCodes.includes(converter.fromCurrency), [converter.fromCurrency, availableCodes])
  const toUnknown = useMemo(() => converter.toCurrency && !availableCodes.includes(converter.toCurrency), [converter.toCurrency, availableCodes])

  const rate = useMemo(() => {
    if (!ratesBase) return null
    if (fromUnknown || toUnknown) return null
    return computeRate(converter.fromCurrency, converter.toCurrency, ratesBase, rates)
  }, [converter.fromCurrency, converter.toCurrency, ratesBase, rates, fromUnknown, toUnknown])

  const resultValue = useMemo(() => {
    if (parsedAmount == null) return null
    if (rate == null) return null
    return parsedAmount * rate
  }, [parsedAmount, rate])

  function formatCurrency(value: number | null, code: string): string {
    if (value == null) return ''
    const meta = metaMap[code]
    const symbol = meta?.symbol || ''
    return `${symbol}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`.trim()
  }

  const swap = () => setConverter({ ...converter, fromCurrency: converter.toCurrency, toCurrency: converter.fromCurrency })

  return (
    <div className="cc-container">
      <div className="cc-inner">
            <div className="cc-hero">
              <h1 className="cc-hero-title">Currency converter</h1>
              <p className="cc-hero-subtitle">Get real-time exchange rates</p>
            </div>
            <div className="cc-statusbar">
              <NetworkStatus cachedTimestamp={ratesAt} />
              <span className="cc-chip">
                {ratesAt ? `Last updated: ${new Date(ratesAt).toLocaleString()}` : 'Not loaded yet'}
              </span>
              <RefreshButton onRefresh={() => load(true)} disabled={loadingRates} />
            </div>

            <div className="cc-two-col">
              <div className="cc-card cc-left-card">
                <div className="cc-left-inner">
                  <div className="cc-field">
                    <label className="cc-label">Amount</label>
                    <AmountInput value={converter.amountInput} onChange={(v) => setConverter({ ...converter, amountInput: v })} />
                  </div>
                  <div className="cc-field">
                    <div className="cc-field-row">
                      <div>
                        <label className="cc-label">From</label>
                        <CurrencySelector code={converter.fromCurrency} onChange={(c) => setConverter({ ...converter, fromCurrency: c })} availableCodes={availableCodes} metaMap={metaMap} />
                      </div>
                      <div style={{ display: 'grid', alignItems: 'end' }}>
                        <button aria-label="Swap" onClick={swap} className="cc-button cc-swap" title="Swap">⇄</button>
                      </div>
                      <div>
                        <label className="cc-label">To</label>
                        <CurrencySelector code={converter.toCurrency} onChange={(c) => setConverter({ ...converter, toCurrency: c })} availableCodes={availableCodes} metaMap={metaMap} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="cc-card">
                <h3 className="cc-card-title">Conversion result</h3>
                <div className="cc-result">
                  {loadingRates ? <Spinner /> : null}
                  {error ? (
                    <span style={{ color: 'var(--cc-danger)' }}>{error}</span>
                  ) : fromUnknown || toUnknown ? (
                    <span style={{ color: 'var(--cc-danger)' }}>Unknown currency code from API</span>
                  ) : rate == null ? (
                    <span style={{ color: 'var(--cc-danger)' }}>Rate not available for selected currencies</span>
                  ) : resultValue == null ? (
                    <span style={{ color: 'var(--cc-text-muted)' }}>Enter amount to convert</span>
                  ) : (
                    <strong>
                      {formatCurrency(resultValue, converter.toCurrency)}
                    </strong>
                  )}
                </div>
                <div className="cc-result-meta">1 {converter.fromCurrency} =</div>
                <div className="cc-rate-row">
                  <span>Exchange Rate</span>
                  <span>
                    1 {converter.fromCurrency} = {rate ? rate.toFixed(6) : '—'} {converter.toCurrency}
                  </span>
                </div>
                <div className="cc-rate-row">
                  <span>Inverse Rate</span>
                  <span>
                    1 {converter.toCurrency} = {rate ? (1 / rate).toFixed(6) : '—'} {converter.fromCurrency}
                  </span>
                </div>
                <div className="cc-disclaimer">Rates are for informational purposes only and may not reflect real-time market rates</div>
              </div>
            </div>
        </div>
      </div>
  )
}

export default App