import { useState, useContext } from 'react'
import { AuthContext } from './contexts/AuthContext'
import './App.css'
import { getToken } from './api'

function Login() {
  const { auth } = useContext(AuthContext)
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")

  return (
    <div>
      <h1>Login</h1>
      <form>
        <input type="text" placeholder="Username" value={name} onChange={(e) => setName(e.target.value)} />
        <br></br>
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button onClick={() => {
          getToken({ auth, name, password })
        }}
        >
        </button>
      </form>
    </div>
  )
}

export default Login