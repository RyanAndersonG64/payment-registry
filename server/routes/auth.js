const express = require('express')
const User = require('../models/User')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const router = express.Router()

//Register
router.post('/register', async (req, res) => {
    const { name, password } = req.body

    try {
        const user = await User.create({ name, password })
        res.status(201).json(user)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})

//Login
router.post('/login', async (req, res) => {
    const { name, password } = req.body

    try {
        const user = await User.findOne({ name })
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' })
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
        res.json({ token })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }

})

module.exports = router