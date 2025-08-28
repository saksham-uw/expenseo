# Expenseo Backend

AdonisJS v6 (TypeScript) + PostgreSQL.

## ▶️ Run (via Docker)

From the project root:
```bash
docker-compose up --build
````

API will be available at **[http://localhost:3333](http://localhost:3333)**.
Postgres runs with:

* User: `postgres`
* Password: `postgres`
* Database: `expenses`

On first run, migrations are automatically applied.

---

## 🔗 API Endpoints

* `POST /transactions` – create a transaction
* `GET /transactions` – list transactions (optional `startDate`, `endDate`)
* `GET /balances` – totals grouped by `category`

---

## 🧪 Tests & Data Safety

The basic aggregation test truncates the `transactions` table for clean state:

```ts
await db.rawQuery('TRUNCATE TABLE transactions RESTART IDENTITY CASCADE')
```

**Important:** only run this against a **test** database.

### Recommended environment split

* `.env` → development (e.g., `expenses_dev`)
* `.env.test` → test (e.g., `expenses_test`)
* `.env.production` → production (e.g., `expenses_prod`)

**Example (Docker) run for tests with a test DB:**

```bash
docker-compose exec -e NODE_ENV=test -e DB_DATABASE=expenses_test backend \\
  sh -lc "node ace migration:run --force && npm test"
```

**Guardrail (suggested):** add a check in your test setup to refuse truncation unless `NODE_ENV === 'test'`.

**Note for reviewers:**
For this take-home, truncation keeps tests deterministic without extra tooling. In a production setting, I would isolate test data via a dedicated test DB and CI service, load `.env.test`, and enforce environment guards for destructive operations.

---

## 🧰 Dev Notes

* `date` stored as **date-only** in DB
* `amount` stored as `numeric(14,2)` in Postgres
* VineJS validation on `POST /transactions`
* `/balances` uses SQL aggregation (`SUM` + `GROUP BY`)
* Docker dev flow: `npm ci` + migrations on container start