export type Transaction = {
    id?: number
    amount: number | string
    currency: string
    date: string
    description?: string
    category: string
}

export type Balances = Record<string, number>
