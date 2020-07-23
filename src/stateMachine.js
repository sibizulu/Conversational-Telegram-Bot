module.exports = {
    init: 'start',
    transitions: [
        { name: 'starting', from: 'start', to: 'balance' },
        { name: 'balanceChecking', from: 'balance', to: 'name' },
        { name: 'askName', from: 'name', to: 'amount' },
        { name: 'askAmount', from: 'amount', to: 'details' },
        { name: 'showDetails', from: 'details', to: 'confirm' },
        { name: 'confirmed', from: 'confirm', to: 'link' },
        { name: 'cancelled', from: 'confirm', to: 'balance' },
        { name: 'invalid', from: 'confirm', to: 'confirm' },
        { name: 'final', from: 'link', to: 'done' }
    ]
}

// start, balance, name, amount, confirm, link
