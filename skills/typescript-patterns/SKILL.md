---
name: typescript-patterns
description: Idiomatic TypeScript patterns, type-safety practices, generics, async workflows, and maintainable design patterns for robust TypeScript applications.
origin: ECC
---

# TypeScript Development Patterns

Idiomatic TypeScript patterns for building type-safe, maintainable applications with strong domain modeling, safe async flows, and practical generics.

## When to Use

- Writing new TypeScript code
- Reviewing TypeScript modules or APIs
- Refactoring JavaScript code toward stricter typing
- Designing shared utility types or reusable libraries
- Hardening application boundaries around external data

## How It Works

This skill emphasizes five areas that matter most in TypeScript codebases: strict compiler settings, explicit domain types, safe generics that preserve inference, runtime validation at trust boundaries, and async flows that propagate typed failures instead of hiding them.

## Core Principles

### 1. Use the Type System Aggressively

Push invalid states out of runtime and into compile time.

```ts
interface User {
  id: string
  email: string
  status: 'active' | 'disabled'
}

function canLogin(user: User): boolean {
  return user.status === 'active'
}
```

Prefer enabling and keeping these compiler options on:

- `strict`
- `noUncheckedIndexedAccess`
- `exactOptionalPropertyTypes`
- `noImplicitOverride`
- `useUnknownInCatchVariables`

### 2. Model Domain States Explicitly

Prefer discriminated unions and value objects over loosely shaped objects.

```ts
type PaymentResult =
  | { kind: 'success'; receiptId: string }
  | { kind: 'declined'; reason: string }
  | { kind: 'retryable_error'; retryAfterMs: number }

function handlePayment(result: PaymentResult): string {
  switch (result.kind) {
    case 'success':
      return `Receipt ${result.receiptId}`
    case 'declined':
      return result.reason
    case 'retryable_error':
      return `Retry in ${result.retryAfterMs}ms`
    default: {
      const exhaustiveCheck: never = result
      return exhaustiveCheck
    }
  }
}
```

### 3. Validate External Data at the Boundary

Never trust JSON, network payloads, env vars, or database blobs just because they have a TypeScript type.

```ts
interface CreateOrderInput {
  customerId: string
  items: Array<{ sku: string; quantity: number }>
}

function assertCreateOrderInput(value: unknown): asserts value is CreateOrderInput {
  if (typeof value !== 'object' || value === null) {
    throw new Error('Invalid order payload')
  }
}
```

Use `unknown` for boundary inputs, then narrow or validate before use.

### 4. Prefer Immutable Transformations

Avoid in-place mutation unless there is a measured need and the API clearly communicates it.

```ts
function renameUser(user: User, email: string): User {
  return {
    ...user,
    email,
  }
}
```

### 5. Make Failure States Explicit

Throw for exceptional failures. For expected business failures, prefer typed results.

```ts
type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E }
```

## Type Safety Patterns

### Prefer `unknown` Over `any`

`any` disables checking and spreads unsafety through the codebase.

```ts
function parseJson(text: string): unknown {
  return JSON.parse(text)
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return 'Unknown error'
}
```

### Use Narrow Types for Business Concepts

Brand primitive IDs when mixing them would be dangerous.

```ts
type Brand<T, Name extends string> = T & { readonly __brand: Name }

type UserId = Brand<string, "UserId">
type OrderId = Brand<string, "OrderId">

function getOrder(orderId: OrderId) {
  return orderId
}
```

### Be Precise About Optional vs Nullable

- `field?: string` means the property may be absent
- `field: string | null` means the property is present but may have no value

Do not treat them as interchangeable.

```ts
interface PatchUser {
  displayName?: string
  bio: string | null
}
```

### Prefer `readonly` for Stable Structures

```ts
interface SearchRequest {
  readonly query: string
  readonly tags: readonly string[]
}
```

This prevents accidental mutation and makes ownership clearer.

## Generics

### Preserve Inference

