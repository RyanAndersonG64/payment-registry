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
      <h1>Payment Registry</h1>
      <h2>Login</h2>
      <form>
        <input type="text" className="login-component" placeholder="Username" value={name} onChange={(e) => setName(e.target.value)} />
        <br></br>
        <input type="password" className="login-component" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <br></br>
        <button
          type="button"
          style={{ 'marginBottom': '5px' }}
          onClick={() => {

            getToken({ auth, userContext, name, password })
              .then(response => {

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

      <a className="login-component" href="/changepassword">Forgot Password?</a>
      <br></br><br></br>
      <a className="login-component" href="/register">Don't have an account? Register Here</a>
    </div>
  )
}

export default Login