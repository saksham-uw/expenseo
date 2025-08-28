# Expenseo Frontend

This is the frontend for **Expenseo**, built with Vue 3, Vite, and TypeScript.  

---

## 🚀 Running (via Docker)

From project root:
```bash
docker-compose up --build
````

The frontend will be available at:
👉 [http://localhost:5173](http://localhost:5173)

---

## 🔌 API Integration

* Uses Axios client defined in `src/lib/api.ts`
* API base URL is set via `VITE_API_URL` in `.env`
* Expects backend to be running at [http://localhost:3333](http://localhost:3333)

---

## 📋 Features

* **Add Transaction form** → POST `/transactions`
* **Transactions table** → GET `/transactions`
* **Summary view** → GET `/balances`

---

## 🛠️ Development Notes

* Hot-reload supported via Vite
* Type definitions in `src/types.ts`
* Styling: basic CSS for MVP (later polished with shadcn-vue)

---
