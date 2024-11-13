import { Doctors } from '@/pages/home/dashboard/widgets/types'
import doctorService from '@/services/doctor.service'
import { defineStore } from 'pinia'

export const useDoctorProfileStore = defineStore('doctorProfile', {
  state: () => ({
    doctors: [] as Doctors[],
    isLoading: false as boolean,
  }),
  actions: {
    async getDoctors(data: any): Promise<any> {
      try {
        this.isLoading = true
        const response = await doctorService.getDoctors(data)
        this.isLoading = false
        this.doctors = [...response.data.data]
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
    async getTopDoctors(): Promise<any> {
      try {
        this.isLoading = true
        const response = await doctorService.getTopDoctors()
        this.isLoading = false
        this.doctors = [...response.data]
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
    async getAvailableTime(data: any): Promise<any> {
      try {
        this.isLoading = true
        const response = await doctorService.getAvailableTime(data)
        this.isLoading = false
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
  },
})
