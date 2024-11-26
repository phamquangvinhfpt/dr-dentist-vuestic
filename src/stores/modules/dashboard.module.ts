import dashboardService from '@/services/dashboard.service'
import { defineStore } from 'pinia'
import { Revenues } from '../../data/charts/revenueChartData'

export const useDashboardStore = defineStore('Dashboard', {
  state: () => ({
    isLoading: false as boolean,
    dataMonthlyEarnings: [] as Revenues[],
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
  },
})
