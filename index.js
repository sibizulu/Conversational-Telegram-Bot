const stateMachinePlugin = require('@rentspree/mongoose-state-machine').default
const mongoose = require('mongoose')
const stateMachine = require('./src/stateMachine.js')
const TelegramBot = require('./src/telegramBot.js')

require('./mongodb.js')()

const paymentSchema = new mongoose.Schema({
    user: String,
    id: String,
    amount: String,
    status: String,
    frequency: String
})

paymentSchema.plugin(stateMachinePlugin, { stateMachine: stateMachine })
const Payment = mongoose.model('Payment', paymentSchema)

const userId = '5f1873e0f353531f8a36b144'
TelegramBot(Payment, userId)
