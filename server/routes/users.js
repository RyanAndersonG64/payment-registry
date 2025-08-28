const express = require('express')
const router = express.Router()
const User = require("../models/User")

// Create user
router.post('/', async (req, res) => {
    try {

        const createdUser = await User.create({ ...req.body })
        res.status(201).json(createdUser)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})

// Get all users
router.get('/', async (req, res) => {
    try {
        const users = await User.find()
        res.json(users)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// Get user
router.get('/:userId', async (req, res) => {
    try {
        const user = await User.find({ name: req.body.name })
        res.json(user)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// Update User
router.patch('/:userId', async (req, res) => {
    try {
        let userToUpdate = await User.findById(req.params.userId)
        if (!userToUpdate) return res.status(404).json({ error: "User not found" })

        const updates = req.body
        if (updates.company) {
            userToUpdate.company = updates.company
        }

        if (updates.name) {
            userToUpdate.name = updates.name
        }

        if (updates.password) {
            userToUpdate.password = updates.password
        }

        await userToUpdate.save()

        res.json({ userToUpdate })

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

module.exports = router