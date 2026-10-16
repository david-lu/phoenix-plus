---
title: Read Latest Values in Effect Callbacks
impact: LOW
impactDescription: prevents effect re-runs
tags: advanced, hooks, useEffectEvent, refs, optimization
---

## Read Latest Values in Effect Callbacks

Use `useEffectEvent` when a callback belongs to an Effect and should read current values without restarting that Effect. Keep values that should restart the Effect in its dependency array. The returned function does not have stable identity and must not be passed to children or other Hooks.

In this debounce example, changes to `query` restart the timer; changes to `onSearch` should not. If changing the callback should restart the work, include it as a normal Effect dependency instead. In Phoenix, prefer the existing `DebouncedSearch` component for search fields.

**Incorrect (effect re-runs on every callback change):**

```tsx
function SearchInput({ onSearch }: { onSearch: (q: string) => void }) {
  const [query, setQuery] = useState('')

  useEffect(() => {
    const timeout = setTimeout(() => onSearch(query), 300)
    return () => clearTimeout(timeout)
  }, [query, onSearch])

  return <input aria-label="Search" value={query} onChange={(event) => setQuery(event.target.value)} />
}
```

**Correct (using React's useEffectEvent):**

```tsx
import { useEffect, useEffectEvent, useState } from 'react'

function SearchInput({ onSearch }: { onSearch: (q: string) => void }) {
  const [query, setQuery] = useState('')
  const onSearchEvent = useEffectEvent(onSearch)

  useEffect(() => {
    const timeout = setTimeout(() => onSearchEvent(query), 300)
    return () => clearTimeout(timeout)
  }, [query])

  return <input aria-label="Search" value={query} onChange={(event) => setQuery(event.target.value)} />
}
```

Reference: [useEffectEvent](https://react.dev/reference/react/useEffectEvent).
