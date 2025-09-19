import axios from 'axios'
const baseUrl = 'http://localhost:5000/api'
axios.defaults.withCredentials = true


// User/Auth API

export const createUser = ({ name, password }) => {
  axios({
    method: 'post',
    url: `${baseUrl}/auth/register`,
    data: {
      name,
      password,
    }
  })
    .then(response => {
     
    })
    .catch(error => console.log('ERROR: ', error))
}

export const getUser = ({ userContext }) => {
  return axios({
    method: 'get',
    url: `${baseUrl}/auth/me/`,
  }).then(response => {
    
    return response
  }).catch(error => console.log('ERROR: ', error))
}

export const getToken = ({ auth, userContext, name, password }) => {
  return axios({
    method: 'post',
    url: `${baseUrl}/auth/login/`,
    data: {
      name,
      password,
    }
  })
    .then(response => {

      userContext.setCurrentUser(response.data.user)
      return response
    })
    .catch(error => console.log('ERROR: ', error))
}

export const logout = ({ userContext }) => {
  return axios({
    method: 'post',
    url: `${baseUrl}/auth/logout/`,
  })
    .then(response => {

      userContext.setCurrentUser([])
      return response
    })
    .catch(error => console.log('ERROR: ', error))
}


// Invoice API

export const createInvoice = ({ auth, invoice }) => {
  return axios({
    method: 'post',
    url: `${baseUrl}/invoices/`,
    data: {
      invoice: {
        user: invoice.user,
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
    params: {
      user,
    }
  }).then(response => {
    return response
  }).catch(error => console.log('ERROR: ', error))
}

export const updateInvoice = ({ auth, invoice }) => {
  return axios({
    method: 'patch',
    url: `${baseUrl}/invoices/${invoice._id}`,
    data: invoice
  }).then(response => {
    console.log('UPDATE INVOICE RESPONSE: ', response)
    return response
  }).catch(error => console.log('ERROR: ', error))
}

export const deleteInvoice = ({ auth, invoice }) => {
  return axios({
    method: 'delete',
    url: `${baseUrl}/invoices/${invoice._id}`,
  }).then(response => {
    console.log('DELETE INVOICE RESPONSE: ', response)
    return response
  }).catch(error => console.log('ERROR: ', error))
}