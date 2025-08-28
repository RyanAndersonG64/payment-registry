import { useState, useContext } from 'react'
import { AuthContext } from './contexts/AuthContext'
import { UserContext } from './contexts/UserContext'
import './App.css'
import { getToken } from './api'
import { useNavigate } from 'react-router-dom'

function Login() {
  const { auth } = useContext(AuthContext)
  const { userContext } = useContext(UserContext)
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()

  return (
    <div>
      <h1>Login</h1>
      <form>
        <input type="text" placeholder="Username" value={name} onChange={(e) => setName(e.target.value)} />
        <br></br>
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button
          type="button"
          onClick={() => {
            console.log('LOGIN BUTTON CLICKED')
            console.log(name, password)
            getToken({ auth, userContext, name, password })
              .then(response => {
                console.log('LOGIN RESPONSE: ', response)
                if (response.status === 200) {
                  userContext.setCurrentUser(response.data.user)
                  navigate('/')
                }
              })
              .catch(error => {
                console.log('ERROR: ', error)
                alert('Invalid username or password')
              })
          }}
        >
          Login
        </button>
      </form>
    </div>
  )
}

export default Login