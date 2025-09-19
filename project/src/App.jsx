import { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { AuthContext } from './contexts/AuthContext'
import { UserContext } from './contexts/UserContext'

import InvoiceDiv from './components/InvoiceDiv'
import './App.css'

import { getUser, logout, getInvoices, createInvoice } from './api'

function App() {
  const navigate = useNavigate()
  const { auth } = useContext(AuthContext)
  const { userContext } = useContext(UserContext)

  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(userContext.currentUser)
  const [invoices, setInvoices] = useState([])

  const [invoiceToSearch, setInvoiceToSearch] = useState(-1)

  const [Dates, setDates] = useState([])
  const [filter, setFilter] = useState('all')


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
          const paidDates = []
          response.data.invoices.forEach(invoice => {
            if (invoice.paidDate && !paidDates.includes(new Date(invoice.paidDate).toLocaleString().split(',')[0])) {
              paidDates.push(new Date(invoice.paidDate).toLocaleString().split(',')[0])
            }
          })
          setDates(paidDates)
        })
        .catch(() => {
          alert('Error getting invoices')
        })
    }
  }, [loading])

  // helper to allow children to trigger a refresh
  const refreshInvoices = () => {
    if (!currentUser || !currentUser._id) return
    getInvoices({ auth, user: currentUser._id })
      .then((response) => {
        setInvoices(response.data.invoices)
      })
      .catch(() => {
        alert('Error getting invoices')
      })
  }



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

        <select onChange={(e) => {
          setFilter(e.target.value)
          setInvoiceToSearch(-1)
        }}>

          <option value='all'>
            All
          </option>
          <option value='paid'>
            Paid
          </option>
          <option value='unpaid'>
            Unpaid
          </option>
        </select>

        <br></br><br></br>

        {/* invoice number search bar */}
        <input type='number'
          placeholder='Search invoice number'
          onChange={(e) => {
            setInvoiceToSearch(Number(e.target.value))
          }}
        />
        <br></br><br></br>

        {/* displayed invoices */}
        <div className='invoices'>

          {/* if invoiceToSearch is set, display the invoice with that number */}
          {(invoiceToSearch && invoices.find(invoice => invoice.number === invoiceToSearch)) ?
            <InvoiceDiv invoice={invoices.find(invoice => invoice.number === invoiceToSearch)} refreshInvoices={refreshInvoices} key={invoices.find(invoice => invoice.number === invoiceToSearch)._id} />

            // if filter is set to all, display all invoices
            : filter === 'all' ? invoices.sort((a, b) => a.number - b.number).map(invoice => (
              <InvoiceDiv invoice={invoice} refreshInvoices={refreshInvoices} key={invoice._id} />
            ))

              // if filter is set to paid, display all paid invoices
              : filter === 'paid' ? invoices.filter(invoice => invoice.paid).sort((a, b) => a.number - b.number).map(invoice => (
                <InvoiceDiv invoice={invoice} refreshInvoices={refreshInvoices} key={invoice._id} />
              ))

                // if filter is set to unpaid, display all unpaid invoices
                : invoices.filter(invoice => !invoice.paid).sort((a, b) => a.number - b.number).map(invoice => (
                  <InvoiceDiv invoice={invoice} refreshInvoices={refreshInvoices} key={invoice._id} />
                ))}
        </div>

        <br></br><br></br>

        {/* create invoice button */}
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
              getInvoices({ auth, user: currentUser._id })
                .then((response) => {
                  setInvoices(response.data.invoices)
                })
                .catch(() => {
                  alert('Error getting invoices')
                })
            })
            .catch(() => {
              alert('Error creating invoice')
            })
        }}>
          Create Invoice
        </button>
      </div>

      <div id='payment record'>
        <h3>Payment History</h3>
        {/* list of payment dates and the invoices that were paid on that date */}
        {Dates.map(date => (
          <p key={date}>{date}: {(invoices.filter(invoice => new Date(invoice.paidDate).toLocaleString().split(',')[0] === date)).map(invoice => invoice.number).join(', ')}</p>
        ))}

        <h4>
          Total Amount Paid: ${invoices.filter(invoice => invoice.paid).reduce((acc, invoice) => acc + invoice.amount, 0).toFixed(2)}
        </h4>
        <h4>
          {/* sum of all invoices that are not paid */}
          Total Amount Due: ${invoices.filter(invoice => !invoice.paid).reduce((acc, invoice) => acc + invoice.amount, 0).toFixed(2)}
        </h4>
      </div>

    </div>
  )
}

export default App