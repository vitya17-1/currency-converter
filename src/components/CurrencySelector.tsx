import { useState } from 'react'
import type { CurrencyMeta } from '../types'
import { CurrencyModal } from './CurrencyModal'

type Props = {
  code: string
  onChange: (code: string) => void
  availableCodes: string[]
  metaMap: Record<string, CurrencyMeta>
}

export function CurrencySelector({ code, onChange, availableCodes, metaMap }: Props) {
  const [open, setOpen] = useState(false)
  const meta = metaMap[code]
  return (
    <>
      <button className="cc-selector" onClick={() => setOpen(true)}>
        <div className="cc-badge">{meta?.symbol?.slice(0, 1) || '•'}</div>
        <strong>{code}</strong>
        <span>{meta?.name || ''}</span>
      </button>
      <CurrencyModal
        open={open}
        onClose={() => setOpen(false)}
        onSelect={(c) => { onChange(c); setOpen(false) }}
        codes={availableCodes}
        metaMap={metaMap}
        selectedCode={code}
      />
    </>
  )
}

