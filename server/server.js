require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
const cors = require('cors')
const cookieParser = require('cookie-parser')

// Models
const User = require('./models/User')
const Invoice = require('./models/Invoice')

const app = express()
app.set('trust proxy', 1)

// MongoDB stuff
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/payment-registry'

mongoose
    .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.error(err))


// Middleware
app.use(express.json())
const CLIENT_URLS = process.env.CLIENT_URLS || process.env.CLIENT_URL || "http://localhost:5173"
const allowedOrigins = CLIENT_URLS.split(',').map(s => s.trim())
app.use(cors({
	origin: (origin, callback) => {
		// allow requests with no origin (like mobile apps, curl) or allowed list
		if (!origin || allowedOrigins.includes(origin)) {
			return callback(null, true)
		}
		return callback(new Error('Not allowed by CORS'))
	},
	credentials: true
}))
app.use(cookieParser())

// Routes
app.get('/api/health', (req, res) => {
	res.json({ status: 'ok' })
})
app.use('/api/users', require('./routes/users'))
app.use('/api/invoices', require('./routes/invoices'))
app.use('/api/auth', require('./routes/auth'))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server listening on ${PORT}`))