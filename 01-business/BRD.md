# Finova - Business Requirements Document (BRD)

## Version 1.0

---

## 1. Executive Summary & Project Context

### 1.1 Project Background
College and university students face unique financial pressures. Balancing tuition payments, housing costs, food, and daily expenses without a steady salary often leads to high stress and poor budgeting habits. Traditional banking applications fail to provide proactive guidance, and existing expense trackers are passive tools that only log transactions retrospectively.

**Finova** changes this paradigm by serving as an AI-powered financial companion. It turns budgeting into an active, gamified daily habit, providing students with immediate, actionable guidelines (such as Daily Safe Spending limits) and personalized coaching.

### 1.2 Problem Statement
Students lack visibility into their discretionary spending, leading to cash flow shortages near the end of the month. Existing financial apps are designed for adults with stable incomes, offering complex investment graphs rather than answering simple daily questions: *"How much can I safely spend today?"* and *"Can I afford this?"*

---

## 2. Business Objectives & Key Results (OKRs)

### 2.1 Strategic Objective
Empower students to establish healthy money habits, increase their aggregate savings rate, and minimize financial anxiety using automated tracking and gamified rewards.

### 2.2 Key Results
- **KR 1 (User Engagement)**: Achieve a 30-day retention rate of >45% for the initial batch of 50 student users.
- **KR 2 (Savings Rate)**: Drive a minimum 15% month-over-month increase in individual student savings within 90 days of onboarding.
- **KR 3 (Habit Formation)**: Maintain an average daily streak length of 7+ active tracking days per user.

---

## 3. Stakeholders & User Roles

| Role | Description | Core Interest |
|---|---|---|
| **Primary User** | University & college students (local and international). | Easily track funds, avoid running out of money, split rent/bills with friends. |
| **System Admin** | Finova operations and content moderation team. | Monitor gamification health, verify badge triggers, review AI prompt efficacy. |
| **Finova Executive** | Project sponsor and business strategist. | User acquisition rates, retention patterns, conversion metrics, API cost profiles. |
| **Future Partners** | Colleges, student discount providers, local merchants. | Context-aware promotion of discounts (e.g., transit discounts, student deals). |

---

## 4. Key Business Requirements

### BR-1: Account Onboarding & Personalization
- **Requirement**: The system must collect basic student profile parameters (Base currency, Current cash balance, College location, optional Monthly budget) to initialize the UI state.
- **Business Value**: Immediate customization of the Daily Safe Spending limit, ensuring high initial relevance.

### BR-2: Multi-Currency Accounting
- **Requirement**: Finova must support multi-currency entry and convert balances dynamically to the user's base currency using daily updated exchange rates.
- **Business Value**: Crucial for international students studying abroad who hold funds in multiple currencies (e.g., USD, GEL, INR, EUR) but budget in one.

### BR-3: Daily Safe Spending (DSS) Calculations
- **Requirement**: The system must calculate a real-time spending allowance per day, adjusted dynamically for any spent funds and remaining days in the calendar month.
- **Business Value**: Prevents end-of-month budget depletion by offering students a simple daily limit to aim for.

### BR-4: AI Financial Coaching
- **Requirement**: An AI agent must deliver a morning financial briefing and night status summary, as well as answer real-time budget feasibility questions ("Can I travel?").
- **Business Value**: Replaces complex financial analytics dashboards with high-context, conversational advice.

### BR-5: Friendly Gamification (Streak & Quests)
- **Requirement**: The system must reward active expense tracking and budget preservation with XP and Streaks. The leaderboard must rank users strictly by XP/Streaks, **never** by account balances.
- **Business Value**: Builds retention through gamification loops while preventing socioeconomic alienation.

### BR-6: Finova Split (Expense Sharing)
- **Requirement**: Allow students to group expenses, split costs by customized formulas (equal, percentage, custom), and calculate the mathematically minimal debt path for settlements.
- **Business Value**: Drive organic product adoption through peer-to-peer sharing.

---

## 5. Scope & Boundary Conditions

### In-Scope (MVP Phase 1)
- User authentication and multi-step onboarding wizard.
- Manual transaction logging (Income, Expense, Wallet transfers).
- Multi-currency support for transactions.
- Automated daily exchange rate conversions.
- Budgets and Savings Goals configuration.
- AI morning briefs and Night summaries.
- Shared groups and custom splits.
- Streak, XP, and non-financial leaderboards.

### Out-of-Scope (Future Phases)
- Automatic bank syncing (via Plaid/GoCardless).
- Physical/Digital card issuing.
- Real-time stock/crypto investment portfolios.
- Automated payment settlement execution (direct wire transfers/cryptocurrency settlement).

---

## 6. Risks, Constraints & Mitigations

### 6.1 Regulatory & Advisory Risks
- **Risk**: Users might follow AI-generated advice and suffer financial loss, creating liability.
- **Mitigation**: Place a permanent disclaimer in the AI chat: *"Finova provides financial guidance for budgeting support, not regulated investment advice."*

### 6.2 AI API Cost Scaling
- **Risk**: High user volume leads to massive API billing for LLM prompts.
- **Mitigation**: Route prompts through the Groq API (high performance, low cost) and implement aggressive Redis caching for repeated user prompts.
