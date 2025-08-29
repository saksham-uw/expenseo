#!/usr/bin/env bash
set -euo pipefail

# Config

# override by: BACKEND_URL=http://127.0.0.1:3333 ./scripts/seed_transactions.sh
BACKEND_URL="${BACKEND_URL:-http://localhost:3333}"

# override by: COUNT=50 ./scripts/seed_transactions.sh
COUNT="${COUNT:-30}"

# Static pools so we don't rely on GNU date
DATES=(
  "2025-06-03" "2025-06-07" "2025-06-12" "2025-06-18" "2025-06-26"
  "2025-07-02" "2025-07-09" "2025-07-15" "2025-07-21" "2025-07-28"
  "2025-08-03" "2025-08-08" "2025-08-12" "2025-08-19" "2025-08-22" "2025-08-27"
)
CATEGORIES=("Food" "Transport" "General" "Entertainment" "Bills")
DESCRIPTIONS=("coffee" "lunch" "dinner" "groceries" "bus" "train" "taxi" "ride" "supplies" "subscription" "movie" "snacks" "misc")

rand() { echo $(( RANDOM )); }
pick() { local arr_name="$1[@]"; local arr=("${!arr_name}"); echo "${arr[$(( $(rand) % ${#arr[@]} ))]}"; }
pick_date() { echo "${DATES[$(( $(rand) % ${#DATES[@]} ))]}"; }

for ((i=1; i<=COUNT; i++)); do
  # amount: 5.00..75.00 with 2 decimals
  cents=$(( ( ( $(rand) % 7000 ) + 500 ) ))
  amount=$(awk -v n="$cents" 'BEGIN{printf "%.2f", n/100}')

  currency="USD"
  date="$(pick_date)"
  category="$(pick CATEGORIES)"
  description="$(pick DESCRIPTIONS)"

  payload=$(jq -n --arg amount "$amount" --arg currency "$currency" --arg date "$date" \
                 --arg description "$description" --arg category "$category" \
                 '{amount: ($amount|tonumber), currency: $currency, date: $date, description: $description, category: $category}')

  # Fallback if jq is not installed
  if ! command -v jq >/dev/null 2>&1; then
    payload="{\"amount\": $amount, \"currency\": \"$currency\", \"date\": \"$date\", \"description\": \"$description\", \"category\": \"$category\"}"
  fi

  echo "[$i/$COUNT] POST /transactions -> $date $category \$$amount"
  curl -s -X POST "$BACKEND_URL/transactions" \
    -H "Content-Type: application/json" \
    -d "$payload" >/dev/null || {
      echo "Request failed. Is backend running at $BACKEND_URL?" >&2
      exit 1
    }
done

echo "Done."