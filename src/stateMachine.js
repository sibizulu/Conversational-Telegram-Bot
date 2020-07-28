module.exports = {
    init: 'waitingstart',
    transitions: [
        { name: 'gotstart', from: 'waitingstart', to: 'waitingname' },
        { name: 'gotname', from: 'waitingname', to: 'waitingamount' },
        { name: 'gotamount', from: 'waitingamount', to: 'waitingfrequency' },
        {
            name: 'gotfrequency',
            from: 'waitingfrequency',
            to: 'waitingconfirm'
        },
        { name: 'gotconfirmed', from: 'waitingconfirm', to: 'done' },
        { name: 'gotcancelled', from: 'waitingconfirm', to: 'done' },
        { name: 'gotinvalid', from: 'waitingconfirm', to: 'waitingconfirm' }
    ]
}

// start, balance, name, amount, confirm, link
