# Finova - API Endpoints Specification

## Version 1.0

This API spec lists the REST endpoints exposed by the NestJS backend and consumed by the Next.js 16 frontend. All requests/responses communicate using JSON payloads. Protected routes require a Bearer JWT token in the `Authorization` header.

---

## 1. Authentication & User Onboarding

### 1.1 User Register / Welcome Flow
- **Endpoint**: `POST /api/auth/register`
- **Authentication**: None
- **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@university.edu",
    "password": "SecurePassword123",
    "country": "Georgia",
    "college": "Tbilisi State University",
    "baseCurrency": "GEL"
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "message": "User registered successfully",
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "user-uuid-1",
      "email": "jane@university.edu",
      "name": "Jane Doe",
      "baseCurrency": "GEL"
    }
  }
  ```

### 1.2 User Login
- **Endpoint**: `POST /api/auth/login`
- **Authentication**: None
- **Request Body**:
  ```json
  {
    "email": "jane@university.edu",
    "password": "SecurePassword123"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "user-uuid-1",
      "name": "Jane Doe",
      "baseCurrency": "GEL"
    }
  }
  ```

### 1.3 Complete Onboarding setup
- **Endpoint**: `PATCH /api/auth/onboard`
- **Authentication**: Bearer JWT
- **Request Body**:
  ```json
  {
    "monthlyBudget": 500.0,
    "initialBalance": 200.0,
    "initialWalletName": "Cash",
    "initialWalletType": "CASH"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "onboardingCompleted": true
  }
  ```

---

## 2. Wallets System

### 2.1 Get All Wallets
- **Endpoint**: `GET /api/wallets`
- **Authentication**: Bearer JWT
- **Response** (`200 OK`):
  ```json
  [
    {
      "id": "wallet-uuid-1",
      "name": "Cash",
      "type": "CASH",
      "balance": 200.0,
      "currency": "GEL"
    },
    {
      "id": "wallet-uuid-2",
      "name": "Bank of Georgia",
      "type": "BANK_ACCOUNT",
      "balance": 1250.0,
      "currency": "GEL"
    }
  ]
  ```

### 2.2 Create Wallet
- **Endpoint**: `POST /api/wallets`
- **Authentication**: Bearer JWT
- **Request Body**:
  ```json
  {
    "name": "Wise Wallet",
    "type": "DIGITAL_WALLET",
    "balance": 150.0,
    "currency": "EUR"
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "id": "wallet-uuid-3",
    "name": "Wise Wallet",
    "type": "DIGITAL_WALLET",
    "balance": 150.0,
    "currency": "EUR"
  }
  ```

---

## 3. Transaction Operations

### 3.1 Log Transaction
- **Endpoint**: `POST /api/transactions`
- **Authentication**: Bearer JWT
- **Request Body**:
  ```json
  {
    "walletId": "wallet-uuid-1",
    "amount": 4.50,
    "currency": "GEL",
    "category": "Coffee",
    "type": "EXPENSE",
    "merchant": "Entree Cafe",
    "notes": "Morning double espresso",
    "date": "2026-07-17T08:30:00.000Z"
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "id": "tx-uuid-99",
    "walletId": "wallet-uuid-1",
    "amount": 4.50,
    "currency": "GEL",
    "convertedAmount": 1.67, // Converted into Base Currency USD
    "exchangeRate": 0.37,    // Exchange rate of GEL -> USD
    "category": "Coffee",
    "type": "EXPENSE",
    "merchant": "Entree Cafe",
    "date": "2026-07-17T08:30:00.000Z"
  }
  ```

### 3.2 List Transactions (with filtering)
- **Endpoint**: `GET /api/transactions?walletId=wallet-uuid-1&page=1&limit=20`
- **Authentication**: Bearer JWT
- **Response** (`200 OK`):
  ```json
  {
    "transactions": [
      {
        "id": "tx-uuid-99",
        "amount": 4.50,
        "currency": "GEL",
        "category": "Coffee",
        "type": "EXPENSE",
        "date": "2026-07-17T08:30:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "totalPages": 1
  }
  ```

---

## 4. Budgeting & Goals System

### 4.1 Update / Get Active Budgets
- **Endpoint**: `GET /api/budgets/active`
- **Authentication**: Bearer JWT
- **Response** (`200 OK`):
  ```json
  {
    "monthlyBudget": 500.0,
    "categoryBudgets": [
      { "category": "Food", "limit": 150.0, "spent": 42.50 },
      { "category": "Entertainment", "limit": 50.0, "spent": 0.0 }
    ],
    "dailySafeSpending": 14.75
  }
  ```

### 4.2 Set Savings Goal
- **Endpoint**: `POST /api/goals`
- **Authentication**: Bearer JWT
- **Request Body**:
  ```json
  {
    "name": "New Laptop",
    "targetAmount": 1200.0,
    "targetDate": "2026-12-31T00:00:00.000Z",
    "currentSaved": 100.0
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "id": "goal-uuid-1",
    "name": "New Laptop",
    "targetAmount": 1200.0,
    "currentSaved": 100.0,
    "health": "ON_TRACK",
    "monthlyRequired": 220.0,
    "estimatedCompletion": "2026-12-31T00:00:00.000Z"
  }
  ```

---

## 5. AI Coach Engine

### 5.1 Get Morning Briefing
- **Endpoint**: `GET /api/ai-coach/briefing/morning`
- **Authentication**: Bearer JWT
- **Response** (`200 OK`):
  ```json
  {
    "greeting": "Good Morning, Jane!",
    "statusSummary": "You have 14 days left this month. Remaining budget is $230.",
    "dailySafeSpending": 16.42,
    "dailyQuest": "Stay under budget and log at least 1 eco-friendly transit ride.",
    "coachTip": "You spent 15% more on Coffee this week. Brewing at home today could save you $5.00!"
  }
  ```

### 5.2 AI Chat Query ("Can I afford...")
- **Endpoint**: `POST /api/ai-coach/chat`
- **Authentication**: Bearer JWT
- **Request Body**:
  ```json
  {
    "message": "Can I afford to order pizza for $25 tonight?"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "answer": "Ordering a $25 pizza exceeds your Daily Safe Spending of $16.42. However, if you choose to cook at home tonight, you'll stay on track for your New Laptop savings goal! If you must order, try to split it with a roommate.",
    "isAffordable": false,
    "dssImpact": -8.58
  }
  ```

---

## 6. Gamification System

### 6.1 Get Active Streaks & Challenges
- **Endpoint**: `GET /api/gamification/status`
- **Authentication**: Bearer JWT
- **Response** (`200 OK`):
  ```json
  {
    "xp": 340,
    "currentStreak": 5,
    "highestStreak": 12,
    "activeQuests": [
      {
        "challengeId": "challenge-1",
        "name": "No Spend Day",
        "description": "Don't spend any money today",
        "xpReward": 50,
        "progress": 0.8
      }
    ]
  }
  ```

### 6.2 Get Leaderboard
- **Endpoint**: `GET /api/gamification/leaderboard`
- **Authentication**: Bearer JWT
- **Response** (`200 OK`):
  ```json
  [
    { "rank": 1, "name": "Heer P.", "xp": 1240, "streak": 21 },
    { "rank": 2, "name": "Jane D.", "xp": 340, "streak": 5 }
  ]
  ```

---

## 7. Finova Split (Expense Sharing)

### 7.1 Create Split Group
- **Endpoint**: `POST /api/split/groups`
- **Authentication**: Bearer JWT
- **Request Body**:
  ```json
  {
    "name": "Flat 5B Expenses",
    "memberEmails": ["roommate1@university.edu", "roommate2@university.edu"]
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "id": "group-uuid-88",
    "name": "Flat 5B Expenses",
    "members": [
      { "userId": "user-uuid-1", "name": "Jane Doe" },
      { "userId": "user-uuid-44", "name": "Roommate 1" }
    ]
  }
  ```

### 7.2 Log Split Expense
- **Endpoint**: `POST /api/split/groups/:groupId/expenses`
- **Authentication**: Bearer JWT
- **Request Body**:
  ```json
  {
    "description": "Internet Bill",
    "amount": 60.00,
    "currency": "GEL",
    "paidById": "user-uuid-1",
    "shares": [
      { "userId": "user-uuid-1", "amount": 30.00, "percentage": 50.0 },
      { "userId": "user-uuid-44", "amount": 30.00, "percentage": 50.0 }
    ]
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "success": true,
    "expenseId": "expense-uuid-10"
  }
  ```

### 7.3 Get Group Settlements / Balance Sheets
- **Endpoint**: `GET /api/split/groups/:groupId/balances`
- **Authentication**: Bearer JWT
- **Response** (`200 OK`):
  ```json
  {
    "balances": [
      { "userId": "user-uuid-44", "owesTo": "user-uuid-1", "amount": 30.00, "currency": "GEL" }
    ]
  }
  ```
