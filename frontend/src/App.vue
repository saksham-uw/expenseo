<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from './lib/api'
import type { Transaction, Balances } from './types/transactions'

// shadcn-vue components
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from '@/components/ui/table'

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
  <main class="p-6 max-w-6xl mx-auto space-y-6">
    <h1 class="text-3xl font-semibold tracking-tight">📒 Expenseo - Lightweight Expense Tracker</h1>

    <!-- Summary -->
    <Card>
      <CardHeader class="flex items-center justify-between">
        <CardTitle>Summary (by category)</CardTitle>
        <Button variant="outline" size="sm" :disabled="balancesLoading" @click="fetchBalances">
          {{ balancesLoading ? 'Refreshing…' : 'Refresh' }}
        </Button>
      </CardHeader>
      <CardContent>
        <div v-if="balancesError" class="text-red-600 text-sm mb-2">{{ balancesError }}</div>

        <div class="grid gap-3 sm:grid-cols-3">
          <div v-for="(total, cat) in balances" :key="cat" class="rounded-xl border p-4">
            <div class="text-sm text-muted-foreground">{{ cat }}</div>
            <div class="text-2xl font-semibold">{{ total.toFixed(2) }}</div>
          </div>

          <div v-if="!balancesLoading && Object.keys(balances).length === 0" class="text-sm text-muted-foreground">
            No data yet
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Add Transaction -->
    <Card>
      <CardHeader>
        <CardTitle>Add Transaction</CardTitle>
      </CardHeader>
      <CardContent>
        <form class="grid gap-4 sm:grid-cols-2" @submit.prevent="submit">
          <div class="grid gap-2">
            <Label for="amount">Amount</Label>
            <Input id="amount" type="number" step="0.01" v-model.number="form.amount" required min="0" />
          </div>

          <div class="grid gap-2">
            <Label for="currency">Currency (3 letters)</Label>
            <Input id="currency" maxlength="3" v-model="form.currency" required />
          </div>

          <div class="grid gap-2">
            <Label for="date">Date</Label>
            <Input id="date" type="date" v-model="form.date" required />
          </div>

          <div class="grid gap-2">
            <Label for="category">Category</Label>
            <Input id="category" v-model="form.category" required />
          </div>

          <div class="sm:col-span-2 grid gap-2">
            <Label for="description">Description</Label>
            <Input id="description" v-model="form.description" />
          </div>

          <div class="sm:col-span-2 flex items-center gap-3">
            <Button type="submit" :disabled="loading">
              {{ loading ? 'Saving…' : 'Add Transaction' }}
            </Button>
            <span v-if="message" class="text-green-600 text-sm">{{ message }}</span>
            <span v-if="error" class="text-red-600 text-sm">{{ error }}</span>
          </div>
        </form>
      </CardContent>
    </Card>

    <!-- Transactions -->
    <Card>
      <CardHeader class="flex items-center justify-between">
        <CardTitle>Transactions</CardTitle>
        <Button variant="outline" size="sm" :disabled="listLoading" @click="fetchTransactions">
          {{ listLoading ? 'Refreshing…' : 'Refresh' }}
        </Button>
      </CardHeader>
      <CardContent>
        <div v-if="listError" class="text-red-600 text-sm mb-2">{{ listError }}</div>

        <Table class="text-sm">
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Currency</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="t in transactions" :key="t.id">
              <TableCell>{{ t.date }}</TableCell>
              <TableCell>{{ t.description }}</TableCell>
              <TableCell>{{ t.category }}</TableCell>
              <TableCell>{{ Number(t.amount).toFixed(2) }}</TableCell>
              <TableCell>{{ t.currency }}</TableCell>
            </TableRow>
            <TableRow v-if="!listLoading && transactions.length === 0">
              <TableCell colspan="5" class="text-center text-muted-foreground">No transactions yet</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </main>
</template>
