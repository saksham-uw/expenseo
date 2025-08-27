/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import TransactionsController from '#controllers/transactions_controller'
import router from '@adonisjs/core/services/router'

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router.get('/transactions', [TransactionsController, 'index'])
router.post('/transactions', [TransactionsController, 'store'])