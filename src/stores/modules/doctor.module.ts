import {
  DoctorDetail,
  DoctorDetailsUpdate,
  ListDoctorPagination,
  FilterDoctor,
  // DoctorDetailFormData,
} from '@/pages/user/types'
import { defineStore } from 'pinia'
import doctorService from '@services/doctor.service'
import { useAuthStore } from './auth.module'

export const useDoctorStore = defineStore('doctorStore', {
  state: () => ({
    id: '' as string,
    doctorList: {} as ListDoctorPagination,
    doctorDetails: {} as DoctorDetail,
    isLoading: false as boolean,
  }),
  actions: {
    async getDoctorProfile(): Promise<any> {
      try {
        this.isLoading = true
        const response = await doctorService.getDoctorProfile()
        this.isLoading = false
        this.doctorDetails = { ...response?.data }
        useAuthStore().setUserDetails({ ...response?.data })
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },

    async updateDoctorProfile(data: DoctorDetailsUpdate): Promise<any> {
      try {
        this.isLoading = true
        const response = await doctorService.updateProfile(data)
        this.isLoading = false
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },

    async uploadAvatar(data: FormData): Promise<any> {
      try {
        this.isLoading = true
        const response = await doctorService.uploadAvatar(data)
        this.isLoading = false
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },

    async removeAvatar(data: FormData): Promise<any> {
      try {
        this.isLoading = true
        const response = await doctorService.removeAvatar(data)
        this.isLoading = false
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },

    async getDoctorDetail(id: string): Promise<DoctorDetail> {
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

    async getDoctors(filter: FilterDoctor): Promise<ListDoctorPagination> {
      try {
        this.isLoading = true
        const response = await doctorService.getAllDoctors(filter)
        this.isLoading = false
        this.doctorList = response
        return await Promise.resolve(this.doctorList)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
  },
})
