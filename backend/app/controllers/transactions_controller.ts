import { DateTime } from 'luxon'
import type { HttpContext } from '@adonisjs/core/http'
import Transaction from '#models/transaction'
import vine from '@vinejs/vine'

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
    public async index({ request }: HttpContext) {
        // optional filters: startDate, endDate (YYYY-MM-DD)
        const { startDate, endDate } = request.qs()

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
}
