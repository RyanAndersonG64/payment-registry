import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from './contexts/AuthContext'
import './App.css'
import { createUser } from './api'

function Register() {
  const { auth } = useContext(AuthContext)
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()

  return (
    <div>
      <h1>Register</h1>
      <form>
        <input className="login-component" type="text" placeholder="Username" value={name} onChange={(e) => setName(e.target.value)} />
        <br></br>
        <input className="login-component" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <br></br>
        <button className="login-component"
          type="button"
          onClick={() => {
            createUser({ name, password })
              .then(response => {
                navigate('/login')
              })
              .catch(error => {
                console.log('ERROR: ', error)
              })
          }}
        >
          Create Account
        </button>
      </form>
    </div>
  )
}

export default Register