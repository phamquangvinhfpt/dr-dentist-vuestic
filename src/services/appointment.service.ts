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
  async listAppointments(): Promise<any[]> {
    // Change return type to any[]
    return apiService
      .post('/appointment/get-all', {}) // Adjust the endpoint as needed and add an empty object as the second argument
      .then((response) => {
        return Promise.resolve(response.data.data) // Return the list of appointments
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }
}
export default new AppointmentService()
