import apiService from './api.service'

class CalendarService {
  async getAvailableTimeSlots(data: any): Promise<any> {
    return apiService
      .post(`/calendar/available-time`, data)
      .then((response) => {
        return Promise.resolve(response)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }
  async registerFullTime(doctorId: any, date: any): Promise<any> {
    return apiService
      .post(`/workingcalendar/register-fulltime?doctorId=${doctorId}&date=${date}`, {})
      .then((response) => {
        return Promise.resolve(response)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }
  async registerPartTime(doctorId: any, data: any): Promise<any> {
    return apiService
      .post(`/workingcalendar/create-parttime?doctorId=${doctorId}`, data)
      .then((response) => {
        return Promise.resolve(response)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }
  async getWorkingCalendar(start: any, end: any, filter: any): Promise<any> {
    return apiService
      .post(`/workingcalendar/working-calendar?startDate=${start}&endDate=${end}`, filter)
      .then((response) => {
        return Promise.resolve(response)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }
  async getFullTimeNonAcceptWorkingCalendar(start: any, end: any, filter: any): Promise<any> {
    return apiService
      .post(`/workingcalendar/full-time/non-accept?startDate=${start}&endDate=${end}`, filter)
      .then((response) => {
        return Promise.resolve(response)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }
  async getPartTimeNonAcceptWorkingCalendar(start: any, end: any, filter: any): Promise<any> {
    return apiService
      .post(`/workingcalendar/part-time/non-accept?startDate=${start}&endDate=${end}`, filter)
      .then((response) => {
        return Promise.resolve(response)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }
  async updateWorkingCalendar(doctorId: any, data: any): Promise<any> {
    return apiService
      .put(`/workingcalendar/update?doctorId=${doctorId}`, data)
      .then((response) => {
        return Promise.resolve(response)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }
  async createWorkingCalendar(doctorId: any, data: any): Promise<any> {
    return apiService
      .post(`/workingcalendar/create-parttime?doctorId=${doctorId}`, data)
      .then((response) => {
        return Promise.resolve(response)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }
  async getAllRoom(data: any): Promise<any> {
    return apiService
      .post(`/workingcalendar/room/get-all`, data)
      .then((response) => {
        return Promise.resolve(response)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }
  async addRoom(data: any): Promise<any> {
    return apiService
      .post(`/workingcalendar/add-room/auto`, data)
      .then((response) => {
        return Promise.resolve(response)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }
  async getDoctorHasNoCalendar(data: any): Promise<any> {
    return apiService
      .get(`/workingcalendar/get/non-calendar?date=${data}`)
      .then((response) => {
        return Promise.resolve(response)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }
  async getFollowupDetail(data: any): Promise<any> {
    return apiService
      .post(`/calendar/detail/${data}`, {})
      .then((response) => {
        return Promise.resolve(response)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }
  async reminderPartTime(id: any, date: any): Promise<any> {
    return apiService
      .post(`/workingcalendar/part-time/reminder/${id}?date=${date}`, {})
      .then((response) => {
        return Promise.resolve(response)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }
}

export default new CalendarService()
