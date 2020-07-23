const mongoose = require('mongoose')

module.exports = function() {
    return new mongoose.Schema({
        id: String,
        amount: String,
        status: String
    })
}
