import apiService from './api.service'

class PrescriptionClass {
  async getPrescriptionByTreatmentID(id: string): Promise<any> {
    return apiService
      .get(`/treatmentplan/precsription/get/${id}`)
      .then((response) => {
        return Promise.resolve(response.data)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }
  async getPrescriptionByPatientID(id: string): Promise<any> {
    return apiService
      .get(`/treatmentplan/precsription/patient/get/${id}`)
      .then((response) => {
        return Promise.resolve(response.data)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }
  async createPrescription(data: any): Promise<any> {
    return apiService
      .post('/treatmentplan/precsription/add', data)
      .then((response) => {
        return Promise.resolve(response.data)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }
}
export const prescriptionService = new PrescriptionClass()
