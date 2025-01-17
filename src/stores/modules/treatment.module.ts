import { treatmentService } from '@/services/treatment.service'
import { defineStore } from 'pinia'

export const useTreatmentStore = defineStore('treatment', {
  state: () => ({
    treatments: [],
    isLoading: false,
  }),
  actions: {
    async getTreatmentList(id: any) {
      try {
        this.isLoading = true
        const response = await treatmentService.getTreatmentList(id)
        this.treatments = response.data
        this.isLoading = false
        return await Promise.resolve(response.data)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
    async toogleAppointment(id: any) {
      try {
        this.isLoading = true
        const response = await treatmentService.toogleAppointment(id)
        this.isLoading = false
        this.treatments = response.data
        return await Promise.resolve(response.data)
      } catch (error) {
        return await Promise.reject(error)
      }
    },
    async toogleFollowupAppointment(id: any) {
      try {
        this.isLoading = true
        const response = await treatmentService.toogleFollowupAppointment(id)
        this.isLoading = false
        this.treatments = response.data
        return await Promise.resolve(response.data)
      } catch (error) {
        return await Promise.reject(error)
      }
    },
    async doTreatment(id: any) {
      try {
        this.isLoading = true
        const response = await treatmentService.doTreatment(id)
        this.isLoading = false
        this.treatments = response.data
        return await Promise.resolve(response.data)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
    async addTreatmentDetail(data: any) {
      try {
        this.isLoading = true
        const response = await treatmentService.addTreatmentDetail(data)
        this.isLoading = false
        return await Promise.resolve(response.data)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
    async updateTreatmentDetail(data: any) {
      try {
        this.isLoading = true
        const response = await treatmentService.updateTreatmentDetail(data)
        this.isLoading = false
        return await Promise.resolve(response.data)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
    async getRemainingAppointment(id: any) {
      try {
        this.isLoading = true
        const response = await treatmentService.getRemainingAppointment(id)
        this.isLoading = false
        return await Promise.resolve(response.data)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
    async sendPayment(data: any) {
      try {
        this.isLoading = true
        const response = await treatmentService.sendPayment(data)
        this.isLoading = false
        return await Promise.resolve(response.data)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
    async cancelPayment(code: any): Promise<any> {
      try {
        this.isLoading = true
        const response = await treatmentService.cancelPayment(code)
        this.isLoading = false
        return await Promise.resolve(response.data)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
    async getPrescription(id: any): Promise<any> {
      try {
        this.isLoading = true
        const response = await treatmentService.getPrescription(id)
        this.isLoading = false
        return await Promise.resolve(response.data)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
    async getCurrentPlan(id: any): Promise<any> {
      try {
        this.isLoading = true
        const response = await treatmentService.getCurrentPlan(id)
        this.isLoading = false
        return await Promise.resolve(response.data)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
  },
})
