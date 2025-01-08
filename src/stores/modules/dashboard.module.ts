import dashboardService from '@/services/dashboard.service'
import { defineStore } from 'pinia'
import { Revenues } from '../../data/charts/revenueChartData'
import { Appointment, FollowUpAppointment } from '@/pages/appointment/types'

export const useDashboardStore = defineStore('Dashboard', {
  state: () => ({
    isLoading: false as boolean,
    dataMonthlyEarnings: [] as Revenues[],
    satisfiedData: null as any,
    regularDoctorData: null as any,
    totalServiceData: null as any,
    appointmentDoneData: null as any,
    feedbackData: null as any,
    total_appointment: 0,
    new_contacts: 0,
    follow_up: 0,
    unassign: 0,
    appointments: [] as Appointment[],
    followupAppointments: [] as FollowUpAppointment[],
    bookingPercent: null as any,
    revenuePercent: null as any,
  }),
  actions: {
    async getChartRevenue(data: any): Promise<any> {
      try {
        this.isLoading = true
        const response = await dashboardService.getChartRevenue(data)
        this.isLoading = false
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
    async getChartDeposit(data: any): Promise<any> {
      try {
        this.isLoading = true
        const response = await dashboardService.getChartDeposit(data)
        this.isLoading = false
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
    async getRevenueServices(data: any): Promise<any> {
      try {
        this.isLoading = true
        const response = await dashboardService.getRevenueServices(data)
        this.isLoading = false
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
    async getChartMemberGrowth(data: any): Promise<any> {
      try {
        this.isLoading = true
        const response = await dashboardService.getChartMemberGrowth(data)
        this.isLoading = false
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
    async getRateDoctor(data: any): Promise<any> {
      try {
        this.isLoading = true
        const response = await dashboardService.getRateDoctor(data)
        this.isLoading = false
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
    async getAnalyticBooking(data: any): Promise<any> {
      try {
        this.isLoading = true
        const response = await dashboardService.getAnalyticBooking(data)
        this.isLoading = false
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
    async getSatisfied(): Promise<any> {
      try {
        this.isLoading = true
        const response = await dashboardService.getSatisfied()
        this.satisfiedData = response
        this.isLoading = false
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
    async getRegularDoctor(): Promise<any> {
      try {
        this.isLoading = true
        const response = await dashboardService.getRegularDoctor()
        this.regularDoctorData = response
        this.isLoading = false
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
    async getTotalService(): Promise<any> {
      try {
        this.isLoading = true
        const response = await dashboardService.getTotalService()
        this.totalServiceData = response
        this.isLoading = false
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
    async getAppointmentDone(): Promise<any> {
      try {
        this.isLoading = true
        const response = await dashboardService.getAppointmentDone()
        this.appointmentDoneData = response
        this.isLoading = false
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
    async getPatientTestimonials(): Promise<any> {
      try {
        this.isLoading = true
        const response = await dashboardService.getPatientTestimonials()
        this.feedbackData = response
        this.isLoading = false
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
    async getTotalAppointments(data?: any): Promise<any> {
      try {
        this.isLoading = true
        const response = await dashboardService.getTotalAppointments(data)
        this.total_appointment = response
        this.isLoading = false
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
    async getNewContacts(data?: any): Promise<any> {
      try {
        this.isLoading = true
        const response = await dashboardService.getNewContacts(data)
        this.new_contacts = response
        this.isLoading = false
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
    async getFollowUp(data?: any): Promise<any> {
      try {
        this.isLoading = true
        const response = await dashboardService.getFollowUp(data)
        this.follow_up = response
        this.isLoading = false
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
    async getUnassign(data?: any): Promise<any> {
      try {
        this.isLoading = true
        const response = await dashboardService.getUnassign(data)
        this.unassign = response
        this.isLoading = false
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
    async getAppointmentUnExamination(data?: any): Promise<any> {
      try {
        this.isLoading = true
        const response = await dashboardService.getAppointmentUnExamination(data)
        this.appointments = response
        this.isLoading = false
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
    async getFollowUpAppointmentUnExamination(data?: any): Promise<any> {
      try {
        this.isLoading = true
        const response = await dashboardService.getFollowUpAppointmentUnExamination(data)
        this.followupAppointments = response
        this.isLoading = false
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
    async getBookingPercent(data: any): Promise<any> {
      try {
        this.isLoading = true
        const response = await dashboardService.getBookingPercent(data)
        this.bookingPercent = response
        this.isLoading = false
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
    async getRevenuePercent(data: any): Promise<any> {
      try {
        this.isLoading = true
        const response = await dashboardService.getRevenuePercent(data)
        this.revenuePercent = response
        this.isLoading = false
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
  },
})
