import { defineStore } from 'pinia'
import formService from '@/services/form.service'
import type {
  ListFormPagination,
  FilterForm,
  ApplicationFormRequest,
  ToggleFormStatusRequest,
} from '@/pages/Form-Application/types'

interface FormState {
  formList: ListFormPagination | null
  isLoading: boolean
  availableTimeSlots: any[]
}

export const useFormStore = defineStore('form', {
  state: (): FormState => ({
    formList: null,
    isLoading: false,
    availableTimeSlots: [],
  }),

  actions: {
    async getWorkingCalendar(start: string, end: string, filter: any): Promise<any> {
      try {
        this.isLoading = true
        const response = await formService.getWorkingCalendar(start, end, filter)
        this.isLoading = false
        return await Promise.resolve(response.data)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },

    async getAvailableTimeSlots(data: any): Promise<any> {
      try {
        this.isLoading = true
        const response = await formService.getAvailableTimeSlots(data)
        this.isLoading = false
        this.availableTimeSlots = response?.data
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },

    async getAllForms(filter: FilterForm): Promise<ListFormPagination> {
      try {
        this.isLoading = true
        const response = await formService.getAllForms(filter)
        this.formList = response
        return response
      } catch (error) {
        console.error('Store - GetAllForms error:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async submitForm(formData: ApplicationFormRequest) {
      try {
        this.isLoading = true
        const response = await formService.submitApplicationForm(formData)
        return response
      } catch (error) {
        console.error('Error in submitForm:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async getTimeWorkingOfDoctor(data: { userID: string; date: string }): Promise<any> {
      try {
        this.isLoading = true
        const response = await formService.getTimeWorkingOfDoctor(data)
        return response
      } catch (error) {
        console.error('Store - GetTimeWorkingOfDoctor error:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async toggleFormStatus(data: ToggleFormStatusRequest): Promise<any> {
      try {
        this.isLoading = true
        const response = await formService.toggleFormStatus({
          formID: data.formID,
          status: data.status,
          note: data.note,
        })
        return response
      } catch (error) {
        console.error('Error in toggleFormStatus:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },
  },
})
