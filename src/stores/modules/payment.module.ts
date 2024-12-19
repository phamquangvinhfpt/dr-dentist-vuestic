import { defineStore } from 'pinia'
import type {
  PaginationResponse,
  PaymentDTO,
  PaginationFilter,
  PaymentDetailResponse,
} from '@/pages/PaymentPages/types'
import paymentService from '@/services/payment.service'

interface PaymentState {
  paymentList: PaginationResponse<PaymentDTO>
  isLoading: boolean
  currentPayment: PaymentDetailResponse | null
}

export const usePaymentStore = defineStore('payment', {
  state: (): PaymentState => ({
    paymentList: {
      data: [],
      currentPage: 1,
      totalPages: 1,
      totalCount: 0,
      pageSize: 10,
      hasNextPage: false,
      hasPreviousPage: false,
    },
    isLoading: false,
    currentPayment: null,
  }),

  actions: {
    async getAllPayments(
      filter: PaginationFilter,
      startDate: string,
      endDate: string,
    ): Promise<PaginationResponse<PaymentDTO>> {
      try {
        this.isLoading = true
        const response = await paymentService.getAllPayments(filter, startDate, endDate)
        this.paymentList = response
        return response
      } catch (error) {
        console.error('Store - GetAllPayments error:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async getPatientPayments(
      filter: PaginationFilter,
      startDate: string,
      endDate: string,
    ): Promise<PaginationResponse<PaymentDTO>> {
      this.isLoading = true
      try {
        const response = await paymentService.getPatientPayments(filter, startDate, endDate)
        this.paymentList = response
        return response
      } catch (error) {
        console.error('Store - GetPatientPayments error:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async getPaymentDetail(id: string) {
      try {
        this.isLoading = true
        const response = await paymentService.getPaymentDetail(id)
        this.currentPayment = response
        return response
      } catch (error) {
        console.error('Error getting payment detail:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },
  },
})
