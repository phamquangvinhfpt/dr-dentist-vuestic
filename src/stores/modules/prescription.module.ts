import { PrescriptionResponse } from '@/pages/examination/types'
import { prescriptionService } from '@/services/prescription.service'
import { defineStore } from 'pinia'

export const usePrescriptionStore = defineStore('prescription', {
  state: () => ({}),
  actions: {
    async getPrescriptionByTreatmentID(id: string): Promise<PrescriptionResponse> {
      return prescriptionService
        .getPrescriptionByTreatmentID(id)
        .then((response) => {
          return Promise.resolve(response)
        })
        .catch((error) => {
          return Promise.reject(error)
        })
    },
    async getPrescriptionByPatientID(id: string): Promise<PrescriptionResponse> {
      return prescriptionService
        .getPrescriptionByPatientID(id)
        .then((response) => {
          return Promise.resolve(response)
        })
        .catch((error) => {
          return Promise.reject(error)
        })
    },
    async createPrescription(data: any): Promise<any> {
      return prescriptionService
        .createPrescription(data)
        .then((response) => {
          return Promise.resolve(response)
        })
        .catch((error) => {
          return Promise.reject(error)
        })
    },
  },
})
