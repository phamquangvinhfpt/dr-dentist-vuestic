import apiService from './api.service'

class DoctorService {
  async getDoctors(data: any, date?: any): Promise<any> {
    let url = ''
    if (date) {
      url = `/users/get-doctors?date=${date}`
    } else {
      url = `/users/get-doctors`
    }
    return apiService
      .post(url, data)
      .then((response) => {
        return response.data
      })
      .catch((error) => {
        console.error('Service error:', error)
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

  async getDoctorDetail(id: string): Promise<any> {
    return apiService
      .post(`/users/customer/get-doctor/${id}`, {}) // Added an empty object as the second argument
      .then((response) => {
        return Promise.resolve(response.data)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }
  async updateDoctor(id: string, doctorData: any): Promise<any> {
    return apiService
      .post(`/users/customer/update-doctor/${id}`, doctorData) // Adjust the endpoint as necessary
      .then((response) => {
        return Promise.resolve(response.data)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }

  async toggleDoctorStatus(id: string, data: { isActive: boolean }): Promise<any> {
    return apiService
      .post(`/users/toggle-status/${id}`, data) // Adjust the endpoint as necessary
      .then((response) => {
        return Promise.resolve(response.data)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }
  async createDoctor(doctorData: {
    request: {
      firstName: string
      lastName: string
      email: string
      isMale: boolean
      birthDay: string
      userName: string
      password: string
      confirmPassword: string
      phoneNumber: string
      job: string
      address: string
      doctorProfile: {
        doctorID: string
        education: string
        college: string
        certification: string
        yearOfExp: string
        seftDescription: string
      }
      role: string
    }
  }): Promise<any> {
    return apiService
      .post('/users/create-user', doctorData.request)
      .then((response) => Promise.resolve(response.data))
      .catch((error) => Promise.reject(error))
  }
  async getAvailableDoctors(data: any): Promise<any> {
    return apiService
      .post(`/appointment/doctor/available`, data)
      .then((response) => {
        return Promise.resolve(response.data)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }
}

export default new DoctorService()
