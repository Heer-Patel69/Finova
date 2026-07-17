# Finova - Technical Requirements Document (TRD)

## Version 1.0

This Technical Requirements Document specifies the technical patterns, security baselines, integrations, performance targets, and failure recovery protocols for **Finova**.

---

## 1. System Engineering Constraints

Finova operates under strict modern web development constraints to guarantee clean, scalable deployment and responsive experiences on mobile browsers.

### 1.1 Development Stack
- **Frontend App**: Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui.
- **Backend App**: NestJS Framework, TypeScript, REST API Controller pattern.
- **Database Engine**: PostgreSQL with Prisma ORM.
- **Cache Engine**: Redis for prompt caching, session rate limits, and exchange rates.

---

## 2. Technical Feature Requirements

### 2.1 Authenticated Session Flow (JWT)
- **Token Mechanism**: Standard JSON Web Tokens (JWT) signed using a secure environment key (`JWT_SECRET`).
- **Storage Strategy**: Tokens are passed to the frontend and stored in an `HttpOnly`, `Secure`, `SameSite=Strict` cookie to eliminate Cross-Site Scripting (XSS) access vectors.
- **Payload Contents**: Contains `userId`, `email`, and `role`. Excludes any password hashes or sensitive balance information.

### 2.2 Dynamic Multi-Currency Ingestion
- **Source API**: Integration with a reliable, free exchange rate service (e.g. `ExchangeRate-API` or similar public rates feed).
- **Update Frequency**: Daily cron task configured at `00:05 UTC` executes a query fetching rates relative to USD.
- **Data Persistence**: Rates are written to a PostgreSQL table `ExchangeRate` and cached in Redis with a Time-To-Live (TTL) of 24 hours.
- **Calculation Precision**: All monetary values are processed using double-precision float points or numeric fields to prevent rounding errors.

### 2.3 AI Prompt & Token Management
- **Inference Client**: Groq SDK for Node.js using `llama-3-70b-instruct` or equivalent rapid model.
- **Format Enforcement**: System commands must mandate JSON mode to ensure responses match schema objects (see [AI_COACH_SYSTEM.md](file:///c:/Users/heerp/OneDrive/Desktop/Finova/docs/AI_COACH_SYSTEM.md)).
- **Safety Fallback**: If the Groq endpoint exceeds a `3000ms` response threshold or returns a `5xx` error, the backend automatically intercepts and reroutes the query to OpenAI `gpt-4o-mini` with identical prompts.

### 2.4 Debt Minimization Engine (Finova Split)
- **Problem**: In a split group, members owe varying amounts to each other.
- **Algorithm**: A Net Balance Simplification algorithm:
  1. Calculate net balance for each user: $B_u = \text{Amount Paid} - \text{Amount Owed}$.
  2. Separate users into Debtors ($B_u < 0$) and Creditors ($B_u > 0$).
  3. Sort both lists by absolute balance.
  4. Match the largest debtor with the largest creditor:
     - Determine settlement amount: $S = \min(|B_{\text{debtor}}|, B_{\text{creditor}})$.
     - Deduct $S$ from both balances.
     - Record simplified transaction: "Debtor pays Creditor amount S".
     - Re-insert and repeat until all balances are zero.

---

## 3. Security & Compliance Baseline

### 3.1 Password Security
- **Hashing**: All passwords must be hashed using `bcrypt` with a minimum salt factor of `10` before insertion into PostgreSQL. Plaintext passwords must never be logged.

### 3.2 SQL & XSS Injection Safeguards
- **ORM Boundaries**: All database queries must run through Prisma ORM to guarantee parameterized query outputs, preventing SQL Injection vectors.
- **Data Sanitization**: Backend requests utilizing input properties must run validation via class-validators (e.g. `@IsString()`, `@IsEmail()`, `@MaxLength()`).

### 3.3 Access Controls
- **Endpoint Protection**: Use NestJS Guards (`AuthGuard`) to protect all non-login transaction endpoints.
- **Workspace Bounds**: Verification gates verify that split expense operations can only be created by members of that specific group.

---

## 4. Performance & Reliability Metrics

- **API Latency**:
  - Regular endpoints (Wallets, Transactions): `< 150ms` response times.
  - Dashboard aggregations: `< 200ms` using indexed database columns.
  - AI endpoints: `< 1500ms` (using Groq high-throughput endpoints).
- **Availability**: Target 99.9% uptime for core database transactions.
- **Offline Entry Queue**: Frontend caches transaction logs in local storage (IndexedDB) during internet outages and resolves state automatically upon reconnection.
