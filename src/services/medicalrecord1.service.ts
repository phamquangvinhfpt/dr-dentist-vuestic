import apiService from './api.service'
import type { MedicalRecordListResponse } from '@/pages/MedicalRecordForPatient/types'

class MedicalRecord {
  async getMedicalRecord(userId: string, startDate: string, endDate: string): Promise<MedicalRecordListResponse> {
    const params = new URLSearchParams()
    if (startDate) params.append('Sdate', startDate)
    if (endDate) params.append('Edate', endDate)

    const queryString = params.toString()
    const url = `/medicalrecord/patient/${userId}${queryString ? `?${queryString}` : ''}`

    return apiService
      .get(url)
      .then((response) => response.data)
      .catch((error) => Promise.reject(error))
  }
}

export default new MedicalRecord()
