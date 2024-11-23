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
  async doTreatment(id: any): Promise<any> {
    return apiService
      .get(`/treatmentplan/examination/${id}`)
      .then((response) => {
        return Promise.resolve(response)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }
  async addTreatmentDetail(data: any): Promise<any> {
    return apiService
      .post(`/treatmentplan/add-detail`, data)
      .then((response) => {
        return Promise.resolve(response)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }
}

export const treatmentService = new TreatmentClass()
