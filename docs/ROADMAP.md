# Finova - Implementation Roadmap

## Version 1.0

This document structures the developmental stages of Finova from initial database setup through final automated integrations and advanced forecasting tools.

---

## Phase 1: MVP Core (Target: Launch for Georgia Initial 50 Users)

The goal of Phase 1 is to build the functional core, styling layer, and basic AI feedback loop.

### Sprint 1.1: Foundations & Auth (Week 1)
- [ ] Initialize NestJS backend and Next.js 16 app directory layouts.
- [ ] Configure Tailwind CSS with the **Neo-Brutalist** theme parameters.
- [ ] Set up PostgreSQL and initialize database structures using Prisma Migrate.
- [ ] Implement secure authentication endpoints (JWT based login, registration, and onboarding flows).

### Sprint 1.2: Wallets, Transactions & Multi-Currency (Week 2)
- [ ] Implement Wallet CRUD services (supporting multi-currency types).
- [ ] Create transactions endpoint (Income, Expenses, Transfers).
- [ ] Build daily automatic cron job to fetch external exchange rates and store conversions in the database.
- [ ] Build bottom-navigation UI and transaction entry page (ensuring < 5-second entry speed).

### Sprint 1.3: Budgets, Goals & Splits (Week 3)
- [ ] Implement Monthly and Category Budget configurations.
- [ ] Build Daily Safe Spending (DSS) calculation engine.
- [ ] Create Savings Goals tracker and Goal health calculations.
- [ ] Build **Finova Split** groups, split expense entry, and settlement calculators.

### Sprint 1.4: AI Coach & Reports (Week 4)
- [ ] Connect Backend to Groq API Gateway.
- [ ] Build Morning Brief and Night Summary generation routines.
- [ ] Set up interactive AI Chat for queries like "Can I buy this?".
- [ ] Create dashboard panels displaying balances, DSS metric, streaks, active quests, and charts.

---

## Phase 2: Input Enhancements & Analytics (Next Stage)

Optimize transaction entry methods and expand report analytics.

- **Receipt OCR**: Integrate AI-driven OCR parser to scan physical receipt images, automatically extract merchant, date, currency, amount, and auto-suggest category.
- **Voice Ingestion**: Set up audio-to-text inputs (using Whisper API) allowing users to say "Spent 5 GEL on coffee at Entree Cafe" to log transactions in 2 seconds.
- **Import Modules**: Add CSV and PDF import features for major local banks (e.g. Bank of Georgia statement parser).

---

## Phase 3: Bank Syncing & Automation

Ensure zero-to-minimal manual input.

- **Direct Open Banking APIs**: Connect with Nordigen/GoCardless or Plaid to synchronize university debit card accounts.
- **Recurring Transactions**: Automatically log monthly internet, subscription, and rent transactions on specified dates.
- **Smart Push Notifications**: Dispatch custom push reminders for quest updates, bill reminders, and budget warnings.

---

## Phase 4: Financial Advisory & Advanced Forecasting

Transform Finova into an predictive planning engine.

- **Cash Flow Forecasting**: Predict next month's cash position using past seasonality and transaction logs.
- **Tuition Planning**: Enable sponsors and families to link accounts to securely monitor spending distributions without violating privacy bounds.
- **Credit Health Guidance**: Offer students mock credit score builds based on bills paid through the Finova dashboard.
