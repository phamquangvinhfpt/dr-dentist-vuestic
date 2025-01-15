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
  async toogleFollowupAppointment(id: any): Promise<any> {
    return apiService
      .get(`/appointment/followup/checkin/${id}`)
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
  async updateTreatmentDetail(data: any): Promise<any> {
    return apiService
      .post(`/treatmentplan/update-detail`, data)
      .then((response) => {
        return Promise.resolve(response)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }
  async getRemainingAppointment(id: any): Promise<any> {
    return apiService
      .get(`/appointment/payment/${id}`)
      .then((response) => {
        return Promise.resolve(response)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }
  async sendPayment(data: any): Promise<any> {
    return apiService
      .post(`/appointment/payment/do`, data)
      .then((response) => {
        return Promise.resolve(response)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }
  async cancelPayment(code: any): Promise<any> {
    return apiService
      .delete(`/appointment/payment/cancel/${code}`)
      .then((response) => {
        return Promise.resolve(response)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }
  async getPrescription(id: any): Promise<any> {
    return apiService
      .get(`/treatmentplan/precsription/get/${id}`)
      .then((response) => {
        return Promise.resolve(response)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }
}

export const treatmentService = new TreatmentClass()
