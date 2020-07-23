module.exports = {
    init: 'start',
    data: {
        id: '',
        amount: 0
    },
    transitions: [
        { name: 'starting', from: 'start', to: 'name' },
        { name: 'askName', from: 'name', to: 'amount' },
        { name: 'askAmount', from: 'amount', to: 'details' },
        { name: 'showDetails', from: 'details', to: 'done' }
    ]
}
