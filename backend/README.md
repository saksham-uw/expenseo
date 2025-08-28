# Expenseo Backend

This is the backend API for Expenseo, an expense tracking application. It is built with AdonisJS (v6) and uses a PostgreSQL database.

## Getting Started

The backend is designed to be run with Docker. From the root of the project, run:

```bash
docker-compose up --build
```

The API will be available at `http://localhost:3333`.

### Database

- The service uses a PostgreSQL 16 database.
- Default credentials (user/password): `postgres` / `postgres`
- Database name: `expenses`
- On the first run, migrations will be automatically applied to set up the necessary tables.

## API Endpoints

- `POST /transactions`
    - Creates a new transaction.
    - **Body**:
        ```json
        {
          "amount": 12.34,
          "currency": "USD",
          "date": "2025-08-27",
          "description": "coffee",
          "category": "Food"
        }
        ```
    - **Returns**: `201 Created` with the created transaction object.

- `GET /transactions`
    - Retrieves a list of all transactions, sorted by most recent first.
    - **Optional Query Parameters**:
        - `startDate` (YYYY-MM-DD)
        - `endDate` (YYYY-MM-DD)

- `GET /balances`
    - Returns an object with the sum of expenses for each category.
    - **Example Response**:
        ```json
        { "Food": 12.34, "Transport": 20.5 }
        ```

## Running Tests

To run the test suite, you can execute the test command inside the running `backend` container:

```bash
docker-compose exec backend npm test
```
