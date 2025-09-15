import { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from './contexts/AuthContext'
import { UserContext } from './contexts/UserContext'
import './App.css'
import { getUser, logout, getInvoices, createInvoice, updateInvoice, deleteInvoice } from './api'

function App() {
  const navigate = useNavigate()
  const { auth } = useContext(AuthContext)
  const { userContext } = useContext(UserContext)

  const [currentUser, setCurrentUser] = useState(userContext.currentUser)
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)

  const [numberToUpdate, setNumberToUpdate] = useState('')
  const [amountToUpdate, setAmountToUpdate] = useState('')


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



  // Update Invoice
  function sendInvoiceUpdate(invoice) {
    updateInvoice({ auth, invoice })
      .then(() => {
        getInvoices({ auth, user: currentUser._id })
          .then((response) => {
            setInvoices(response.data.invoices)
          })
      })
  }




  //TODO: Add a way to edit a payment in the registry



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
          {invoices.sort((a, b) => a.number - b.number).map(invoice => (
            <div key={invoice._id} className='invoice-cell' style={{ color: invoice.paid ? 'green' : 'red' }}>
              <input type='number'
                defaultValue={invoice.number}

                //update invoice number
                onChange={(e) => {
                  setNumberToUpdate(e.target.value)
                }}

                // on blur or enter, check if numberToUpdate is a positive whole number and send the update
                onBlur={(e) => {

                  if (numberToUpdate === '') {
                    e.target.value = invoice.number
                    return
                  }

                  if (isNaN(numberToUpdate) || numberToUpdate % 1 !== 0 || numberToUpdate < 0) {
                    alert('Number must be a positive whole number')
                    e.target.value = invoice.number
                    setNumberToUpdate('')
                    return
                  }

                  if (numberToUpdate === invoice.number) {
                    return
                  }

                  const existingInvoice = invoices.find(invoice => invoice.number === numberToUpdate)
                  if (existingInvoice) {
                    alert('Number already in use')
                    return
                  }

                  if (numberToUpdate !== '') {
                    sendInvoiceUpdate({ _id: invoice._id, number: numberToUpdate })
                    setNumberToUpdate('')
                  }
                }}

                onKeyDown={(e) => {
                  if (e.key === 'Enter') {

                    if (numberToUpdate === '') {
                      e.target.value = invoice.number
                      return
                    }

                    if (isNaN(numberToUpdate) || numberToUpdate % 1 !== 0 || numberToUpdate < 0) {
                      alert('Number must be a positive whole number')
                      e.target.value = invoice.number
                      setNumberToUpdate('')
                      return
                    }


                    if (numberToUpdate === invoice.number) {
                      return
                    }
                    const existingInvoice = invoices.find(invoice => invoice.number === numberToUpdate)
                    if (existingInvoice) {
                      alert('Number already in use')
                      return
                    }
                    sendInvoiceUpdate({ _id: invoice._id, number: numberToUpdate })
                  }
                }}
                onKeyUp={(e) => {
                  if (e.key === 'Enter') {
                    setNumberToUpdate('')
                  }
                }}
              />
              &nbsp;&nbsp;
              $
              <input type='number'
                defaultValue={invoice.amount}

                //update invoice amount
                onChange={(e) => {
                  setAmountToUpdate(e.target.value)
                }}
                onBlur={(e) => {
                  if (amountToUpdate === '') {
                    e.target.value = invoice.amount
                    return
                  }

                  // check if amountToUpdate is a positive number with 2 decimal places
                  if (isNaN(amountToUpdate) || amountToUpdate < 0 || amountToUpdate.toString().split('.')[1]?.length !== 2) {
                    alert('Amount must be a positive number with 2 decimal places')
                    e.target.value = invoice.amount
                    setAmountToUpdate('')
                    return
                  }

                  if (amountToUpdate === invoice.amount) {
                    return
                  }


                  if (amountToUpdate !== '') {
                    sendInvoiceUpdate({ _id: invoice._id, amount: amountToUpdate })
                    setAmountToUpdate('')
                  }
                }}
              />
              <p>{invoice.paidDate ? `Paid on ${new Date(invoice.paidDate).toLocaleString().split(',')[0]}` : ''}</p>
              <button onClick={() => {
                if (confirm('Are you sure you want to update this invoice payment status?')) {
                  sendInvoiceUpdate({ _id: invoice._id, paid: !invoice.paid })
                }
              }}>
                {invoice.paid ? 'Mark as Unpaid' : 'Mark as Paid'}
              </button>
              <button onClick={() => {
                if (confirm('Are you sure you want to delete this invoice?')) {
                  deleteInvoice({ auth, invoice: { _id: invoice._id } })
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
                      alert('Error deleting invoice')
                    })
                }
              }}>
                Delete
              </button>
              <br></br>
              <br></br>
            </div>
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
      <div id = 'payment record'>
        <h3>Payment Record</h3>
        {/* map of paid invoices by paidDate */}
        {invoices.filter(invoice => invoice.paid).map(invoice => (
          <p key={invoice._id}>
            {invoice.paidDate ? ` ${new Date(invoice.paidDate).toLocaleString().split(',')[0]}: ${invoice.number}` : ''}
          </p>
        ))}
        <h4>
          Total Amount Paid: ${invoices.filter(invoice => invoice.paid).reduce((acc, invoice) => acc + invoice.amount, 0).toFixed(2)}
        </h4>
        <h4>
          {/* sum of all invoices that are not paid */}
          Total Amount Due: ${invoices.filter(invoice => !invoice.paid).reduce((acc, invoice) => acc + invoice.amount, 0)}
        </h4>
      </div>
    </div>
  )
}

export default App