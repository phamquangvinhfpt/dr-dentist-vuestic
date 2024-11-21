import { Search, SearchResponse } from '@/pages/appointment/types'
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

  async searchService(data: Search): Promise<SearchResponse> {
    return apiService
      .post('/service/pagination/get-all', data)
      .then((response) => {
        return Promise.resolve(response.data)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }
}
export default new ServiceService()
