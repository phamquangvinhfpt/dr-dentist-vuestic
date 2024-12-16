import apiService from './api.service'
import { LeaveType } from '../pages/Form-Application/types'
import type {
  FilterForm,
  ApplicationFormRequest,
  ToggleFormStatusRequest,
  ToggleFormStatusResponse,
} from '../pages/Form-Application/types'

class FormService {
  async getAllForms(filter: FilterForm): Promise<any> {
    console.log('GetAllForms - Request filter:', filter)
    return apiService
      .post(`/v1/form/get-all`, filter)
      .then((response) => {
        console.log('GetAllForms - Response:', response.data)
        return Promise.resolve(response.data)
      })
      .catch((error) => {
        console.error('GetAllForms - Error:', error)
        return Promise.reject(error)
      })
  }

  async submitApplicationForm(data: ApplicationFormRequest): Promise<any> {
    try {
      const requestData = {
        ...data,
        timeID: data.leaveType === LeaveType.ALL_DAY ? undefined : data.timeID,
      }

      const response = await apiService.post('/v1/form/add', requestData)
      return response.data
    } catch (error) {
      console.error('Error in submitApplicationForm:', error)
      throw error
    }
  }

  async getWorkingCalendar(start: string, end: string, filter: any): Promise<any> {
    return apiService
      .post(`/workingcalendar/working-calendar?startDate=${start}&endDate=${end}`, filter)
      .then((response) => {
        return Promise.resolve(response)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }

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

  async getTimeWorkingOfDoctor(data: { userID: string; date: string }): Promise<any> {
    return apiService
      .post('/workingcalendar/time/get', data)
      .then((response) => {
        return response.data
      })
      .catch((error) => {
        console.error('GetTimeWorkingOfDoctor - Error:', error)
        throw error
      })
  }

  async toggleFormStatus(data: ToggleFormStatusRequest): Promise<ToggleFormStatusResponse> {
    try {
      const response = await apiService.post('/v1/form/toggle', {
        formID: data.formID,
        status: data.status,
        note: data.note,
      })
      return response.data
    } catch (error) {
      console.error('Error in toggleFormStatus:', error)
      throw error
    }
  }

  // Thêm các phương thức khác nếu cần
}

export default new FormService()
