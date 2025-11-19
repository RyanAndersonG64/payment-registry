import { useState, useEffect } from 'react'
import { deleteInvoice, getInvoices, updateInvoice } from '../api'
import { AuthContext } from '../contexts/AuthContext'
import { UserContext } from '../contexts/UserContext'
import { useContext } from 'react'
import '../App.css'

function InvoiceDiv(invoice) {
    const { auth } = useContext(AuthContext)
    const { userContext } = useContext(UserContext)
    const [currentUser, setCurrentUser] = useState(userContext.currentUser)

    const [invoices, setInvoices] = useState([])

    const [thisInvoice, setThisInvoice] = useState([])
    const [numberToUpdate, setNumberToUpdate] = useState('')
    const [amountToUpdate, setAmountToUpdate] = useState('')

    // set the invoice to the invoice passed in
    useEffect(() => {
        setThisInvoice(invoice.invoice)
    }, [invoice])

    // function for sending an invoice update to the backend
    function sendInvoiceUpdate(invoiceToUpdate) {
        return updateInvoice({ auth, invoice: invoiceToUpdate })
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

        // invoice cell component
        <div key={thisInvoice._id} className='invoice-cell' style={{ color: thisInvoice.paid ? 'green' : 'red' }}>
            #
            {/* input to display and update invoice number */}
            <input type='number' style={{ width: '50px', textAlign: 'center' }}
                value={numberToUpdate || thisInvoice.number}

                // update invoice number on change
                onChange={(e) => {
                    setNumberToUpdate(e.target.value)
                }}

                // on blur, check if numberToUpdate is a positive whole number and send the update
                onBlur={(e) => {

                    // if numberToUpdate is empty, set the value to the current invoice number and don't send the update
                    if (numberToUpdate === '') {
                        e.target.value = thisInvoice.number
                        return
                    }

                    // if numberToUpdate is not a positive whole number, alert the user and set the value to the current invoice number and don't send the update
                    if (isNaN(numberToUpdate) || numberToUpdate % 1 !== 0 || numberToUpdate < 0) {
                        alert('Number must be a positive whole number')
                        e.target.value = thisInvoice.number
                        setNumberToUpdate('')
                        return
                    }

                    // if numberToUpdate is the same as the current invoice number, don't send the update
                    if (numberToUpdate === thisInvoice.number) {
                        return
                    }

                    // if numberToUpdate is not empty, send the update and then clear numberToUpdate
                    if (numberToUpdate !== '') {
                        sendInvoiceUpdate({ _id: thisInvoice._id, number: numberToUpdate })

                        setNumberToUpdate('')
                        return
                    }
                }}

                // same as onBlur, but for pressing Enter
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

                        sendInvoiceUpdate({ _id: thisInvoice._id, number: numberToUpdate })

                        setNumberToUpdate('')
                        return
                    }
                }}

                // clear numberToUpdate when enter is released; I'm not sure why this is needed, but the number input bugs out sometimes without it
                onKeyUp={(e) => {
                    if (e.key === 'Enter') {
                        setNumberToUpdate('')
                    }
                }}
            />

            &nbsp;&nbsp;

            $
            {/* input to display and update invoice amount */}
            <input type='text' style={{ width: '100px', textAlign: 'center' }}
                defaultValue={Number(thisInvoice.amount).toFixed(2)}

                //update invoice amount
                onChange={(e) => {
                    setAmountToUpdate(e.target.value)
                }}
                onBlur={(e) => {
                    // if amountToUpdate is empty, set the value to the current invoice amount and don't send the update
                    if (amountToUpdate === '') {
                        e.target.value = Number(thisInvoice.amount).toFixed(2)
                        return
                    }

                    // validate exact two decimals and positivity
                    const amountString = (amountToUpdate || '').trim()
                    const amountRegex = /^(?:0|[1-9]\d*)\.\d{2}$/

                    // if amountToUpdate is not a valid amount, alert the user and set the value to the current invoice amount and don't send the update
                    if (!amountRegex.test(amountString)) {
                        alert('Amount must be a positive number with two decimal places')
                        e.target.value = Number(thisInvoice.amount).toFixed(2)
                        setAmountToUpdate('')
                        return
                    }

                    // convert amountToUpdate to a number
                    const numericAmount = Number(amountString)

                    // this seems redundant since the regex prevents negative numbers, but leaving here just in case
                    // if (numericAmount <= 0) {
                    //     alert('Amount must be a positive number')
                    //     e.target.value = Number(thisInvoice.amount).toFixed(2)
                    //     setAmountToUpdate('')
                    //     return
                    // }

                    // if amountToUpdate is the same as the current invoice amount, don't send the update
                    if (numericAmount === Number(thisInvoice.amount)) {
                        return
                    }

                    // if amountToUpdate is not empty, send the update and then clear amountToUpdate
                    if (amountToUpdate !== '') {
                        sendInvoiceUpdate({ _id: thisInvoice._id, amount: numericAmount })
                        setAmountToUpdate('')
                    }
                }}
            />
            <br></br>

            {/* display created date and paid status/date */}
            {thisInvoice.createdDate ? `Created on ${new Date(thisInvoice.createdDate).toLocaleString().split(',')[0]}` : ''}
            <br></br>
            {thisInvoice.paidDate ? `Paid on ${new Date(thisInvoice.paidDate).toLocaleString().split(',')[0]}` : 'Unpaid'}
            <br></br>

            {/* button to update invoice payment status */}
            <button onClick={() => {
                if (confirm('Are you sure you want to update this invoice payment status?')) {
                    sendInvoiceUpdate({ _id: thisInvoice._id, paid: !thisInvoice.paid })
                        .then(() => {
                            if (invoice.refreshInvoices) {
                                invoice.refreshInvoices()
                            } else {
                                getInvoices({ auth, user: currentUser._id })
                                    .then((response) => {
                                        setInvoices(response.data.invoices)
                                    })
                            }
                        })
                        .catch(() => {
                            alert('Error updating invoice payment status')
                        })
                }
            }}>
                {thisInvoice.paid ? 'Mark as Unpaid' : 'Mark as Paid'}
            </button>

            {/* button to delete invoice */}
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