import { useOnlineStatus } from '../hooks/useOnlineStatus'

export function NetworkStatus({ cachedTimestamp }: { cachedTimestamp?: number }) {
  const online = useOnlineStatus()
  const ts = cachedTimestamp ? new Date(cachedTimestamp).toLocaleString() : undefined
  return (
    <span className={`cc-chip ${online ? 'cc-chip-online' : 'cc-chip-offline'}`}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <circle cx="12" cy="12" r="6" />
      </svg>
      {online ? 'Online' : `Offline — Using cached rates${ts ? ` from ${ts}` : ''}`}
    </span>
  )
}

