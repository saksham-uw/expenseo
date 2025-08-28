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
  ‣ User: `postgres`
  ‣ Password: `postgres`
  ‣ DB: `expenses`

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

## 🛠️ Dev Notes & Design Decisions

* **Date-only** for transactions (`date` column), no time-of-day stored.
* **Amounts** stored as `numeric(14,2)` in Postgres; exposed as string, normalized in UI with `Number(...).toFixed(2)`.
* **Validation** done with VineJS on create.
* **Layering:**

  * Controllers handle validation + persistence
  * Aggregation (`/balances`) uses SQL `SUM(...) GROUP BY category`
* **Docker Dev Quality-of-Life:**

  * Frontend & backend run `npm ci` on container start (avoids missing node\_modules with bind mounts).
  * Backend auto-runs migrations on start.

---

## 🧪 Running Tests

Basic backend test suite is included:

```bash
# run inside backend container
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

---