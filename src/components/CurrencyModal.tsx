import { useEffect, useMemo, useRef, useState } from 'react'
import type { CurrencyMeta } from '../types'

type Props = {
  open: boolean
  onClose: () => void
  onSelect: (code: string) => void
  codes: string[] // available codes to pick from
  metaMap: Record<string, CurrencyMeta>
  selectedCode?: string
}

export function CurrencyModal({ open, onClose, onSelect, codes, metaMap, selectedCode }: Props) {
  const [query, setQuery] = useState('')
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (!listRef.current) return
      const items = Array.from(listRef.current.querySelectorAll('li')) as HTMLLIElement[]
      const current = document.activeElement as HTMLElement | null
      const idx = items.findIndex((el) => el === current)
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        const next = items[Math.min(idx + 1, items.length - 1)]
        next?.focus()
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        const prev = items[Math.max(idx - 1, 0)]
        prev?.focus()
      }
      if (e.key === 'Enter' && (current?.dataset.code || '')) {
        onSelect(current!.dataset.code!)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose, onSelect])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = codes
      .map((code) => ({ code, meta: metaMap[code] }))
      .filter(({ code, meta }) => {
        if (!q) return true
        const hay = `${code} ${(meta?.name || '').toLowerCase()}`
        return hay.includes(q)
      })
      .sort((a, b) => a.code.localeCompare(b.code))
    return list
  }, [codes, metaMap, query])

  if (!open) return null
  return (
    <div role="dialog" aria-modal="true" className="cc-modal-backdrop" onClick={onClose}>
      <div className="cc-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cc-modal-header">
          <input className="cc-modal-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search code or name" autoFocus />
        </div>
        <ul ref={listRef} className="cc-modal-list">
          {filtered.map(({ code, meta }) => (
            <li
              key={code}
              tabIndex={0}
              data-code={code}
              onClick={() => onSelect(code)}
              className={`cc-modal-item ${code === selectedCode ? 'cc-modal-item--selected' : ''}`}
            >
              {meta?.flagSrc ? <img src={meta.flagSrc} alt="" width={24} height={16} style={{ objectFit: 'cover' }} /> : <div style={{ width: 24 }} />}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="cc-modal-code">{code}</span>
                <span className="cc-modal-name">{meta?.name || '—'}</span>
              </div>
              <div className="cc-modal-symbol">{meta?.symbol || ''}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

