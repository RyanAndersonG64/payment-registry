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
        <input type="text" placeholder="Username" value={name} onChange={(e) => setName(e.target.value)} />
        <br></br>
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button
          type="button"
          onClick={() => {
            console.log('REGISTER BUTTON CLICKED')
            console.log(name, password)
            createUser({ name, password })
              .then(response => {
                console.log('REGISTER RESPONSE: ', response)
                navigate('/login')
              })
              .catch(error => {
                console.log('ERROR: ', error)
                alert('Error registering user')
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