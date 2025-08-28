import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'

test.group('Balances aggregation', (group) => {
  group.each.setup(async () => {
    await db.rawQuery('TRUNCATE TABLE transactions RESTART IDENTITY CASCADE')
  })

  test('sums amounts per category', async ({ assert }) => {
    await db.table('transactions').insert([
      { amount: 10.00, currency: 'USD', date: '2025-08-01', description: 'a', category: 'Food' },
      { amount:  5.25, currency: 'USD', date: '2025-08-02', description: 'b', category: 'Food' },
      { amount: 20.00, currency: 'USD', date: '2025-08-03', description: 'c', category: 'Transport' },
      { amount:  3.75, currency: 'USD', date: '2025-08-04', description: 'd', category: 'Misc' },
    ])

    const rows = await db.from('transactions')
      .select('category')
      .sum({ total: 'amount' })
      .groupBy('category')

    const map: Record<string, number> = {}
    rows.forEach((r: any) => { map[r.category] = parseFloat(r.total) })

    assert.closeTo(map['Food'] ?? 0, 15.25, 0.001)
    assert.closeTo(map['Transport'] ?? 0, 20.00, 0.001)
    assert.closeTo(map['Misc'] ?? 0, 3.75, 0.001)
  })
})
