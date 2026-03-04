---
trigger: always_on
---

# ANTIGRAVITY RULES

## Next.js API Server + shadcn/ui Architecture Standard

---

# 1. Project Context

This project uses:

- Next.js (App Router) as API Server
- shadcn/ui for frontend UI
- TypeScript (strict mode enabled)

Next.js and shadcn/ui are already installed.

All API design must strictly follow RESTful principles:
https://restfulapi.net/resource-naming/

---

# 2. Core Architectural Principles

1. Follow RESTful standards strictly.
2. Separate API domains into independent routers.
3. Separate business logic from route handlers.
4. Maintain full TypeScript type safety.
5. Never mix UI logic and backend business logic.
6. All APIs must be scalable, modular, secure, and predictable.

---

# 3. API Router Structure

## 3.1 Feature-Based Router Separation

Each major domain must have its own router.

Examples:

- weather
- auth
- users
- products
- orders

### Folder Structure Example

```bash
/app/api
  /v1
    /weather
      /current
        route.ts
      /forecast
        /daily
          route.ts
        /hourly
          route.ts
    /auth
      /login
        route.ts
      /register
        route.ts
      /refresh-tokens
        route.ts
```

Each domain must be isolated and self-contained.

---

## 3.2 Sub-Resource Separation

Each router must be divided into sub-resources.

Example:

```http
GET    /api/v1/weather
GET    /api/v1/weather/{id}
GET    /api/v1/weather/forecast
GET    /api/v1/weather/forecast/daily
GET    /api/v1/weather/forecast/hourly
```

Hierarchy must reflect real data relationships.

---

# 4. RESTful Naming Rules (STRICT)

## 4.1 Use Nouns, Never Verbs

Correct:

```http
GET    /api/v1/users
POST   /api/v1/orders
DELETE /api/v1/users/{id}
```

Incorrect:

```http
GET    /api/v1/getUsers
POST   /api/v1/createOrder
DELETE /api/v1/deleteUser
```

HTTP methods define the action — not the URL.

---

## 4.2 Always Use Plural Resource Names

Correct:

```http
/users
/products
/orders
```

---

## 4.3 Use Hierarchical Paths for Relationships

Correct:

```http
/users/{userId}/orders
/orders/{orderId}/items
```

Path must represent data ownership structure.

---

## 4.4 Use HTTP Methods Properly

- GET → retrieve resource
- POST → create resource
- PUT → replace resource
- PATCH → partial update
- DELETE → remove resource

Never encode actions in URLs.

---

# 5. API Versioning

All APIs must use URL versioning.

```http
/api/v1/users
/api/v1/weather
```

Future breaking changes must introduce:

```http
/api/v2/...
```

Never modify existing version behavior.

---

# 6. Route Handler Responsibilities

Route handlers must only:

1. Validate request input
2. Call service layer
3. Return standardized response

Route handlers must NOT:

- Access database directly
- Contain business logic
- Contain complex conditional logic

---

# 7. Module Architecture (Required)

Each domain must follow this structure:

```bash
/modules
  /weather
    weather.service.ts
    weather.repository.ts
    weather.schema.ts
    weather.types.ts
```

Responsibilities:

- service → business logic
- repository → database access
- schema → Zod validation schemas
- types → TypeScript types

Route handler → calls service  
Service → calls repository

Never break this layer separation.

---

# 8. Validation Rules

- Use Zod for all validation.
- Validate params, query, and body.
- Never trust client input.
- Return HTTP 422 for validation errors.

---

# 9. Standard Response Format

Success:

```ts
{
  success: true,
  data: {...},
  meta?: {...}
}
```

Error:

```ts
{
  success: false,
  error: {
    code: "ERROR_CODE",
    message: "Readable error message"
  }
}
```

Never return raw database objects directly.

---

# 10. HTTP Status Code Standard

- 200 → OK
- 201 → Created
- 204 → No Content
- 400 → Bad Request
- 401 → Unauthorized
- 403 → Forbidden
- 404 → Not Found
- 409 → Conflict
- 422 → Validation Error
- 500 → Internal Server Error

---

# 11. Authentication & Authorization

- Passwords must be hashed.
- JWT must have expiration.
- Refresh tokens must be stored securely.
- Never expose sensitive fields.
- Protect private routes using middleware.
- Implement rate limiting for auth endpoints.

Example structure:

```bash
/lib/auth
  auth.middleware.ts
  jwt.ts
```

---

# 12. Error Handling Standard

- Create centralized AppError class.
- Map error codes to HTTP status.
- Never expose stack trace in production.
- Log errors server-side only.
- Do not silently catch errors.

---

# 13. Pagination, Sorting & Filtering Standard

Pagination:

```http
?page=1&limit=20
```

Sorting:

```http
?sort=createdAt&order=desc
```

Filtering:

```http
?category=electronics&priceMin=100
```

Response must include pagination metadata.

---

# 14. Type Safety Rules

- Enable strict TypeScript mode.
- Never use `any`.
- Infer types from Zod when possible.
- Share types via `/types` directory.
- Avoid duplicate type definitions.

---

# 15. DTO & Data Exposure Rules

- Never return raw DB entities.
- Create DTO layer when necessary.
- Remove sensitive fields before returning data.

---

# 16. Performance Rules

- Cache external API calls (e.g., weather).
- Use revalidation where appropriate.
- Avoid unnecessary data fetching.
- Avoid over-fetching.

---

# 17. Security Rules

- Configure CORS properly.
- Implement rate limiting.
- Prevent:
  - SQL Injection
  - XSS
  - CSRF (if cookie-based auth)
- Use HTTPS in production.
- Store secrets in `.env`.

---

# 18. Idempotency Rule

Critical POST operations must support:

```http
Idempotency-Key
```

Prevent duplicate resource creation.

---

# 19. UI Rules (shadcn/ui)

- UI must consume API only.
- No business logic in frontend.
- Handle API errors properly.
- Use consistent shadcn components.
- Validate forms before sending requests.

---

# 20. Testing Rules

- Every service must have unit tests.
- Critical flows must have integration tests.
- External APIs must be mocked in tests.

---

# 21. Code Quality Rules

- ESLint strict configuration.
- Prettier enforced.
- Absolute imports only.
- Max function length: 40 lines.
- Avoid deep nesting.
- Keep functions pure where possible.

---

# 22. Forbidden Anti-Patterns

- Business logic inside route handler
- Database calls inside route handler
- Verbs in URL
- Using `any`
- Returning raw DB object
- Swallowing errors silently
- Mixing UI logic with backend logic

---

# 23. Final Principle

All generated code must be:

- Modular
- Predictable
- RESTful
- Typed
- Secure
- Maintainable
- Scalable

Every new feature must follow these rules strictly.
