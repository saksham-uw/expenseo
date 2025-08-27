<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from './lib/api'
import type { Transaction, Balances } from './types/transactions'

/** --- Add Transaction form state --- */
const form = ref<Transaction>({
  amount: 0,
  currency: 'USD',
  date: new Date().toISOString().slice(0, 10),
  description: '',
  category: 'General',
})
const loading = ref(false)
const message = ref<string | null>(null)
const error = ref<string | null>(null)

/** --- Transactions list state --- */
const transactions = ref<Transaction[]>([])
const listLoading = ref(false)
const listError = ref<string | null>(null)

/** --- Balances (summary) state --- */
const balances = ref<Balances>({})
const balancesLoading = ref(false)
const balancesError = ref<string | null>(null)

async function fetchTransactions() {
  listError.value = null
  listLoading.value = true
  try {
    const { data } = await api.get<Transaction[]>('/transactions')
    transactions.value = data
  } catch (e: any) {
    listError.value = e?.response?.data?.message || 'Failed to load transactions'
  } finally {
    listLoading.value = false
  }
}

async function fetchBalances() {
  balancesError.value = null
  balancesLoading.value = true
  try {
    const { data } = await api.get<Balances>('/balances')
    balances.value = data
  } catch (e: any) {
    balancesError.value = e?.response?.data?.message || 'Failed to load balances'
  } finally {
    balancesLoading.value = false
  }
}

async function submit() {
  message.value = null
  error.value = null
  loading.value = true
  try {
    await api.post('/transactions', {
      amount: Number(form.value.amount),
      currency: String(form.value.currency).toUpperCase(),
      date: form.value.date,
      description: form.value.description ?? '',
      category: form.value.category,
    })
    message.value = 'Transaction added!'
    form.value.amount = 0
    form.value.description = ''
    await fetchTransactions()
    await fetchBalances()
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Failed to add transaction'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchTransactions()
  fetchBalances()
})
</script>

<template>
  <main class="p-6 max-w-5xl mx-auto space-y-6">
    <h1 class="text-2xl font-semibold">Mini Expense Tracker</h1>

    <!-- Summary -->
    <section class="border rounded-xl p-4">
      <div class="flex items-center justify-between mb-3">
        <h2 class="font-medium">Summary (by category)</h2>
        <button class="border rounded px-3 py-1 text-sm" @click="fetchBalances" :disabled="balancesLoading">
          {{ balancesLoading ? 'Refreshing…' : 'Refresh' }}
        </button>
      </div>

      <div v-if="balancesError" class="text-red-600 text-sm mb-2">{{ balancesError }}</div>

      <div class="grid gap-3 sm:grid-cols-3">
        <div v-for="(total, cat) in balances" :key="cat" class="border rounded-lg p-3">
          <div class="text-sm text-gray-600">{{ cat }}</div>
          <div class="text-xl font-semibold">{{ total.toFixed(2) }}</div>
        </div>
        <div v-if="!balancesLoading && Object.keys(balances).length === 0" class="text-sm text-gray-500">
          No data yet
        </div>
      </div>
    </section>

    <!-- Add Transaction -->
    <section class="border rounded-xl p-4 space-y-3">
      <h2 class="font-medium">Add Transaction</h2>

      <form class="grid gap-3 sm:grid-cols-2" @submit.prevent="submit">
        <div>
          <label class="block text-sm mb-1">Amount</label>
          <input type="number" step="0.01" v-model.number="form.amount" class="w-full border rounded p-2" required
            min="0" />
        </div>

        <div>
          <label class="block text-sm mb-1">Currency (3 letters)</label>
          <input v-model="form.currency" maxlength="3" class="w-full border rounded p-2" required />
        </div>

        <div>
          <label class="block text-sm mb-1">Date</label>
          <input type="date" v-model="form.date" class="w-full border rounded p-2" required />
        </div>

        <div>
          <label class="block text-sm mb-1">Category</label>
          <input v-model="form.category" class="w-full border rounded p-2" required />
        </div>

        <div class="sm:col-span-2">
          <label class="block text-sm mb-1">Description</label>
          <input v-model="form.description" class="w-full border rounded p-2" />
        </div>

        <div class="sm:col-span-2 flex items-center gap-3">
          <button class="border rounded px-4 py-2" :disabled="loading" type="submit">
            {{ loading ? 'Saving…' : 'Add Transaction' }}
          </button>
          <span v-if="message" class="text-green-600 text-sm">{{ message }}</span>
          <span v-if="error" class="text-red-600 text-sm">{{ error }}</span>
        </div>
      </form>
    </section>

    <!-- Transactions List -->
    <section class="border rounded-xl p-4">
      <div class="flex items-center justify-between mb-3">
        <h2 class="font-medium">Transactions</h2>
        <button class="border rounded px-3 py-1 text-sm" @click="fetchTransactions" :disabled="listLoading">
          {{ listLoading ? 'Refreshing…' : 'Refresh' }}
        </button>
      </div>

      <div v-if="listError" class="text-red-600 text-sm mb-2">{{ listError }}</div>

      <table class="w-full border-collapse">
        <thead>
          <tr class="text-left border-b">
            <th class="py-2">Date</th>
            <th>Description</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Currency</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in transactions" :key="t.id" class="border-b">
            <td class="py-2">{{ t.date }}</td>
            <td>{{ t.description }}</td>
            <td>{{ t.category }}</td>
            <td>{{ Number(t.amount).toFixed(2) }}</td>
            <td>{{ t.currency }}</td>
          </tr>
          <tr v-if="!listLoading && transactions.length === 0">
            <td class="py-4 text-center text-sm text-gray-500" colspan="5">No transactions yet</td>
          </tr>
        </tbody>
      </table>
    </section>
  </main>
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
