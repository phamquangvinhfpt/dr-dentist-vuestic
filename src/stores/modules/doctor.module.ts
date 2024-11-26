import { Doctors } from '@/pages/home/dashboard/widgets/types'
import doctorService from '@/services/doctor.service'
import { defineStore } from 'pinia'

export const useDoctorProfileStore = defineStore('doctorProfile', {
  state: () => ({
    doctors: [] as Doctors[],
    isLoading: false as boolean,
    doctorId: '' as string,
  }),
  actions: {
    async getDoctors(data: any): Promise<any> {
      try {
        this.isLoading = true
        const response = await doctorService.getDoctors(data)
        this.isLoading = false
        console.log(response)
        this.doctors = [...response.data]
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        console.error('Store error:', error)
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
    async getDoctorDetail(id: string): Promise<any> {
      try {
        this.isLoading = true
        const response = await doctorService.getDoctorDetail(id)
        this.isLoading = false
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
    async updateDoctor(id: string, doctorData: any): Promise<any> {
      try {
        this.isLoading = true
        const response = await doctorService.updateDoctor(id, doctorData)
        this.isLoading = false
        // Optionally update the local state with the updated doctor
        const index = this.doctors.findIndex((doctor) => doctor.id === id)
        if (index !== -1) {
          this.doctors[index] = { ...this.doctors[index], ...doctorData }
        }
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
    async deleteDoctor(id: string): Promise<any> {
      try {
        this.isLoading = true
        const response = await doctorService.toggleDoctorStatus(id, { isActive: false })
        this.isLoading = false
        // Optionally remove the doctor from the local state
        this.doctors = this.doctors.filter((doctor) => doctor.id !== id)
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
    async createDoctor(doctorData: {
      request: {
        firstName: string
        lastName: string
        email: string
        isMale: boolean
        birthDay: string
        userName: string
        password: string
        confirmPassword: string
        phoneNumber: string
        job: string
        address: string
        doctorProfile: {
          doctorID: string
          education: string
          college: string
          certification: string
          yearOfExp: string
          seftDescription: string
        }
        role: string
      }
    }): Promise<any> {
      try {
        this.isLoading = true
        const response = await doctorService.createDoctor(doctorData)
        this.isLoading = false
        await this.getDoctors(null)
        return response
      } catch (error) {
        this.isLoading = false
        return Promise.reject(error)
      }
    },
  },
})
