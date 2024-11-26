import { defineStore } from 'pinia'
import type { PaginationResponse, PaymentDTO, PaginationFilter } from '@/pages/PaymentPages/types'
import paymentService from '@/services/payment.service'

interface PaymentState {
  paymentList: PaginationResponse<PaymentDTO>
  isLoading: boolean
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
  },
})
