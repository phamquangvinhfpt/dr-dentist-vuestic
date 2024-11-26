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
