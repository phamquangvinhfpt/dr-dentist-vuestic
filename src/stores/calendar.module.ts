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
  },
})
