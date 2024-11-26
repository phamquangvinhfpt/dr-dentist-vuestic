import medicalrecordService from '@/services/medicalrecord1.service'
import { defineStore } from 'pinia'
import type { MedicalRecordListResponse } from '@/pages/MedicalRecordForPatient/types'

export const useMedicalRecordStore = defineStore('medicalRecord', {
  state: () => ({
    isLoading: false as boolean,
  }),
  actions: {
    async getMedicalRecord(id: string, startDate: string, endDate: string): Promise<MedicalRecordListResponse> {
      try {
        this.isLoading = true
        const response = await medicalrecordService.getMedicalRecord(id, startDate, endDate)
        return response
      } catch (error) {
        return Promise.reject(error)
      } finally {
        this.isLoading = false
      }
    },
  },
})
