const express = require('express')
const User = require('../models/User')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const authMiddleware = require('../middleware/authMiddleware')

const router = express.Router()

//Register
router.post('/register', async (req, res) => {
    const { name, password } = req.body

    try {
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await User.create({ name, password: hashedPassword })
        res.status(201).json(user)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})

//Change Password
router.post('/change-password', async (req, res) => {
    const { name, password } = req.body
    try {
        const user = await User.findOne({ name: name})
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }
        user.password = await bcrypt.hash(password, 10)
        await user.save()
        res.status(200).json({ message: 'Password changed successfully' })
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

        const expiresInSeconds = parseInt(process.env.JWT_EXPIRES_IN_SECONDS || '3600', 10)
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: expiresInSeconds })

        // Set httpOnly cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: expiresInSeconds * 1000,
        })
        res.json({ user })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }

})

//Logout
router.post('/logout', async (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    })
    res.json({ message: 'Logged out' })
})

// Keep user logged in on refresh
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId)
        if (!user) return res.status(404).json({ error: 'User not found' })
        res.json({ user })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

module.exports = router