# Finova - AI Coach Engine Architecture & Prompt Specifications

## Version 1.0

The **AI Coach** is the central feature of Finova, acting as a supportive financial companion for students. This document specifies the LLM context packaging structure, prompt templates, expected JSON output schemas, and caching layers.

---

## 1. Context Packaging Layout

To keep token usage minimal (within a 4,000-token window per request) and prevent sharing unnecessary metadata, the backend extracts only relevant parameters to compose the LLM payload.

### Standard User Context Context Object
Whenever a query is sent to the AI Gateway, the backend compiles a unified context packet:
```json
{
  "user": {
    "name": "Jane Doe",
    "country": "Georgia",
    "college": "Tbilisi State University",
    "baseCurrency": "USD"
  },
  "financials": {
    "currentTotalBalance": 1450.00,
    "remainingMonthlyBudget": 230.00,
    "daysRemainingInMonth": 14,
    "dailySafeSpendingLimit": 16.42,
    "totalSpentToday": 8.50
  },
  "recentTransactions": [
    { "category": "Food", "amount": 4.50, "currency": "GEL", "type": "EXPENSE", "date": "2026-07-17T08:30:00Z" },
    { "category": "Transport", "amount": 4.00, "currency": "GEL", "type": "EXPENSE", "date": "2026-07-17T11:00:00Z" }
  ],
  "activeGoals": [
    { "name": "New Laptop", "target": 1200.00, "saved": 100.00, "health": "ON_TRACK" }
  ],
  "activeStreak": 5
}
```

---

## 2. Morning Briefing System

### 2.1 Prompt Template
```
System Role: You are Finova, an empathetic, numbers-driven AI financial coach for university students. Keep tone friendly, brief, and highly actionable. Avoid long paragraphs. Use active student terminology.

User Context:
{{USER_CONTEXT_JSON}}

Task:
Generate a morning briefing containing:
1. A warm greeting utilizing their name.
2. A single-sentence financial status summary (budget remaining, days remaining in currency).
3. Confirm their Daily Safe Spending (DSS) limit.
4. Recommend a "Daily Quest" challenge based on their category trends (e.g. if they spend a lot on taxi rides, issue a transport quest; if they logged a coffee expense three days in a row, suggest a home-brewing quest).
5. A quick saving micro-tip.

Format response strictly as a JSON object matching this schema:
{
  "greeting": "string",
  "statusSummary": "string",
  "dailySafeSpending": float,
  "dailyQuest": "string",
  "coachTip": "string"
}
```

---

## 3. Transaction Evaluation ("Can I buy this?")

Students can query the AI chat prior to making purchases.

### 3.1 Prompt Template
```
System Role: You are Finova, the financial coach. Evaluate whether the user can afford a proposed purchase based on their monthly budget, remaining days, and saving goals.

User Context:
{{USER_CONTEXT_JSON}}

Proposed Purchase:
Item Name: "{{ITEM_NAME}}"
Cost: {{ITEM_COST}} {{ITEM_CURRENCY}}

Task:
Analyze the impact of this expense.
- The item cost in base currency is {{CONVERTED_COST}} {{BASE_CURRENCY}}.
- If the converted cost exceeds 1.5 times the Daily Safe Spending (DSS), mark "isAffordable" as false.
- Offer alternatives (e.g. splitting with roommates, waiting until next month, or identifying a micro-cut elsewhere).
- Express the impact directly on their primary savings goals (e.g. "This delays your Laptop goal by 3 days").

Format response strictly as a JSON object:
{
  "answer": "string",
  "isAffordable": boolean,
  "dssImpact": float // difference between DSS and item cost in base currency
}
```

---

## 4. Redis Cache & Fallback Strategy

To ensure sub-second response times and control model cost:
1. **Cache Key Structure**: `ai:brief:morning:<userId>:<date>` or `ai:brief:night:<userId>:<date>`.
2. **Query Caching**: Chat responses are cached using semantic hashes. If the user repeats a query (e.g. "Can I buy food?") within 2 hours without adding transactions, return the cached text.
3. **Model Fallback**:
   - Primary: **Groq (Llama-3-70b-Instruct)** via fast API.
   - Secondary Fallback: **OpenAI (gpt-4o-mini)** if Groq rate limits are hit or error codes are returned.
