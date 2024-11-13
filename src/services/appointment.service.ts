import apiService from './api.service'

class AppointmentService {
  async createAppointment(appointment: any): Promise<any> {
    return apiService
      .post(`/appointment/create`, appointment)
      .then((response) => {
        return Promise.resolve(response)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }
}
export default new AppointmentService()
