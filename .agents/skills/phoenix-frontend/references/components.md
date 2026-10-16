# Component Patterns

## Core vs. domain split

Explore `js/app/src/components/` to understand the two layers:

- **Core** (`components/core/`) — presentational primitives. MUST NOT contain data fetching or business logic.
- **Domain** (everything else) — data-rich, composed from core primitives.

New features MUST compose from existing core primitives before creating new low-level UI.

## Layout

Existing flex and view layout primitives SHOULD be used for consistent spacing and alignment. Explore `components/core/` for what's available before writing ad-hoc layout wrappers.

## Storybook

New core components MUST include Storybook stories. Load the `phoenix-storybook` skill before writing or changing any story; it defines placement, tags, and how to show a component's options and states.

## File convention

Explore a few existing components to match the established file structure (component, styles, types, barrel export).

## Memoization

React Compiler is enabled in `js/app/vite.config.mts`. Rely on it for routine memoization, including callback props; do not add `useMemo`, `useCallback`, or `React.memo` by habit or copy them from generic performance examples.

Manual memoization remains an escape hatch when profiling shows a missed optimization or an integration needs controlled memoization. Document the reason and verify it in the affected interaction. Preserve existing memoization until its purpose is understood; memoization must not be required for correctness.

Reference: [React Compiler introduction](https://react.dev/learn/react-compiler/introduction).

## Conditional class names

Build conditional `className` strings with `classNames` from `@phoenix/utils/classNames` (a re-export of `clsx`) — do NOT hand-roll ternaries or template literals that repeat the base class. Pass the base class as a string and toggles as an object:

```tsx
className={classNames("attachment-info", {
  "attachment-info--with-detail": detail,
})}
```

## Refs

React 19 treats `ref` as a regular prop — do NOT use `forwardRef`. Instead, accept `ref` directly in the props type and destructure it like any other prop. Add `ref?: Ref<ElementType>` to the props interface.

## Callback props

Name callback props after the **event** (`onProjectCreated`, `onDismiss`), not the parent's implementation (`refetchProjects`). The callsite should read as plain English.

```tsx
// Good
<NewProjectButton onProjectCreated={() => refetchProjects()} />

// Avoid
<NewProjectButton refetchProjects={() => refetchProjects()} />
```

## Avoid useEffect

Prefer declarative React and React Aria patterns over imperative `useEffect`. Reach for `useEffect` only when there is no declarative alternative.

For debounced search/filter inputs, compose the shared `DebouncedSearch` field instead of hand-rolling `useEffect` + `setTimeout`.

For expensive context-driven updates (tree filtering, list filtering, global expand/collapse), keep transition policy with the state owner: expose context actions whose provider wraps the underlying state update in `startTransition`, and let consumers call those actions directly.

## Overlays: Drawer, ViewportModal, and Modal

Choose an overlay by which parts of the app must remain interactive. The overlay primitives live in `js/app/src/components/core/overlay/`.

### Drawer (`components/core/overlay/Drawer.tsx`)

A **non-modal** right-side panel. Use for **list-detail** flows where the user selects a row and inspects its details while keeping the list visible and interactive behind it.

- Does NOT render a backdrop — clicks pass through to the page behind it
- Resizable via drag handle; width persists to `localStorage` as a viewport percentage
- Dismissed with Escape or the collapse arrow button
- Route-driven: opening a drawer means navigating to a nested route (e.g., `/sessions/:sessionId`)
- The corresponding table row MUST be highlighted with `data-selected` so the user always knows which item they are viewing

Use `Drawer` when: the user needs to glance at details and return to the list without losing context (traces, spans, sessions).

### ViewportModal (`components/core/overlay/ViewportModal.tsx`)

A centered dialog paired with `ViewportModalOverlay`. In the app frame, it blocks the application viewport while keeping the PXI assistant rail interactive. Use it for ordinary forms and confirmations where the assistant should remain available. Outside the app frame, it falls back to a document-body portal; the scoped behavior depends on the frame provider.

### Modal (`components/core/overlay/Modal.tsx`)

A centered dialog paired with `ModalOverlay` that blocks the whole app, including the assistant rail. Use it when the interaction requires application-wide focus.

Both modal components support `size="S" | "M" | "L" | "fullscreen"`. Use size to accommodate content within the chosen interaction scope. Neither has a `variant` prop; a larger dialog does not require a different overlay scope.

### Decision guide

| Signal | Use |
|--------|-----|
| User is browsing a list and inspecting items | `Drawer` |
| A form or confirmation blocks the page while the assistant remains available | `ViewportModalOverlay` + `ViewportModal` |
| The interaction must block the entire app, including the assistant | `ModalOverlay` + `Modal` |
| Modal content needs more space | Choose `size` on the modal appropriate to the interaction scope |

## UX: list-detail pattern

Tables that open a detail view on row click MUST follow the **layered list-detail** pattern:

1. **Row click navigates** to a nested route (e.g., `/traces/:traceId`). The detail view renders via `<Outlet />` alongside the table.
2. **Selected row is highlighted** by setting `data-selected={isSelected}` on the `<tr>`, where `isSelected` compares `row.original.id` against the URL param (via `useParams`). The existing `selectableTableCSS` styles `tr[data-selected="true"]` automatically.
3. **Drawer opens** with the detail content. The table remains visible and scrollable behind it.
4. **Closing the drawer** navigates back to the parent route, clearing the selection.

This pattern keeps the user oriented — they always see which row they selected and can click a different row to switch without closing first.

## Shared constants

Shared literals (validation regexes, fixed string sets, etc.) belong in `js/app/src/constants/` as focused modules re-exported from `index.ts`. Import via `@phoenix/constants`. Do not export them from component or form files.
