import { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from './contexts/AuthContext'
import { UserContext } from './contexts/UserContext'
import './App.css'
import { getUser, logout, getInvoices, createInvoice, updateInvoice, deleteInvoice } from './api'

function App() {
  const { auth } = useContext(AuthContext)
  const { userContext } = useContext(UserContext)
  const [currentUser, setCurrentUser] = useState(userContext.currentUser)
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)

  const navigate = useNavigate()

  useEffect(() => {
    if (userContext.currentUser) {
      setCurrentUser(userContext.currentUser)
      setLoading(false)
      return
    }

    // Keep user logged in on refresh
    getUser({ userContext })
      .then((response) => {
        if (response?.data?.user) {
          userContext.setCurrentUser(response.data.user)
          setCurrentUser(response.data.user)
          setLoading(false)
        } else {
          navigate('/login')
        }
      })
      .catch(() => {
        navigate('/login')
      })
  }, [])

  // Get invoices for the current user
  useEffect(() => {
    if (!loading) {
      if (!currentUser || !currentUser._id) return

      getInvoices({ auth, user: currentUser._id })
        .then((response) => {
          setInvoices(response.data.invoices)
        })
        .catch(() => {
          alert('Error getting invoices')
        })
    }
  }, [loading])

  // Create Invoice

  // Update Invoice

  // Delete Invoice

  //TODO: Add a way to view the payment registry
  //TODO: Add a way to add a payment to the registry
  //TODO: Add a way to edit a payment in the registry
  //TODO: Add a way to delete a payment from the registry


  return (
    <div className='app'>
      <div className='app-header'>
        {currentUser?.name || ''}
        <button onClick={() => {
          logout({ userContext })
            .then(() => {
              setCurrentUser(null)
              navigate('/login')
            })
            .catch(() => {
              alert('Error logging out')
            })
        }}>
          Logout
        </button>
      </div>
      <div className='app-body'>
        <h1>Invoices</h1>
        <div className='invoices'>
          {invoices.map(invoice => (
            <div key={invoice._id} className='invoice-cell' style={{ color: invoice.paid ? 'green' : 'red' }}>
              <h2>{invoice.number}</h2>
              <p>{invoice.amount}</p>
              <p>{invoice.paidDate ? invoice.paidDate.toLocaleDateString() : ''}</p>
              <button onClick={() => {
                updateInvoice({ auth, invoice: { _id: invoice._id, paid: !invoice.paid } })
              }}>
                {invoice.paid ? 'Mark as Unpaid' : 'Mark as Paid'}
              </button>
              <button onClick={() => {
                deleteInvoice({ auth, invoice: { _id: invoice._id } })
              }}>
                Delete
              </button>
            </div>
          ))}
        </div>
        <button onClick={() => {
          const newNumberInput = prompt('Enter invoice number')
          const newNumber = Number(newNumberInput)

          // check if newNumber is a number
          if (isNaN(newNumber)) {
            alert('Invoice number must be a number')
            return
          }

          // check if newNumber is a positive whole number
          if (newNumber % 1 !== 0 || newNumber < 0) {
            alert('Invoice number must be a positive whole number')
            return
          }

          // check if an invoice with this number and user already exists
          const existingInvoice = invoices.find(invoice => invoice.number === newNumber)
          console.log(existingInvoice)
          if (existingInvoice) {
            alert('Invoice with this number already exists')
            return
          }

          const newAmountInput = prompt('Enter invoice amount')
          const newAmount = Number(newAmountInput)
          // check if newAmount is a positive number
          if (isNaN(newAmount) || newAmount <= 0) {
            alert('Invoice amount must be a positive number')
            return
          }
          // check if newAmount has two decimal places
          if (newAmount.toString().split('.')[1]?.length !== 2) {
            alert('Invoice amount must be an amount of dollars and cents')
            return
          }

          createInvoice({ auth, invoice: { user: currentUser._id, number: newNumber, amount: newAmount } })
            .then(() => {
              console.log('Invoice created')
            })
            .catch(() => {
              alert('Error creating invoice')
            })
        }}>
          Create Invoice
        </button>
      </div>
    </div>
  )
}

export default App