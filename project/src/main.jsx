import { React, StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AuthContext } from './contexts/AuthContext'
import { UserContext } from './contexts/UserContext'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import App from './App.jsx'
import Login from './login.jsx'
import Register from './register.jsx'

const AuthContextProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState('')

  const auth = {
    accessToken,
    setAccessToken,
  }

  return (
    <AuthContext.Provider value={{ auth }} >
      {children}
    </AuthContext.Provider>
  )
}

const UserContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState([])

  const userContext = {
    currentUser,
    setCurrentUser,
  }

  return (
    <UserContext.Provider value={{ userContext }} >
      {children}
    </UserContext.Provider>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthContextProvider>
      <UserContextProvider>
        <Router>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </Router>
      </UserContextProvider>
    </AuthContextProvider>
  </StrictMode>,
)