process.env.NTBA_FIX_319 = 1
const TelegramBot = require('node-telegram-bot-api')

require('dotenv').config({ silent: true })
const token = process.env.TELEGRAM_TOKEN
const bot = new TelegramBot(token, { polling: true })

const messageProcess1 = (state, text) => {
    switch (state) {
        case 'start':
            return text === '/start' && 'starting'
            break
        case 'name':
            return text === '/pay' && 'askName'
            break
        case 'balance':
            return text === '/pay' && 'askName'
            break
        case 'amount':
            return 'askAmount'
            break
        case 'details':
            return 'showDetails'
            break
        case 'confirm':
            if (text === 'yes') {
                return 'confirmed'
            } else if (text === 'no') {
                return 'cancelled'
            } else {
                return 'invalid'
            }
    }
}

module.exports = async (Model, userId) => {
    let initState = await Model.findOne({
        user: userId,
        status: { $ne: 'done' }
    })
    if (!initState) {
        initState = await Model.new({ user: userId }).save()
    }

    initState.observe({
        onStarting: async (event, message) => {
            const msg = replyProcess(event.transition)
            bot.sendMessage(message.chat.id, msg)
            await initState.save()
        },
        onBalanceChecking: async (event, message) => {
            const msg = replyProcess(event.transition)
            bot.sendMessage(message.chat.id, msg)
            await initState.save()
        },
        onAskName: async (event, message) => {
            const msg = replyProcess(event.transition)
            bot.sendMessage(message.chat.id, msg)
            await initState.save()
        },
        onAskAmount: async (event, message) => {
            initState.id = message.text
            await initState.save()
            const msg = replyProcess(event.transition)
            bot.sendMessage(message.chat.id, msg)
        },
        onShowDetails: async (event, message) => {
            initState.amount = message.text
            await initState.save()
            const msg = replyProcess(event.transition)
            bot.sendMessage(message.chat.id, msg)
        },
        onConfirmed: async (event, message) => {
            await initState.save()
            const msg = replyProcess(event.transition)
            bot.sendMessage(message.chat.id, msg)
        },
        onCancelled: async (event, message) => {
            await initState.save()
            const msg = replyProcess(event.transition)
            bot.sendMessage(message.chat.id, msg)
        },
        onInvalid: async (event, message) => {
            await initState.save()
            const msg = replyProcess(event.transition)
            bot.sendMessage(message.chat.id, msg)
        },
        onFinal: async (event, message) => {
            await initState.save()
            const msg = replyProcess(event.transition)
            bot.sendMessage(message.chat.id, msg)
        }
    })

    const messageProcess = (state, text) => {
        switch (state) {
            case 'start':
                return text === '/start' && 'starting'
                break
            case 'balance':
                return text === '/balance'
                    ? 'balanceChecking'
                    : text === '/pay' && 'askName'
                break
            case 'name':
                return 'askName'
                break
            case 'amount':
                return 'askAmount'
                break
            case 'confirm':
                if (text === 'yes') {
                    return 'confirmed'
                } else if (text === 'no') {
                    return 'cancelled'
                } else {
                    return 'invalid'
                }
                break
            case 'details':
                return 'showDetails'
                break
            case 'link':
                return 'final'
                break
        }
    }

    const replyProcess = event => {
        console.log(initState)

        switch (event) {
            case 'starting':
                return "Let's begin! To start a payment with /pay or /balance to check the balance"
                break
            case 'balanceChecking':
            case 'cancelled':
                return 'Your balance! To start a payment with /pay'
                break
            case 'askName':
                return "What's your ID?"
                break
            case 'askAmount':
                return 'How much you need to send?'
                break
            case 'showDetails':
            case 'invalid':
                return (
                    initState.amount +
                    ' sending to ' +
                    initState.id +
                    '. Please confirm (yes/no)'
                )
                break
            case 'confirmed':
                return 'Link here ......'
                break
            case 'final':
                return 'You can start again using /start'
                break
        }
    }

    bot.on('message', message => {
        console.log(initState.status)
        const event = messageProcess(initState.status, message.text)
        console.log(event)
        if (!event || initState.cannot(event)) {
            bot.sendMessage(
                message.chat.id,
                "I wasn't expecting that, try /start"
            )
        } else {
            initState[event](message)
        }
    })
}
