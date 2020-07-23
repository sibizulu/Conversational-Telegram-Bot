process.env.NTBA_FIX_319 = 1
const TelegramBot = require('node-telegram-bot-api')

require('dotenv').config({ silent: true })
const token = process.env.TELEGRAM_TOKEN

const stateMachine = require('./stateMachine.js')

module.exports = () => {
    const bot = new TelegramBot(token, { polling: true })

    const eventFromStateAndMessageText = (state, text) => {
        switch (state) {
            case 'waitingstart':
                return text === '/start' && 'start'
                break
            case 'waitingname':
                return 'gotname'
                break
            case 'echoing':
                return text === '/stop' ? 'gotstop' : 'gottext'
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

    const messageProcess = async message => {
        const fsm = stateMachine()
        let lastReply = message

        let name
        let lastMessage

        console.log(fsm.start())

        fsm.onstart = () => {
            lastMessage = bot.sendMessage(
                message.chat.id,
                "Let's begin! What's your name?"
            )
        }

        while (!fsm.isFinished()) {
            let text = lastReply.text
            let event = eventFromStateAndMessageText(fsm.state, text)

            console.log(fsm)

            if (!event || fsm.cannot(event)) {
                bot.sendMessage(
                    message.chat.id,
                    "I wasn't expecting that, try /start"
                )
                break
            }

            fsm[event]()

            let sentMessage = await lastMessage
            lastReply = await new Promise(resolve =>
                bot.onReplyToMessage(
                    sentMessage.chat.id,
                    sentMessage.message_id,
                    resolve
                )
            )
        }
    }

    bot.on('message', message => {
        messageProcess(message)
        // const chatId = message.chat.id
        //
        // bot.sendMessage(chatId, 'Received your message')
    })
}
