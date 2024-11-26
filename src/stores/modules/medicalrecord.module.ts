import medicalrecordService from '@/services/medicalrecord.service'
import { defineStore } from 'pinia'

export const useMedicalRecordStore = defineStore('medicalRecord', {
  state: () => ({
    isLoading: false as boolean,
  }),
  actions: {
    async getMedicalRecord(id: string): Promise<any> {
      try {
        this.isLoading = true
        const response = await medicalrecordService.getMedicalRecord(id)
        this.isLoading = false
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
    async createMedicalRecord(data: any): Promise<any> {
      try {
        this.isLoading = true
        const response = await medicalrecordService.createMedicalRecord(data)
        this.isLoading = false
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
  },
})
