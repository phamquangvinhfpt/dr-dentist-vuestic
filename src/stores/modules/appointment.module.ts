import appointmentService from '@/services/appointment.service'
import { defineStore } from 'pinia'

interface Appointment {
  id: number
  time: string
  patientName: string
  date: string
}

export const useAppointmentStore = defineStore('appointment', {
  state: () => ({
    isLoading: false,
    appointments: [] as Appointment[],
    update_date: null as any,
  }),
  actions: {
    updateAppointment(data: any) {
      this.update_date = data
    },
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
    async rescheduleAppointment(type: any, data: any): Promise<any> {
      try {
        this.isLoading = true
        const response = await appointmentService.rescheduleAppointment(type, data)
        this.isLoading = false
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
    async cancelAppointment(data: any): Promise<any> {
      try {
        this.isLoading = true
        const response = await appointmentService.cancelAppointment(data)
        this.isLoading = false
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
    async getAppointmentById(id: string): Promise<any> {
      try {
        this.isLoading = true
        const response = await appointmentService.getAppointmentById(id)
        this.isLoading = false
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
    async fetchAppointments(): Promise<void> {
      try {
        this.isLoading = true
        this.appointments = await appointmentService.listAppointments()
        this.isLoading = false
      } catch (error) {
        this.isLoading = false
        console.error('Error fetching appointments:', error)
      }
    },
  },
})
