import apiService from './api.service'
import type {
  PaginationFilter,
  PaginationResponse,
  PaymentDTO,
  PaymentDetailResponse,
} from '@/pages/PaymentPages/types'
import userService from './user.service'

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

  async getPatientPayments(
    filter: PaginationFilter,
    startDate: string,
    endDate: string,
  ): Promise<PaginationResponse<PaymentDTO>> {
    try {
      const profileResponse = await userService.getUserProfile()
      const patientProfileId = profileResponse.data.patientProfile?.id

      if (!patientProfileId) {
        throw new Error('Patient profile not found')
      }

      const response = await apiService.post(`/v1/payment/get-all`, {
        filter: {
          pageNumber: filter.pageNumber,
          pageSize: filter.pageSize,
          orderBy: filter.orderBy || ['depositDate desc'],
          keyword: filter.keyword,
          advancedFilter: {
            logic: 'and',
            filters: [
              {
                field: 'patientProfileId',
                operator: 'eq',
                value: patientProfileId,
              },
            ],
          },
        },
        Sdate: startDate,
        Edate: endDate,
      })

      // Filter lại kết quả theo ngày tháng ở client
      const filteredPayments = response.data.data.filter((payment: PaymentDTO) => {
        // Nếu không có depositDate (payment mới), luôn hiển thị
        if (!payment.depositDate) return true

        const paymentDate = new Date(payment.depositDate).getTime()
        const startDateTime = new Date(startDate).getTime()
        const endDateTime = new Date(endDate).getTime()

        return paymentDate >= startDateTime && paymentDate <= endDateTime
      })

      // Tính toán phân trang với dữ liệu đã được lọc
      const startIndex = (filter.pageNumber - 1) * filter.pageSize
      const endIndex = startIndex + filter.pageSize
      const paginatedData = filteredPayments.slice(startIndex, endIndex)

      return {
        data: paginatedData,
        totalCount: filteredPayments.length,
        currentPage: filter.pageNumber,
        pageSize: filter.pageSize,
        totalPages: Math.ceil(filteredPayments.length / filter.pageSize),
        hasNextPage: endIndex < filteredPayments.length,
        hasPreviousPage: filter.pageNumber > 1,
      }
    } catch (error) {
      console.error('GetPatientPayments - Error:', error)
      return Promise.reject(error)
    }
  }

  async getPaymentDetail(id: string): Promise<PaymentDetailResponse> {
    try {
      const response = await apiService.get(`/v1/payment/get/${id}`)
      console.log('API Raw Response:', response)
      console.log('Payment Response Data:', response?.data?.paymentResponse)

      // Kiểm tra cấu trúc response
      if (!response?.data) {
        throw new Error('Invalid response - missing data')
      }

      // Lấy paymentResponse từ response
      const paymentResponse = response.data.paymentResponse
      console.log('Payment Response:', paymentResponse)

      // Format response theo cấu trúc mong muốn
      const formattedResponse = {
        messages: [],
        data: {
          paymentResponse: {
            appointmentId: paymentResponse.appointmentId,
            depositAmount: paymentResponse.depositAmount,
            depositDate: paymentResponse.depositDate,
            method: paymentResponse.method,
            patientCode: paymentResponse.patientCode,
            patientName: paymentResponse.patientName,
            patientProfileId: paymentResponse.patientProfileId,
            paymentId: paymentResponse.paymentId,
            remainingAmount: paymentResponse.remainingAmount,
            serviceId: paymentResponse.serviceId,
            serviceName: paymentResponse.serviceName,
            status: paymentResponse.status,
            totalAmount: paymentResponse.totalAmount,
            details: [], // Khởi tạo mảng rỗng cho details
          },
        },
        source: '',
        exception: null,
        errorId: null,
        supportMessage: null,
        statusCode: 200,
      }

      // Nếu có serviceId, lấy thêm procedures
      if (paymentResponse.serviceId) {
        try {
          const serviceResponse = await this.getProceduresByServiceId(paymentResponse.serviceId)
          console.log('Service Response:', serviceResponse)

          if (serviceResponse?.data?.procedures) {
            // Map procedures từ service response sang format PaymentDetailDTO
            const procedures = serviceResponse.data.procedures.map((proc: any) => ({
              procedureId: proc.id,
              procedureName: proc.name,
              paymentAmount: proc.price || 0,
              paymentStatus: paymentResponse.status || 0,
            }))
            console.log('Mapped Procedures:', procedures)
            formattedResponse.data.paymentResponse.details = procedures
          }
        } catch (error) {
          console.error('Error fetching procedures:', error)
        }
      }

      console.log('Formatted Response:', formattedResponse)
      return formattedResponse
    } catch (error) {
      console.error('Error in getPaymentDetail:', error)
      throw error
    }
  }

  async getProceduresByServiceId(id: string): Promise<any> {
    try {
      console.log('Fetching procedures for service ID:', id)
      const response = await apiService.get(`/service/${id}/get`)
      console.log('Service procedures response:', response)
      return response
    } catch (error) {
      console.error('Error getting procedures:', error)
      throw error
    }
  }

  async exportPayments(params: any) {
    try {
      const response = await apiService.postFileData(
        '/v1/payment/export-payment',
        {
          startDate: params.startDate,
          endDate: params.endDate,
          paymentStatus: params.paymentStatus,
          paymentMethod: params.paymentMethod,
          userID: params.userID,
        },
        {
          responseType: 'blob',
        },
      )
      return response.data
    } catch (error) {
      console.error('Export error:', error)
      throw error
    }
  }
}

export default new PaymentService()
