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
      .post(`/users/${id}/toggle-status`, data) // Updated the endpoint to match the correct API path
      .then((response) => {
        return Promise.resolve(response.data)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }
  async createDoctor(doctorData: {
    request: {
      FirstName: string
      LastName: string
      Email: string
      IsMale: boolean
      BirthDay: string
      UserName: string
      Password: string
      ConfirmPassword: string
      PhoneNumber: string
      Job: string
      Address: string
      DoctorProfile: {
        DoctorID: string
        TypeServiceID: string
        Education: string
        College: string
        Certification: string
        CertificationImage: File[]
        YearOfExp: string
        SeftDescription: string
        WorkingType: number
      }
      Role: string
    }
  }): Promise<any> {
    const formData = new FormData()

    // Thêm các field thông thường
    formData.append('FirstName', doctorData.request.FirstName)
    formData.append('LastName', doctorData.request.LastName)
    formData.append('Email', doctorData.request.Email)
    formData.append('IsMale', doctorData.request.IsMale.toString())
    formData.append('BirthDay', doctorData.request.BirthDay)
    formData.append('UserName', doctorData.request.UserName)
    formData.append('Password', doctorData.request.Password)
    formData.append('ConfirmPassword', doctorData.request.ConfirmPassword)
    formData.append('PhoneNumber', doctorData.request.PhoneNumber)
    formData.append('Job', doctorData.request.Job)
    formData.append('Address', doctorData.request.Address)
    formData.append('Role', doctorData.request.Role)

    // Thêm các field trong DoctorProfile
    formData.append('DoctorProfile.DoctorID', doctorData.request.DoctorProfile.DoctorID)
    formData.append('DoctorProfile.TypeServiceID', doctorData.request.DoctorProfile.TypeServiceID)
    formData.append('DoctorProfile.Education', doctorData.request.DoctorProfile.Education)
    formData.append('DoctorProfile.College', doctorData.request.DoctorProfile.College)
    formData.append('DoctorProfile.Certification', doctorData.request.DoctorProfile.Certification)
    formData.append('DoctorProfile.YearOfExp', doctorData.request.DoctorProfile.YearOfExp)
    formData.append('DoctorProfile.SeftDescription', doctorData.request.DoctorProfile.SeftDescription)
    formData.append('DoctorProfile.WorkingType', doctorData.request.DoctorProfile.WorkingType.toString())

    // Add CertificationImage (array)
    if (Array.isArray(doctorData.request.DoctorProfile.CertificationImage)) {
      doctorData.request.DoctorProfile.CertificationImage.forEach((image: File) => {
        formData.append(`DoctorProfile.CertificationImage`, image)
      })
    }

    // Send request as multipart/form-data
    return apiService
      .post('/users/create-user', formData)
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

  async createRoom(data: { name: string }): Promise<any> {
    return apiService
      .post(`/workingcalendar/create-room`, data) // Gọi API để tạo phòng
      .then((response) => {
        return Promise.resolve(response.data) // Trả về dữ liệu phản hồi
      })
      .catch((error) => {
        return Promise.reject(error) // Xử lý lỗi
      })
  }
  async getRoom(data: { pageNumber: number; pageSize: number }): Promise<any> {
    return apiService
      .post(`/workingcalendar/room/get-all`, data) // Updated to send the data object
      .then((response) => {
        return Promise.resolve(response.data) // Adjusted to return response.data
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }
}

export default new DoctorService()
