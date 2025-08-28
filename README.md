# Expenseo – Mini Expense Tracker

Expenseo is a simple full-stack expense tracking application built with:

- **Backend:** AdonisJS (TypeScript) + PostgreSQL  
- **Frontend:** Vue 3 + Vite (TypeScript)  
- **Infra:** Docker Compose for one-command setup

---

## 🚀 Quick Start

```bash
# from project root
docker-compose up --build
````

* Frontend: [http://localhost:5173](http://localhost:5173)
* Backend API: [http://localhost:3333](http://localhost:3333)
* Database: PostgreSQL 16
  ‣ User: `postgres` · Password: `postgres` · DB: `expenses`

> On first run, migrations are automatically applied by the backend.

---

## 📡 API Endpoints

### `POST /transactions`

Create a new transaction.

**Body:**

```json
{
  "amount": 12.34,
  "currency": "USD",
  "date": "2025-08-27",
  "description": "coffee",
  "category": "Food"
}
```

**Returns:** `201 Created` with the created transaction JSON.

---

### `GET /transactions`

List transactions (most recent first).

**Optional query params:**

* `startDate=YYYY-MM-DD`
* `endDate=YYYY-MM-DD`

---

### `GET /balances`

Get total expenses grouped by category.

**Example:**

```json
{ "Food": 12.34, "Transport": 20.50 }
```

---

## 🖥️ Frontend

MVP UI:

* Add Transaction form (POST)
* Transactions table (GET)
* Summary by category (GET)

Configuration:

* API base URL is set via `VITE_API_URL` in `frontend/.env`.

---

## 🛠️ Design Notes

* **Date-only** for transactions (`date` column), no time-of-day stored.
* **Amounts** stored as `numeric(14,2)` in Postgres; exposed as string, normalized in UI with `Number(...).toFixed(2)`.
* **Validation** done with VineJS on create.
* **Aggregation** uses SQL `SUM(...) GROUP BY category`.
* **Docker QoL:** frontend & backend run `npm ci` on container start; backend also auto-runs migrations.

---

## 🧪 Testing & Data Safety

The basic backend test **truncates** the `transactions` table to ensure isolation:

* This is safe for a **test database** only.
* Do **not** run tests against dev/prod data.

**Recommendation for real projects:**

* Use **separate databases** per environment:

  * `expenses_prod`, `expenses_dev`, `expenses_test`
* Provide dedicated env files:

  * `.env` (development), `.env.test` (test), `.env.production` (production)
* Run tests with `NODE_ENV=test` and point to `expenses_test`.
  Example (Docker):

  ```bash
  docker-compose exec -e NODE_ENV=test -e DB_DATABASE=expenses_test backend \\
    sh -lc "node ace migration:run --force && npm test"
  ```
* Add a small guard in tests to refuse `TRUNCATE` when `NODE_ENV !== 'test'`.

**Note for reviewers (interview context):**
For this assignment, the test intentionally truncates the table to keep the setup simple and deterministic. In a production-grade setup, I would:

1. Use a **separate test DB** loaded via `.env.test`.
2. **Auto-run migrations** for the test DB before the suite.
3. Add a **guard** to prevent destructive ops outside `NODE_ENV=test`.
4. In CI, spin up an isolated Postgres service and point tests to it.

---

## 🧪 Running Tests

```bash
# run inside backend container (uses current env DB settings)
docker-compose exec backend npm test
```

---

## 📂 Repo Hygiene

Commits are incremental and grouped by feature:

* Backend endpoints
* Frontend views
* Infrastructure tweaks
* Tests
* Documentation
