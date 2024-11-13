import apiService from './api.service'

class PaymentService {
  async checkTransactionStatus(): Promise<any> {
    return apiService
      .get(`/v1/payment/check-transactions`)
      .then((response) => {
        return Promise.resolve(response)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }
}

export default new PaymentService()
