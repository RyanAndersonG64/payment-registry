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
                getInvoices({ auth, user: currentUser._id })
                    .then((response) => {
                        setInvoices(response.data.invoices)
                        setThisInvoice(response.data.invoices.find(invoice => invoice._id === invoiceToUpdate._id))
                    })
            })
    }

    return (
        <div key={thisInvoice._id} className='invoice-cell' style={{ color: thisInvoice.paid ? 'green' : 'red' }}>
            <input type='number'
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
            <input type='number'
                defaultValue={thisInvoice.amount}

                //update invoice amount
                onChange={(e) => {
                    setAmountToUpdate(e.target.value)
                }}
                onBlur={(e) => {
                    if (amountToUpdate === '') {
                        e.target.value = thisInvoice.amount
                        return
                    }

                    // check if amountToUpdate is a positive number with 2 decimal places
                    if (isNaN(amountToUpdate) || amountToUpdate < 0 || amountToUpdate.toString().split('.')[1]?.length !== 2) {
                        alert('Amount must be a positive number with 2 decimal places')
                        e.target.value = thisInvoice.amount
                        setAmountToUpdate('')
                        return
                    }

                    if (amountToUpdate === thisInvoice.amount) {
                        return
                    }


                    if (amountToUpdate !== '') {
                        sendInvoiceUpdate({ _id: thisInvoice._id, amount: amountToUpdate })
                        setAmountToUpdate('')
                    }
                }}
            />
            <p>{thisInvoice.paidDate ? `Paid on ${new Date(thisInvoice.paidDate).toLocaleString().split(',')[0]}` : ''}</p>
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
    )
}
export default InvoiceDiv