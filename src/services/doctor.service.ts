import apiService from './api.service'

class DoctorService {
  async getDoctors(data: any): Promise<any> {
    return apiService
      .post(`/users/get-doctors`, data)
      .then((response) => {
        return Promise.resolve(response)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }

  async getTopDoctors(): Promise<any> {
    return apiService
      .get(`/users/get-top-doctors`)
      .then((response) => {
        return Promise.resolve(response)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }

  async getAvailableTime(data: any): Promise<any> {
    return apiService
      .post(`/calendar/available-time`, data)
      .then((response) => {
        return Promise.resolve(response)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }
}

export default new DoctorService()