Design helpers so callers rarely need to annotate generic parameters manually.

```ts
function first<T>(items: readonly T[]): T | undefined {
  return items[0]
}

const value = first(['a', 'b', 'c']) // string | undefined
```

### Constrain Generics With What You Actually Need

```ts
function getId<T extends { id: string }>(value: T): string {
  return value.id
}
```

Avoid unconstrained `<T>` if the implementation assumes structure.

### Use `keyof` to Keep APIs Honest

```ts
function pick<T, K extends keyof T>(value: T, keys: readonly K[]): Pick<T, K> {
  const entries = keys.map((key) => [key, value[key]])
  return Object.fromEntries(entries) as Pick<T, K>
}
```

### Prefer Type Parameters Over Overloads When One Shape Generalizes

```ts
function toArray<T>(value: T | readonly T[]): readonly T[] {
  return Array.isArray(value) ? value : [value]
}
```

### Use Default Type Parameters Sparingly

Defaults are useful when there is a clear common case.

```ts
interface ApiResponse<TData = unknown> {
  data: TData
  requestId: string
}
```

Avoid defaults that hide important domain information.

## Async Patterns

### Always Type Async Return Values

```ts
function assertUser(value: unknown): asserts value is User {
  if (typeof value !== 'object' || value === null) {
    throw new Error('Invalid user payload')
  }
}

async function loadUser(userId: string): Promise<User> {
  const response = await fetch(`/api/users/${userId}`)

  if (!response.ok) {
    throw new Error(`Failed to load user ${userId}`)
  }

  const data: unknown = await response.json()
  assertUser(data)
  return data
}
```

Explicit return types stop accidental widening and make API contracts obvious.

### Run Independent Work in Parallel

```ts
async function loadDashboard(userId: string) {
  const [user, orders, alerts] = await Promise.all([
    loadUser(userId),
    loadOrders(userId),
    loadAlerts(userId),
  ])

  return { user, orders, alerts }
}
```

Use sequential `await` only when later steps depend on earlier results.

### Thread Cancellation Through APIs

Accept `AbortSignal` where work may outlive the caller.

```ts
async function fetchReport(reportId: string, signal?: AbortSignal): Promise<Response> {
  return fetch(`/api/reports/${reportId}`, { signal })
}
```

### Do Not Hide Errors in Fire-and-Forget Promises

If work is intentionally detached, handle its failure explicitly.

```ts
void sendAnalyticsEvent(event).catch((error: unknown) => {
  console.error('analytics delivery failed', error)
})
```

### Prefer Result Types for Expected Async Failures

```ts
type AuthError = 'invalid_credentials' | 'locked_account'

async function signIn(
  email: string,
  password: string,
): Promise<Result<{ token: string }, AuthError>> {
  if (email === '' || password === '') {
    return { ok: false, error: 'invalid_credentials' }
  }

  return { ok: true, value: { token: 'jwt-token' } }
}
```

## API and Module Design

### Export Stable Types, Keep Internals Private

- Export public contracts used across modules
- Keep helper types local when they are implementation details
- Prefer named exports over large default-export objects

### Separate Transport Types From Domain Types

Map external DTOs into domain types instead of leaking wire formats everywhere.

```ts
interface UserDto {
  id: string
  created_at: string
}

interface DomainUser {
  id: string
  createdAt: Date
}

function toDomainUser(dto: UserDto): DomainUser {
  return {
    id: dto.id,
    createdAt: new Date(dto.created_at),
  }
}
```

### Keep Utility Types Readable

Prefer small composable aliases over dense type-level programming that nobody can maintain.

If a type needs a paragraph to explain, simplify it or hide it behind a focused alias.

## Review Checklist

- Are external inputs typed as `unknown` until validated?
- Do union types encode real business states?
- Do generic helpers preserve inference and constrain what they use?
- Are async functions explicit about cancellation, failure, and return types?
- Are optional and nullable fields modeled intentionally?
- Are exported types stable and easy for callers to understand?
