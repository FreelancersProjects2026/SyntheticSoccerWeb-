# Amazon Q Developer — Project Rules
## Stack
- React 18 + Vite
- TypeScript (strict mode)
- Supabase (auth, database, storage, realtime)
- React Router v6
- TanStack Query (if present) or native fetch

## SOLID Principles

### Single Responsibility
- Each component does ONE thing. If it fetches data AND renders UI AND handles logic, split it.
- Separate concerns: data fetching → custom hook, UI → component, business logic → service/util.
- One file = one responsibility. No 300+ line components.

### Open/Closed
- Extend behavior via props and composition, not by modifying existing components.
- Use component composition patterns (children, render props, compound components) over inheritance.

### Liskov Substitution
- Component variants must be interchangeable without breaking the parent layout.
- Subtypes (extended interfaces) must honor the contract of their base interface.

### Interface Segregation
- Never pass a large object when the component only needs 2 fields. Destructure and type only what is needed.
- Avoid "god props" — if a component receives more than 7 props, consider splitting it.

### Dependency Inversion
- Components depend on abstractions (interfaces, hooks), not on Supabase directly.
- All Supabase calls must go through a service layer (`/src/services/`), never called directly inside components.

## Project Architecture

### Folder Structure (enforce this)
src/
  components/       # Reusable UI only, no business logic
  pages/            # Route-level components, composition only
  hooks/            # Custom hooks, one responsibility each
  services/         # All Supabase and external API calls
  types/            # Global TypeScript interfaces and types
  utils/            # Pure functions, no side effects
  context/          # React context providers
  constants/        # App-wide constants, no magic numbers/strings

### Rules
- No Supabase imports outside of `src/services/`.
- No direct `fetch()` calls inside components or pages.
- Pages only compose components — no logic, no data fetching directly.
- Hooks are the bridge between services and components.

## TypeScript
- `strict: true` is mandatory. Never disable it.
- Never use `any`. Use `unknown` and narrow the type, or define a proper interface.
- All functions must have explicit return types.
- Prefer `interface` for object shapes, `type` for unions and primitives.
- Use `readonly` on arrays and objects that should not be mutated.
- Use discriminated unions for state modeling (e.g. `{ status: 'loading' } | { status: 'success', data: T } | { status: 'error', error: string }`).
- DTOs from Supabase must be mapped to domain types before entering components.

## React
- Functional components only. No class components.
- Always clean up useEffect: return a cleanup function when subscribing to anything.
- Never put business logic inside useEffect — extract it to a custom hook or service.
- Avoid useEffect for data fetching — use a custom hook with proper loading/error/data state.
- Memoize only when there is a measurable performance problem (no premature optimization).
- Keep component files under 150 lines. If longer, split.
- Naming: components PascalCase, hooks camelCase starting with `use`, services camelCase ending with `Service`.

## Supabase
- Never hardcode `SUPABASE_URL` or `SUPABASE_ANON_KEY`. Use `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from `.env`.
- Never use `service_role` key on the frontend under any circumstance.
- Every Supabase call must handle both `data` and `error` explicitly.
- Use Row Level Security (RLS) on ALL tables — no exceptions.
- Supabase client must be a singleton instantiated once in `src/services/supabaseClient.ts`.
- Auth state must be managed in a single context (`AuthContext`), not scattered across components.
- Realtime subscriptions must be unsubscribed on component unmount.

## Error Handling
- No silent failures. Every catch block must log or surface the error to the user.
- No empty catch blocks: `catch(e) {}` is forbidden.
- User-facing errors must be human-readable, not raw Supabase/API error messages.
- Use a consistent error boundary at the router level.
- All async functions must return a typed result: use a `Result<T, E>` pattern or explicit try/catch with typed errors.

## Security
- No secrets, tokens, or API keys in source code or committed `.env` files.
- `.env` must be in `.gitignore`. Only `.env.example` is committed.
- Sanitize all user inputs before sending to Supabase.
- Never trust client-side auth checks for sensitive operations — enforce with RLS on Supabase.
- No `dangerouslySetInnerHTML` without explicit sanitization.

## Code Quality
- No `console.log` in committed code. Use a proper logger or remove before PR.
- No commented-out code blocks in PRs.
- No magic numbers or magic strings — define them in `src/constants/`.
- Functions must do one thing and be under 30 lines. If longer, extract.
- Pure functions preferred — avoid side effects outside of hooks and services.
- DRY: if the same logic appears 3 times, extract it to a utility or hook.

## Scalability
- Design components to be stateless when possible — receive data via props, emit events via callbacks.
- Global state only for truly global concerns (auth, theme, user preferences). Use local state otherwise.
- Lazy load routes and heavy components with `React.lazy` and `Suspense`.
- Avoid deeply nested component trees — flatten with composition.
- Index files (`index.ts`) in each folder for clean imports.
