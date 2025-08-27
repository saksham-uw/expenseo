<script setup lang="ts">
import { ref } from 'vue'
import { api } from './lib/api'
import type { Transaction } from './types/transactions'

const form = ref<Transaction>({
  amount: 0,
  currency: 'USD',
  date: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
  description: '',
  category: 'General',
})

const loading = ref(false)
const message = ref<string | null>(null)
const error = ref<string | null>(null)

async function submit() {
  message.value = null
  error.value = null
  loading.value = true
  try {
    // backend expects amount number, currency 3 letters, date 'YYYY-MM-DD'
    await api.post('/transactions', {
      amount: Number(form.value.amount),
      currency: String(form.value.currency).toUpperCase(),
      date: form.value.date,
      description: form.value.description ?? '',
      category: form.value.category,
    })

    message.value = 'Transaction added!'
    // reset a few fields
    form.value.amount = 0
    form.value.description = ''
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Failed to add transaction'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="p-6 max-w-3xl mx-auto">
    <h1 class="text-2xl font-semibold mb-4">Mini Expense Tracker</h1>

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

        <div class="sm:col-span-2">
          <button class="border rounded px-4 py-2" :disabled="loading" type="submit">
            {{ loading ? 'Saving…' : 'Add Transaction' }}
          </button>
        </div>
      </form>

      <p v-if="message" class="text-green-600 text-sm">{{ message }}</p>
      <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>
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
