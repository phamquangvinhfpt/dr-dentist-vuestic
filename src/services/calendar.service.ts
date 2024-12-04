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
}

export default new CalendarService()
