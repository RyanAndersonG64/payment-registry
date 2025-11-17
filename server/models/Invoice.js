const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    number: {
        type: Number,
        required: true,
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

// Enforce uniqueness per user: a user can reuse numbers that exist for other users
invoiceSchema.index({ user: 1, number: 1 }, { unique: true })

module.exports = mongoose.model('Invoice', invoiceSchema)
