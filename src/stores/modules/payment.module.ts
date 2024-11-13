import paymentService from '@/services/payment.service'
import { defineStore } from 'pinia'

export const usePaymentStore = defineStore('payment', {
  state: () => ({
    isLoading: false,
  }),
  actions: {
    async checkTransactionStatus(): Promise<any> {
      try {
        this.isLoading = true
        const response = await paymentService.checkTransactionStatus()
        this.isLoading = false
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
  },
})
