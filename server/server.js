require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
const cors = require('cors')

// Models
const User = require('./models/User')
const Invoice = require('./models/Invoice')

const app = express()

// MongoDB stuff
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/payment-registry'

mongoose
    .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.error(err))


// Middleware
app.use(express.json())
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173"
app.use(cors({ origin: CLIENT_URL, credentials: true }))

// Routes
app.use('/api/users', require('./routes/users'))
app.use('/api/invoices', require('./routes/invoices'))
app.use('/api/auth', require('./routes/auth'))

app.listen(5000, () => console.log("we are rito"))