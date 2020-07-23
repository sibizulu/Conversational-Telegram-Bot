process.env.NTBA_FIX_319 = 1
const TelegramBot = require('node-telegram-bot-api')

require('dotenv').config({ silent: true })
const token = process.env.TELEGRAM_TOKEN
const bot = new TelegramBot(token, { polling: true })

const messageProcess = (state, text) => {
    switch (state) {
        case 'start':
            return text === '/start' && 'starting'
            break
        case 'name':
            return text === '/pay' && 'askName'
            break
        case 'amount':
            return 'askAmount'
            break
        case 'details':
            return 'showDetails'
            break
    }
}

const replyProcess = event => {
    switch (event) {
        case 'starting':
            return "Let's begin! To start a payment with /pay"
            break
        case 'askName':
            return "What's your ID?"
            break
        case 'askAmount':
            return 'How much you need to send?'
            break
        case 'showDetails':
            return 'Show the info!'
            break
    }
}

module.exports = async (Model, userId) => {
    let initState = await Model.findOne({ user: userId })
    if (!initState) {
        initState = await Model.new({ user: userId }).save()
    }

    initState.observe({
        onStarting: async (message, text) => {
            await initState.save()
        },
        onAskName: async (message, text) => {
            await initState.save()
        },
        onAskAmount: async (message, text) => {
            initState.id = text
            await initState.save()
        },
        onShowDetails: async (message, text) => {
            initState.amount = text
            await initState.save()
        }
    })

    bot.on('message', message => {
        const event = messageProcess(initState.status, message.text)
        console.log(event)
        if (!event || initState.cannot(event)) {
            bot.sendMessage(
                message.chat.id,
                "I wasn't expecting that, try /start"
            )
        } else {
            console.log(initState[event])
            initState[event](message.text)

            const newMessage = replyProcess(event)
            bot.sendMessage(message.chat.id, newMessage)
        }
    })
}
