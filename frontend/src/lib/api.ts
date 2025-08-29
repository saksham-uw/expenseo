import axios from 'axios'

// Vite exposes only keys prefixed with VITE_
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3333'

export const api = axios.create({
  baseURL,
})

export const endpoints = {
  addTransaction: '/transactions',
  listTransactions: '/transactions',
  getBalances: '/balances',
}
