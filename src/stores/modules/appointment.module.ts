import appointmentService from '@/services/appointment.service'
import { defineStore } from 'pinia'

export const useAppointmentStore = defineStore('appointment', {
  state: () => ({
    isLoading: false,
  }),
  actions: {
    async createAppointment(appointment: any): Promise<any> {
      try {
        this.isLoading = true
        const response = await appointmentService.createAppointment(appointment)
        this.isLoading = false
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
    async getAppointments(search: any): Promise<any> {
      try {
        this.isLoading = true
        const response = await appointmentService.getAppointments(search)
        this.isLoading = false
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
    async getFollowUpAppointments(search: any): Promise<any> {
      try {
        this.isLoading = true
        const response = await appointmentService.getFollowUpAppointments(search)
        this.isLoading = false
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
    async getNonDoctorsAppointments(search: any): Promise<any> {
      try {
        this.isLoading = true
        const response = await appointmentService.getNonDoctorsAppointments(search)
        this.isLoading = false
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
    async assignDoctor(data: any): Promise<any> {
      try {
        this.isLoading = true
        const response = await appointmentService.assignDoctor(data)
        this.isLoading = false
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
  },
})
