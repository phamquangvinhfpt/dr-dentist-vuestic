import dashboardService from '@/services/dashboard.service'
import { defineStore } from 'pinia'
import { Revenues } from '../../data/charts/revenueChartData'

export const useDashboardStore = defineStore('Dashboard', {
  state: () => ({
    isLoading: false as boolean,
    dataMonthlyEarnings: [] as Revenues[],
    satisfiedData: null as any,
    regularDoctorData: null as any,
    totalServiceData: null as any,
    appointmentDoneData: null as any,
    feedbackData: null as any,
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
  },
})
