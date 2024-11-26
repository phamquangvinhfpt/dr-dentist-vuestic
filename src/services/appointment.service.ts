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
  async getAppointments(search: any): Promise<any> {
    let url
    if (!search.date) {
      url = `/appointment/get-all`
    } else {
      url = `/appointment/get-all?date=${search.date}`
    }
    return apiService
      .post(url, search)
      .then((response) => {
        return Promise.resolve(response.data)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }
  async getFollowUpAppointments(search: any): Promise<any> {
    let url
    if (!search.date) {
      url = `/appointment/follow/get-all`
    } else {
      url = `/appointment/follow/get-all?date=${search.date}`
    }
    return apiService
      .post(url, search)
      .then((response) => {
        return Promise.resolve(response.data)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }
  async getNonDoctorsAppointments(search: any): Promise<any> {
    let url
    if (!search.date && !search.time) {
      url = `/appointment/non-doctor/get-all`
    } else if (!search.time) {
      url = `/appointment/non-doctor/get-all?date=${search.date}`
    } else if (!search.date) {
      url = `/appointment/non-doctor/get-all?time=${search.time}`
    } else {
      url = `/appointment/non-doctor/get-all?date=${search.date}&time=${search.time}`
    }
    return apiService
      .post(url, search)
      .then((response) => {
        return Promise.resolve(response.data)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }
  async assignDoctor(data: any): Promise<any> {
    return apiService
      .post(`/appointment/non-doctor/add-doctor`, data)
      .then((response) => {
        return Promise.resolve(response)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }
  async rescheduleAppointment(data: any): Promise<any> {
    return apiService
      .post(`/appointment/reschedule`, data)
      .then((response) => {
        return Promise.resolve(response)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }
  async cancelAppointment(data: any): Promise<any> {
    return apiService
      .post(`/appointment/cancel`, data)
      .then((response) => {
        return Promise.resolve(response)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }
  async getAppointmentById(appointmentId: string): Promise<any> {
    return apiService
      .get(`/appointment/get/${appointmentId}`)
      .then((response) => {
        return Promise.resolve(response.data)
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
        return Promise.resolve(response.data) // Return the list of appointments
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }
}
export default new AppointmentService()
