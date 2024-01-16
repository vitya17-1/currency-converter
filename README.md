# Currency Converter — React + TypeScript

Single-page currency converter that fetches live exchange rates and supports caching + offline fallback.

Design reference: [Figma Currency Converter](https://www.figma.com/design/igLlkdEUcWemd6upGeRJ69/Currency-Converter?node-id=4739-12&p=f)

## Features
- Live rates via VATComply API (`https://api.vatcomply.com/rates`).
- Accurate conversion using base currency formula: rate(A→B) = rate(Base→B) / rate(Base→A).
- Caching in `localStorage` with 5-minute TTL and offline fallback.
- Remembers last amount and currency pair.
- Searchable currency modal with keyboard navigation.
- Network status indicator and manual refresh (throttled).
- Responsive layout: mobile (≤480px) and desktop (≥1024px).

## Getting started
Requirements: Node.js 20+ (recommended via nvm).
```bash
cd currency-converter
npm i
npm run dev
```

Open the app at the URL shown in the terminal (typically `http://localhost:5173`).

## Environment variables
No API key is needed with VATComply. If you prefer `fxratesapi.com`, add:

```
VITE_FXRATES_API_KEY=your_key
```

and implement the alternate client in `src/lib/ratesService.ts`.

## Currency metadata
The UI uses `public/currencies.json` to display names, symbols and flags. If a code isn’t present, the app still works and shows the plain code.

## Architecture
- `src/lib/ratesService.ts`: Fetching, caching, parsing and conversion logic.
- `src/lib/currencies.ts`: Loads currency metadata map.
- `src/hooks/*`: `useLocalStorage`, `useDebouncedValue`, `useOnlineStatus`.
- `src/components/*`: UI parts: modal, selectors, amount input, status, etc.
- State persistence via `useLocalStorage`.

## Notes
- Offline: When offline, the app uses the last successful cached response and shows timestamp.
- Cache expiry: after 5 minutes we refetch; manual refresh is throttled to prevent spam.
 - Currency list comes from the API response (plus base); unknown codes are disabled with an explanation.

## License
MIT
