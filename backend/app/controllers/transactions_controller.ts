import { DateTime } from 'luxon'
import type { HttpContext } from '@adonisjs/core/http'
import Transaction from '#models/transaction'
import vine from '@vinejs/vine'
import db from '@adonisjs/lucid/services/db'

const createTransactionSchema = vine.compile(
    vine.object({
        amount: vine.number(),
        currency: vine.string().trim().toUpperCase().minLength(3).maxLength(3),
        date: vine.date({ formats: ['YYYY-MM-DD'] }),
        description: vine.string().maxLength(255).optional(),
        category: vine.string().trim().maxLength(64),
    })
)

export default class TransactionsController {
    public async index({ request, response }: HttpContext) {
        const { startDate, endDate } = request.qs()

        // Validate optional YYYY-MM-DD strings
        if (startDate && !DateTime.fromISO(startDate, { zone: 'utc' }).isValid) {
            return response.badRequest({ message: 'Invalid startDate. Expected YYYY-MM-DD.' })
        }
        if (endDate && !DateTime.fromISO(endDate, { zone: 'utc' }).isValid) {
            return response.badRequest({ message: 'Invalid endDate. Expected YYYY-MM-DD.' })
        }

        const query = Transaction.query().orderBy('date', 'desc').orderBy('id', 'desc')
        if (startDate) query.where('date', '>=', startDate)
        if (endDate) query.where('date', '<=', endDate)
        return await query
    }

    public async store({ request, response }: HttpContext) {
        const payload = await request.validateUsing(createTransactionSchema)

        const tx = await Transaction.create({
            amount: payload.amount.toFixed(2),
            currency: payload.currency.toUpperCase(),
            date: DateTime.fromISO(payload.date.toISOString()),
            description: payload.description ?? '',
            category: payload.category,
        })

        return response.created(tx)
    }

    public async balances() {
        const rows = await db.from('transactions')
            .select('category')
            .sum({ total: 'amount' })
            .groupBy('category')

        // normalize to { [category]: number }
        const result: Record<string, number> = {}
        rows.forEach((r: any) => {
            result[r.category] = parseFloat(r.total) || 0
        })

        return result
    }
}
