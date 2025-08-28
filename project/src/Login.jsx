import { useState, useContext } from 'react'
import { AuthContext } from './contexts/AuthContext'
import './App.css'
import { getToken } from './api'
import { useNavigate } from 'react-router-dom'

function Login() {
  const { auth } = useContext(AuthContext)
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
            getToken({ auth, name, password })
              .then(response => {
                console.log('LOGIN RESPONSE: ', response)
                navigate('/')
              })
              .catch(error => {
                console.log('ERROR: ', error)
                alert('Invalid username or password')
              })
          }}
        >
        </button>
      </form>
    </div>
  )
}

export default Login