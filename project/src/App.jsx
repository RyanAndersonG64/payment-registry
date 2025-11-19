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

  // states used for filtering and sorting invoices
  const [year, setYear] = useState(new Date().getFullYear().toString())
  const [years, setYears] = useState([])
  const [dates, setDates] = useState([])
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('number')

  // allows loading time for initial responses from backend
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
          // sort paidDates in chronological order
          paidDates.sort((a, b) => new Date(a) - new Date(b))
          setDates(paidDates)

          const existingYears = []
          response.data.invoices.forEach(invoice => {
            if (!existingYears.includes(invoice.createdDate.split('-')[0])) {
              existingYears.push(invoice.createdDate.split('-')[0])
            }
          })
          existingYears.sort((a, b) => b - a)
          console.log(existingYears)
          setYears(existingYears)

        })
        .catch(() => {
          alert('Error getting invoices')
        })
    }
  }, [loading])

  // helper to allow children to trigger a refresh
  // This is used to refresh the invoices list when an invoiceDiv component is updated
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

  // Updates payment history when an invoice is paid or unpaid
  useEffect(() => {
    const paidDates = []
    invoices.forEach((invoice) => {
      if (invoice.paidDate) {
        const dateString = new Date(invoice.paidDate).toLocaleString().split(',')[0]
        if (!paidDates.includes(dateString)) {
          paidDates.push(dateString)
        }
      }
    })
    paidDates.sort((a, b) => new Date(a) - new Date(b))
    setDates(paidDates)
  }, [invoices])



  return (
    <div className='app'>

      {/*  header with logout button */}
      <div className='app-header'>
        {currentUser?.name || ''}
        &nbsp;&nbsp;
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

      {/* main body of the app */}
      <div className='app-body'>
        <h1>Invoices</h1>

        {/* year selector */}
        <select
          style={{ marginBottom: '5px' }}
          defaultValue={year}
          value={year}
          onChange={(e) => {
            setYear(e.target.value)
          }}
        >
          <option value='all'>
            All
          </option>
          {years.map(year => (
            <option value={year}>
              {year}
            </option>
          ))}
        </select>
        <br></br>

        {/* filter based on paid status */}
        <select
          style={{ marginBottom: '5px' }}
          defaultValue={year}
          onChange={(e) => {
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

        <br></br>

        {/* invoice number search bar */}
        <input type='number' style={{ marginBottom: '5px' }}
          placeholder='Search invoice number'
          onChange={(e) => {
            setInvoiceToSearch(Number(e.target.value))
          }}
        />
        <br></br>

        {/* sort by number or creation date */}
        <select style={{ marginBottom: '5px' }}
          onChange={(e) => {
            setSortBy(e.target.value)
          }}
        >
          <option value='number'>
            Sort by number
          </option>
          <option value='creation date'>
            Sort by creation date
          </option>
        </select>
        <br></br><br></br>

        {/* displayed invoices */}
        <div className='invoices'
          style={{ overflowY: 'scroll' }}
        >

          {/* if invoiceToSearch is set, display the invoice with that number */}
          {(invoiceToSearch && invoices.find(invoice => invoice.number === invoiceToSearch)) ?
            <InvoiceDiv invoice={invoices.find(invoice => invoice.number === invoiceToSearch)} refreshInvoices={refreshInvoices} key={invoices.find(invoice => invoice.number === invoiceToSearch)._id} />


            // priority based on 'all' and 'number' being the default filter values
            // invoices displayed on the ones from the selected year (or all if year is set to 'all')

            // if filter is set to all and sortBy is set to number, display all invoices sorted by number
            : filter === 'all' && sortBy === 'number' ? invoices.sort((a, b) => a.number - b.number).map(invoice => (invoice.createdDate.split('-')[0] === year || year === 'all') && (
              <InvoiceDiv invoice={invoice} refreshInvoices={refreshInvoices} key={invoice._id} />
            ))

              // if filter is set to all and sortBy is set to creation date, display all invoices sorted by creation date
              : filter === 'all' && sortBy === 'creation date' ? invoices.sort((a, b) => new Date(a.createdDate) - new Date(b.createdDate)).map(invoice => (invoice.createdDate.split('-')[0] === year || year === 'all') && (
                <InvoiceDiv invoice={invoice} refreshInvoices={refreshInvoices} key={invoice._id} />
              ))

                // if filter is set to paid and sortBy is set to number, display all paid invoices sorted by number
                : filter === 'paid' && sortBy === 'number' ? invoices.filter(invoice => invoice.paid).sort((a, b) => a.number - b.number).map(invoice => (invoice.createdDate.split('-')[0] === year || year === 'all') && (
                  <InvoiceDiv invoice={invoice} refreshInvoices={refreshInvoices} key={invoice._id} />
                ))

                  // if filter is set to paid and sortBy is set to creation date, display all paid invoices sorted by creation date
                  : filter === 'paid' && sortBy === 'creation date' ? invoices.filter(invoice => invoice.paid).sort((a, b) => new Date(a.createdDate) - new Date(b.createdDate)).map(invoice => (invoice.createdDate.split('-')[0] === year || year === 'all') && (
                    <InvoiceDiv invoice={invoice} refreshInvoices={refreshInvoices} key={invoice._id} />
                  ))

                    // if filter is set to unpaid, display all unpaid invoices
                    : filter === 'unpaid' && sortBy === 'number' ? invoices.filter(invoice => !invoice.paid).sort((a, b) => a.number - b.number).map(invoice => (invoice.createdDate.split('-')[0] === year || year === 'all') && (
                      <InvoiceDiv invoice={invoice} refreshInvoices={refreshInvoices} key={invoice._id} />
                    ))

                      // if filter is set to unpaid and sortBy is set to creation date, display all unpaid invoices sorted by creation date
                      : invoices.filter(invoice => !invoice.paid).sort((a, b) => new Date(a.createdDate) - new Date(b.createdDate)).map(invoice => (invoice.createdDate.split('-')[0] === year || year === 'all') && (
                        <InvoiceDiv invoice={invoice} refreshInvoices={refreshInvoices} key={invoice._id} />
                      ))
          }
        </div>

        <br></br><br></br>

        {/* create invoice button */}
        <button onClick={() => {
          const newNumberInput = prompt('Enter invoice number')
          const newNumber = Number(newNumberInput)

          // check if newNumber is a positive whole number
          if (isNaN(newNumber) || newNumber % 1 !== 0 || newNumber < 0) {
            alert('Invoice number must be a positive whole number')
            return
          }

          // check if an invoice with this number already exists for this user
          const existingInvoice = invoices.find(invoice => invoice.number === newNumber)
          if (existingInvoice) {
            alert('Invoice with this number already exists')
            return
          }

          const newAmountInput = prompt('Enter invoice amount')

          // trim whitespace and convert to number
          const amountString = (newAmountInput || '').trim()

          // require exactly two decimal places, preserving trailing zeros
          // if 0 or 1 decimals, autofill remaining decimal place(s) with 0
          const amountRegex = /^(?:0|[1-9]\d*)\.*\d{0,2}$/
          if (!amountRegex.test(amountString)) {
            alert('Invoice amount must be a positive number with two decimal places ')
            return
          }
          const newAmount = Number(amountString)

          // this seems redundantsince the regex prevents negative numbers, but leaving it herejust in case
          // if (newAmount <= 0) {
          //   alert('Invoice amount must be a positive number')
          //   return
          // }


          // create new invoice and then refresh the invoices list
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

      {/* payment record section */}
      <div id='payment record'>

        <h3>Payment History</h3>

        {/* sort dates by newest or oldest */}
        <select
          onChange={(e) => {
            if (e.target.value === 'most to least recent') {
              setDates(dates.slice().reverse())
            } else {
              setDates(dates.slice().reverse())
            }
          }}>
          <option value='most to least recent'>
            Most to least recent
          </option>
          <option value='least to most recent'>
            Least to most recent
          </option>
        </select>


        {/* list of payment dates and the invoices that were paid on that date */}
        {dates.map(date => (
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