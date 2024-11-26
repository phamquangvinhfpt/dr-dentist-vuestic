import apiService from './api.service'
import type { PaginationFilter, PaginationResponse, PaymentDTO } from '@/pages/PaymentPages/types'

class PaymentService {
  async getAllPayments(
    filter: PaginationFilter,
    startDate: string,
    endDate: string,
  ): Promise<PaginationResponse<PaymentDTO>> {
    console.log('GetAllPayments - Input filter:', filter)
    console.log('GetAllPayments - Date range:', { startDate, endDate })

    return apiService
      .post(`/v1/payment/get-all?Sdate=${startDate}&Edate=${endDate}`, filter)
      .then((response) => {
        console.log('GetAllPayments - Response:', response.data)
        return response.data
      })
      .catch((error) => {
        console.error('GetAllPayments - Error:', error)
        return Promise.reject(error)
      })
  }
}

export default new PaymentService()
