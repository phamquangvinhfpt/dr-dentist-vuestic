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
        // Lưu thông tin bác sĩ vào state nếu cần
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
        FirstName: string
        LastName: string
        Email: string
        IsMale: boolean
        BirthDay: string
        UserName: string
        Password: string
        ConfirmPassword: string
        PhoneNumber: string
        Job: string
        Address: string
        DoctorProfile: {
          DoctorID: string
          TypeServiceID: string
          Education: string
          College: string
          Certification: string
          CertificationImage: string // Thêm CertificationImage
          YearOfExp: string
          SeftDescription: string
          WorkingType: number
        }
        Role: string
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
    async getRoom(data: { pageNumber: number; pageSize: number }): Promise<any> {
      try {
        this.isLoading = true
        const response = await doctorService.getRoom(data)
        this.isLoading = false
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
    async createRoom(data: { name: string }): Promise<any> {
      try {
        this.isLoading = true
        const response = await doctorService.createRoom(data)
        this.isLoading = false
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
  },
})
