import axios from 'axios'

const baseUrl = 'http://localhost:5000'

export const createUser = ({ name, password }) => {
  axios({
    method: 'post',
    url: `${baseUrl}/api/auth/register`,
    data: {
      name,
      password,
    }
  })
    .then(response => {
      console.log('CREATE USER RESPONSE: ', response)
    })
    .catch(error => console.log('ERROR: ', error))
}

export const getUser = ({ auth }) => {
  return axios({
    method: 'get',
    url: `${baseUrl}/users/`,
    headers: {
      Authorization: `Bearer ${auth.accessToken}`
    }
  }).then(response => {
    console.log('FETCH USER RESPONSE: ', response)
    return response
  }).catch(error => console.log('ERROR: ', error))
}

export const getToken = ({ auth, name, password }) => {
  return axios.post(`${baseUrl}/token/`, {
    name,
    password,
  })
    .then(response => {
      console.log('GET TOKEN RESPONSE: ', response)
      auth.setAccessToken(response.data.access)
    })
    .catch(error => console.log('ERROR: ', error))
}



export const createInvoice = ({ auth, invoice }) => {
  return axios({
    method: 'post',
    url: `${baseUrl}/invoices/`,
    headers: {
      Authorization: `Bearer ${auth.accessToken}`
    },
    data: {
      invoice: {
        user: auth.user._id,
        number: invoice.number,
        amount: invoice.amount,
        paid: false,
        paidDate: null,
      }
    }
  }).then(response => {
    console.log('CREATE INVOICE RESPONSE: ', response)
    return response
  }).catch(error => console.log('ERROR: ', error))
}

export const getInvoices = ({ auth, user }) => {
  return axios({
    method: 'get',
    url: `${baseUrl}/invoices/`,
    headers: {
      Authorization: `Bearer ${auth.accessToken}`
    }
  }).then(response => {
    console.log('GET INVOICES RESPONSE: ', response)
    return response
  }).catch(error => console.log('ERROR: ', error))
}

export const updateInvoice = ({ auth, invoice }) => {
  return axios({
    method: 'patch',
    url: `${baseUrl}/invoices/${invoice._id}`,
    headers: {
      Authorization: `Bearer ${auth.accessToken}`
    },
    data: {
      invoice
    }
  }).then(response => {
    console.log('UPDATE INVOICE RESPONSE: ', response)
    return response
  }).catch(error => console.log('ERROR: ', error))
}