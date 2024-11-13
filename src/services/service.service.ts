import apiService from './api.service'

class ServiceService {
  async getAllCustomerServices(): Promise<any> {
    return apiService
      .get('/service/customer-get-all')
      .then((response) => {
        return Promise.resolve(response)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }
}
export default new ServiceService()
