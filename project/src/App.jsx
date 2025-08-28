import { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from './contexts/AuthContext'
import { UserContext } from './contexts/UserContext'
import './App.css'
import { getUser, logout } from './api'

function App() {
  const { auth } = useContext(AuthContext)
  const { userContext } = useContext(UserContext)
  const [currentUser, setCurrentUser] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    if (userContext.currentUser && (!Array.isArray(userContext.currentUser) || userContext.currentUser.length !== 0)) {
      setCurrentUser(userContext.currentUser)
      return
    }

    // Keep user logged in on refresh
    getUser({ userContext })
      .then((response) => {
        if (response?.data?.user) {
          userContext.setCurrentUser(response.data.user)
          setCurrentUser(response.data.user)
        } else {
          navigate('/login')
        }
      })
      .catch(() => {
        navigate('/login')
      })
  }, [])

  return (
    <div className='app'>
      <div className='app-header'>
        {currentUser.name}
        <button onClick={() => {
          logout({ userContext })
            .then(() => {
              navigate('/login')
            })
            .catch(() => {
              alert('Error logging out')
            })
        }}>Logout</button>
      </div>
      <div className='app-body'>
        <h1>SOON MAY THE MONKEY BALL ROLL</h1>
      </div>
    </div>
  )
}

export default App