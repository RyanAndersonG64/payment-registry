import { useState } from 'react'
import './App.css'
import { changePassword } from './api'
import { useNavigate } from 'react-router-dom'

function ChangePassword() {
    const [name, setName] = useState("")
    const navigate = useNavigate()

    const [newPassword, setNewPassword] = useState("")

    return (
        <div>
            <h1>Change Password</h1>
            <form>
                <input className="login-component" type="text" placeholder="Username" value={name} onChange={(e) => setName(e.target.value)} />
                <br></br>
                <input className="login-component" type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                <br></br>
                <button type="button" onClick={() => {
                    console.log(name)
                    changePassword({ name, password: newPassword })
                        .then(response => {
                            console.log('Password changed successfully')
                            navigate('/login')
                        })
                        .catch(error => {
                            console.log('ERROR: ', error)
                            alert('Error recovering user')
                        })
                }}>
                    Change Password
                </button>
            </form>
        </div>
    )
}

export default ChangePassword