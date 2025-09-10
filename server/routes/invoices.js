const express = require('express')
const router = express.Router()
const Invoice = require("../models/Invoice")

// Create invoice
router.post('/', async (req, res) => {
    try {
        const createdInvoice = await Invoice.create({ ...req.body.invoice })
        res.status(201).json(createdInvoice)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})

// Get invoices
router.get('/', async (req, res) => {
    try {
        const invoices = await Invoice.find({ user: req.query.user })
        res.json({ invoices })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// Update invoice
router.patch('/:invoiceId', async (req, res) => {
    try {
        let invoiceToUpdate = await Invoice.findById(req.params.invoiceId)
        if (!invoiceToUpdate) return res.status(404).json({ error: "Invoice not found" })

        const updates = req.body
        if (updates.number) {
            invoiceToUpdate.number = updates.number
        }

        if (updates.amount) {
            invoiceToUpdate.amount = updates.amount
        }

        if (updates.paid === true) {
            invoiceToUpdate.paid = updates.paid
            invoiceToUpdate.paidDate = new Date()
        }

        if (updates.paid === false) {
            invoiceToUpdate.paid = updates.paid
            invoiceToUpdate.paidDate = null
        }

        await invoiceToUpdate.save()

        res.json({ invoiceToUpdate })

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// Delete invoice
router.delete('/:invoiceId', async (req, res) => {
    try {
        await Invoice.findByIdAndDelete(req.params.invoiceId)
        res.json({ message: 'Invoice deleted' })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

module.exports = router