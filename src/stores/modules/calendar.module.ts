import calendarService from '@/services/calendar.service'
import { defineStore } from 'pinia'

export const useCalendarStore = defineStore('calendar', {
  state: () => ({
    availableTimeSlots: [] as any[],
    isLoading: false as boolean,
  }),
  actions: {
    async getAvailableTimeSlots(data: any): Promise<any> {
      try {
        this.isLoading = true
        const response = await calendarService.getAvailableTimeSlots(data)
        this.isLoading = false
        this.availableTimeSlots = response?.data
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
    async registerFullTime(doctorId: any, date: any): Promise<any> {
      try {
        this.isLoading = true
        const response = await calendarService.registerFullTime(doctorId, date)
        this.isLoading = false
        return await Promise.resolve(response.data)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
    async getWorkingCalendar(start: any, end: any, filter: any): Promise<any> {
      try {
        this.isLoading = true
        const response = await calendarService.getWorkingCalendar(start, end, filter)
        this.isLoading = false
        return await Promise.resolve(response.data)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
    async getFullTimeNonAcceptWorkingCalendar(start: any, end: any, filter: any): Promise<any> {
      try {
        this.isLoading = true
        const response = await calendarService.getFullTimeNonAcceptWorkingCalendar(start, end, filter)
        this.isLoading = false
        return await Promise.resolve(response.data)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
    async getPartTimeNonAcceptWorkingCalendar(start: any, end: any, filter: any): Promise<any> {
      try {
        this.isLoading = true
        const response = await calendarService.getPartTimeNonAcceptWorkingCalendar(start, end, filter)
        this.isLoading = false
        return await Promise.resolve(response.data)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
    async updateWorkingCalendar(doctorId: any, data: any): Promise<any> {
      try {
        this.isLoading = true
        const response = await calendarService.updateWorkingCalendar(doctorId, data)
        this.isLoading = false
        return await Promise.resolve(response.data)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
  },
})