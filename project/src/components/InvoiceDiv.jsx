import { useState, useEffect } from 'react'
import { deleteInvoice, getInvoices, updateInvoice } from '../api'
import { AuthContext } from '../contexts/AuthContext'
import { UserContext } from '../contexts/UserContext'
import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import '../App.css'

function InvoiceDiv(invoice) {
    const { auth } = useContext(AuthContext)
    const { userContext } = useContext(UserContext)
    const [currentUser, setCurrentUser] = useState(userContext.currentUser)
    const [invoices, setInvoices] = useState([])
    const [thisInvoice, setThisInvoice] = useState([])
    const [numberToUpdate, setNumberToUpdate] = useState('')
    const [amountToUpdate, setAmountToUpdate] = useState('')

    useEffect(() => {
        setThisInvoice(invoice.invoice)
    }, [invoice])
    
    function sendInvoiceUpdate(invoiceToUpdate) {
        updateInvoice({ auth, invoice: invoiceToUpdate })
            .then(() => {
                if (invoice.refreshInvoices) {
                    invoice.refreshInvoices()
                } else {
                    getInvoices({ auth, user: currentUser._id })
                        .then((response) => {
                            setInvoices(response.data.invoices)
                            setThisInvoice(response.data.invoices.find(invoice => invoice._id === invoiceToUpdate._id))
                        })
                }
            })
    }

    return (
        <div key={thisInvoice._id} className='invoice-cell' style={{ color: thisInvoice.paid ? 'green' : 'red' }}>
            #
            <input type='number' style={{ width: '50px', textAlign: 'center' }}
                defaultValue={thisInvoice.number}

                //update invoice number
                onChange={(e) => {
                    setNumberToUpdate(e.target.value)
                }}

                // on blur or enter, check if numberToUpdate is a positive whole number and send the update
                onBlur={(e) => {

                    if (numberToUpdate === '') {
                        e.target.value = thisInvoice.number
                        return
                    }

                    if (isNaN(numberToUpdate) || numberToUpdate % 1 !== 0 || numberToUpdate < 0) {
                        alert('Number must be a positive whole number')
                        e.target.value = thisInvoice.number
                        setNumberToUpdate('')
                        return
                    }

                    if (numberToUpdate === thisInvoice.number) {
                        return
                    }

                    const existingInvoice = invoices.find(invoice => thisInvoice.number === numberToUpdate)
                    if (existingInvoice) {
                        alert('Number already in use')
                        return
                    }

                    if (numberToUpdate !== '') {
                        sendInvoiceUpdate({ _id: thisInvoice._id, number: numberToUpdate })
                        setNumberToUpdate('')
                    }
                }}

                onKeyDown={(e) => {
                    if (e.key === 'Enter') {

                        if (numberToUpdate === '') {
                            e.target.value = thisInvoice.number
                            return
                        }

                        if (isNaN(numberToUpdate) || numberToUpdate % 1 !== 0 || numberToUpdate < 0) {
                            alert('Number must be a positive whole number')
                            e.target.value = thisInvoice.number
                            setNumberToUpdate('')
                            return
                        }


                        if (numberToUpdate === thisInvoice.number) {
                            return
                        }
                        const existingInvoice = invoices.find(invoice => thisInvoice.number === numberToUpdate)
                        if (existingInvoice) {
                            alert('Number already in use')
                            return
                        }
                        sendInvoiceUpdate({ _id: thisInvoice._id, number: numberToUpdate })
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
            <input type='text' style={{ width: '100px', textAlign: 'center' }}
                defaultValue={Number(thisInvoice.amount).toFixed(2)}

                //update invoice amount
                onChange={(e) => {
                    setAmountToUpdate(e.target.value)
                }}
                onBlur={(e) => {
                    if (amountToUpdate === '') {
                        e.target.value = Number(thisInvoice.amount).toFixed(2)
                        return
                    }

                    // validate exact two decimals and positivity
                    const amountString = (amountToUpdate || '').trim()
                    const amountRegex = /^(?:0|[1-9]\d*)\.\d{2}$/
                    if (!amountRegex.test(amountString)) {
                        alert('Amount must be a positive number with two decimal places')
                        e.target.value = Number(thisInvoice.amount).toFixed(2)
                        setAmountToUpdate('')
                        return
                    }
                    const numericAmount = Number(amountString)
                    if (numericAmount <= 0) {
                        alert('Amount must be a positive number')
                        e.target.value = Number(thisInvoice.amount).toFixed(2)
                        setAmountToUpdate('')
                        return
                    }

                    if (numericAmount === Number(thisInvoice.amount)) {
                        return
                    }


                    if (amountToUpdate !== '') {
                        sendInvoiceUpdate({ _id: thisInvoice._id, amount: numericAmount })
                        setAmountToUpdate('')
                    }
                }}
            />
            {/* <p>{thisInvoice.paidDate ? `Paid on ${new Date(thisInvoice.paidDate).toLocaleString().split(',')[0]}` : 'Unpaid'}</p> */}
            <button onClick={() => {
                if (confirm('Are you sure you want to update this invoice payment status?')) {
                    sendInvoiceUpdate({ _id: thisInvoice._id, paid: !thisInvoice.paid })
                }
            }}>
                {thisInvoice.paid ? 'Mark as Unpaid' : 'Mark as Paid'}
            </button>
            <button onClick={() => {
                if (confirm('Are you sure you want to delete this invoice?')) {
                    deleteInvoice({ auth, invoice: { _id: thisInvoice._id } })
                        .then(() => {
                            if (invoice.refreshInvoices) {
                                invoice.refreshInvoices()
                            } else {
                                getInvoices({ auth, user: currentUser._id })
                                    .then((response) => {
                                        setInvoices(response.data.invoices)
                                    })
                                    .catch(() => {
                                        alert('Error getting invoices')
                                    })
                            }
                        })
                        .catch(() => {
                            alert('Error deleting invoice')
                        })
                }
            }}>
                Delete
            </button>
        </div>
    )
}
export default InvoiceDiv