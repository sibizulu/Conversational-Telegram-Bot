process.env.NTBA_FIX_319 = 1
const TelegramBot = require('node-telegram-bot-api')

require('dotenv').config({ silent: true })
const token = process.env.TELEGRAM_TOKEN

const StateMachine = require('javascript-state-machine')
const visualize = require('javascript-state-machine/lib/visualize')

const mongoose = require('mongoose')
const stateMachinePlugin = require('@rentspree/mongoose-state-machine').default

mongoose
    .connect('mongodb://localhost/test', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('connection succesful'))
    .catch(err => console.error(err))

const stateMachine = {
    init: 'start',
    transitions: [
        { name: 'starting', from: 'start', to: 'name' },
        { name: 'askName', from: 'name', to: 'amount' },
        { name: 'askAmount', from: 'amount', to: 'details' },
        { name: 'showDetails', from: 'details', to: 'start' }
    ]
}

const paymentSchema = new mongoose.Schema({
    id: String,
    amount: String,
    status: String
})

paymentSchema.plugin(stateMachinePlugin, { stateMachine: stateMachine })

const Payment = mongoose.model('Payment', paymentSchema)

const person = Payment.new({})
person.starting()
console.log(person.state)

// Payment.create({
//     status: 'start'
// })

// Payment.findOne({
//     _id: '5f1855ca1fc9cb1b6dd0a8d1'
// }).then(person => {
//     console.log(person.status)
//     person.starting()
//     console.log(person.status)
// })

//
// const fsm1 = new FSM()
// //console.log(visualize(fsm1))
// fsm1.observe({
//     onStarting: () => {
//         console.log('stepped')
//     },
//     onAskName: () => {
//         console.log('entered state A')
//     },
//     onAskAmount: () => {
//         console.log('entered state A')
//     },
//     onShowDetails: () => {
//         console.log('entered state A')
//     }
// })
//
// const bot = new TelegramBot(token, { polling: true })
// const messageProcess = (state, text) => {
//     console.log(state)
//     switch (state) {
//         case 'start':
//             return text === '/start' && 'starting'
//             break
//         case 'name':
//             return text === '/pay' && 'askName'
//             break
//         case 'amount':
//             return 'askAmount'
//             break
//         case 'details':
//             return 'showDetails'
//             break
//     }
// }
// const replyProcess = event => {
//     switch (event) {
//         case 'starting':
//             return "Let's begin! To start a payment with /pay"
//             break
//         case 'askName':
//             return "What's your ID?"
//             break
//         case 'askAmount':
//             return 'How much you need to send?'
//             break
//         case 'showDetails':
//             return 'Show the info!'
//             break
//     }
// }
// bot.on('message', message => {
//     const event = messageProcess(fsm1.state, message.text)
//
//     let name
//     let amount
//
//     if (!event || fsm1.cannot(event)) {
//         bot.sendMessage(message.chat.id, "I wasn't expecting that, try /start")
//     } else {
//         fsm1[event]()
//         const newMessage = replyProcess(event)
//         bot.sendMessage(message.chat.id, newMessage)
//     }
// })
