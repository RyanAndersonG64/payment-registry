const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    number: {
        type: Number,
        required: true,
        unique: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    paid: {
        type: Boolean,
        default: false,
    },
    paidDate: {
        type: Date,
        default: null,
        required: false,
    },

})

module.exports = mongoose.model('Invoice', invoiceSchema)
