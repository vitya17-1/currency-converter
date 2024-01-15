import { useRef } from 'react'

type Props = {
  onRefresh: () => void
  disabled?: boolean
}

export function RefreshButton({ onRefresh, disabled }: Props) {
  const lastRef = useRef(0)
  function handleClick() {
    const now = Date.now()
    // Throttle to once per 2s
    if (now - lastRef.current < 2000) return
    lastRef.current = now
    onRefresh()
  }
  return (
    <button className="cc-chip cc-chip-button" onClick={handleClick} aria-label="Refresh rates" disabled={!!disabled} aria-busy={disabled ? 'true' : undefined}>
      {/* refresh icon */}
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M17.65 6.35A7.95 7.95 0 0 0 12 4a8 8 0 1 0 7.75 6h-2.1A6 6 0 1 1 12 6c1.66 0 3.14.69 4.22 1.78L14 10h8V2l-4.35 4.35z"/>
      </svg>
      Refresh rates
    </button>
  )
}

