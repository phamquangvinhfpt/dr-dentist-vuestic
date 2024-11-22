import apiService from './api.service'

class TreatmentClass {
  async toogleAppointment(id: any): Promise<any> {
    return apiService
      .get(`/appointment/examination/${id}`)
      .then((response) => {
        return Promise.resolve(response)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }
  async getTreatmentList(id: any): Promise<any> {
    return apiService
      .get(`/treatmentplan/get/${id}`)
      .then((response) => {
        return Promise.resolve(response)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }
}

export const treatmentService = new TreatmentClass()