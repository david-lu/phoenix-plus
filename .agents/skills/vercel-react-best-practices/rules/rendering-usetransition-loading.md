---
title: Use useTransition for Non-Urgent Actions
impact: LOW
impactDescription: tracks pending actions while keeping input responsive
tags: rendering, transitions, useTransition, loading, state
---

## Use useTransition for Non-Urgent Actions

Use `useTransition` when an Action updates non-urgent UI and needs pending feedback. Explicit loading state or a data library's pending state remains appropriate for other work. A transition does not cancel network requests or guarantee their completion order.

Keep controlled input updates urgent. State updates after `await` need another `startTransition` to be marked as transitions. When requests can overlap, handle stale responses separately:

```tsx
import { useRef, useState, useTransition } from 'react'

function SearchResults({
  fetchResults,
}: {
  fetchResults: (query: string) => Promise<string[]>
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const latestRequest = useRef(0)

  const handleSearch = (value: string) => {
    setQuery(value)
    setError(null)
    const requestId = ++latestRequest.current

    startTransition(async () => {
      try {
        const data = await fetchResults(value)
        if (requestId !== latestRequest.current) return

        startTransition(() => {
          setResults(data)
        })
      } catch {
        if (requestId !== latestRequest.current) return
        startTransition(() => {
          setError('Search failed. Try again.')
        })
      }
    })
  }

  return (
    <>
      <input
        aria-label="Search"
        value={query}
        onChange={(event) => handleSearch(event.target.value)}
      />
      {isPending && <p role="status">Searching…</p>}
      {error && <p role="alert">{error}</p>}
      <ul>{results.map((result, index) => <li key={index}>{result}</li>)}</ul>
    </>
  )
}
```

The request ID prevents older responses from replacing newer results; it does not abort the requests. React currently batches overlapping transitions, so pending state and result rendering can wait for earlier Actions to finish. Use the data layer's cancellation/ordering support when available. In Phoenix, use the existing Relay flow and shared `DebouncedSearch` field rather than copying this standalone fetch example.

Reference: [useTransition](https://react.dev/reference/react/useTransition).
