process.env.NTBA_FIX_319 = 1
const TelegramBot = require('node-telegram-bot-api')

require('dotenv').config({ silent: true })
const token = process.env.TELEGRAM_TOKEN
const bot = new TelegramBot(token, { polling: true })

const messageProcess = (state, text) => {
    switch (state) {
        case 'waitingstart':
            return text === '/start' && 'gotstart'
            break
        case 'waitingname':
            return text === 'ramu' ? 'gotname' : 'gotinvalidname'
            break
        case 'waitingamount':
            return text === '10' ? 'gotamount' : 'gotinvalidamount'
            break
        case 'waitingfrequency':
            return text === 'week' ? 'gotfrequency' : 'gotinvalidfrequency'
            break
        case 'waitingdetails':
            return 'gotdetails'
            break

        case 'waitingconfirm':
            if (text.toLowerCase() === 'yes') {
                return 'gotconfirmed'
            } else if (text.toLowerCase() === 'no') {
                return 'gotcancelled'
            } else {
                return 'gotinvalid'
            }
        case 'waitinglink':
            return 'gotlink'
        case 'done':
            return 'waitingstart'
    }
}

const replyProcess = async (message, Model, userId) => {
    let initState = await Model.findOne({
        user: userId,
        status: { $ne: 'done' }
    })
    if (!initState) {
        initState = await Model.new({ user: userId }).save()
    }

    let lastReply = message

    let name
    let lastMessage

    initState.observe({
        onGotstart: async event => {
            lastMessage = bot.sendMessage(
                message.chat.id,
                replyMessage(event),
                {
                    reply_markup: JSON.stringify({ force_reply: true })
                }
            )
            await initState.save()
        },
        onGotinvalidname: async (event, message) => {
            lastMessage = bot.sendMessage(
                message.chat.id,
                replyMessage(event),
                {
                    reply_markup: JSON.stringify({ force_reply: true })
                }
            )
            await initState.save()
        },
        onGotname: async (event, message) => {
            console.log(message)
            initState.id = message.text
            lastMessage = bot.sendMessage(
                message.chat.id,
                replyMessage(event),
                {
                    reply_markup: JSON.stringify({ force_reply: true })
                }
            )
            await initState.save()
        },
        onGotinvalidamount: async (event, message) => {
            lastMessage = bot.sendMessage(
                message.chat.id,
                replyMessage(event),
                {
                    reply_markup: JSON.stringify({ force_reply: true })
                }
            )
            await initState.save()
        },
        onGotamount: async (event, message) => {
            initState.amount = message.text
            lastMessage = bot.sendMessage(
                message.chat.id,
                replyMessage(event),
                {
                    reply_markup: JSON.stringify({ force_reply: true })
                }
            )
            await initState.save()
        },
        onGotinvalidfrequency: async (event, message) => {
            lastMessage = bot.sendMessage(
                message.chat.id,
                replyMessage(event),
                {
                    reply_markup: JSON.stringify({ force_reply: true })
                }
            )
            await initState.save()
        },
        onGotfrequency: async (event, message) => {
            initState.frequency = message.text
            lastMessage = bot.sendMessage(
                message.chat.id,
                replyMessage(event),
                {
                    reply_markup: JSON.stringify({ force_reply: true })
                }
            )
            await initState.save()
        },

        onGotconfirmed: async (event, message) => {
            lastMessage = bot.sendMessage(message.chat.id, replyMessage(event))
            await initState.save()
        },
        onGotcancelled: async (event, message) => {
            lastMessage = bot.sendMessage(message.chat.id, replyMessage(event))
            await initState.save()
        },
        onGotinvalid: async (event, message) => {
            lastMessage = bot.sendMessage(message.chat.id, replyMessage(event))
            await initState.save()
        },
        onDone: async event => {
            await initState.save()
        }
    })

    while (initState.status != 'done') {
        console.log(initState)
        let text = lastReply.text
        let event = messageProcess(initState.status, text)

        if (!event || initState.cannot(event)) {
            bot.sendMessage(
                message.chat.id,
                "I wasn't expecting that, try /start"
            )
            break
        }

        initState[event](lastReply)
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

const replyMessage = event => {
    switch (event.transition) {
        case 'gotstart':
            return "Let's begin! Enter remune ID you want to send"
            break
        case 'gotinvalidname':
            return "Sorry, I didn't catch that name! Try Enter again"
            break
        case 'gotname':
            return 'How much you need to send?'
            break
        case 'gotinvalidamount':
            return 'Sorry, Enter some valid amount'
            break
        case 'gotamount':
            return 'Enter your frequency'
            break
        case 'gotinvalidfrequency':
            return 'Sorry, Enter some valid frequency'
            break
        case 'gotfrequency':
            return 'Please confirm (yes/no)?'
            break
        case 'gotconfirmed':
            return 'Link....'
            break
        case 'gotcancelled':
            return 'Alright, start with /start'
            break
        case 'gotinvalid':
            return "Sorry, I didn't catch that, do you want to cancel? (yes/no)"
            break
        default:
    }
}

module.exports = async (Model, userId) => {
    bot.on('message', message => {
        console.log('enter', message)
        if (!message.reply_to_message) {
            replyProcess(message, Model, userId)
        }
    })
}
