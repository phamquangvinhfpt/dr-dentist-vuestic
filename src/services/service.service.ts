import { Search, SearchResponse } from '@/pages/appointment/types'
import apiService from './api.service'
import type {
  FilterService,
  FilterProcedure,
  UpdateServiceRequest,
  ToggleServiceStatusRequest,
} from '@/pages/servipage-procedure/types'
// import axios from 'axios'

class ServiceService {
  async getAllServices(filter: FilterService): Promise<any> {
    console.log('GetAllServices - Request filter:', filter)
    const requestBody = {
      pageNumber: filter.pageNumber,
      pageSize: filter.pageSize,
      isActive: filter.isActive,
      orderBy: filter.orderBy || [],
      advancedFilter: filter.advancedFilter || null,
    }
    console.log('GetAllServices - Request body:', requestBody)

    return apiService
      .post(`/service/pagination/get-all`, requestBody)
      .then((response) => {
        console.log('GetAllServices - Response:', response.data)
        return Promise.resolve(response.data)
      })
      .catch((error) => {
        console.error('GetAllServices - Error:', error)
        return Promise.reject(error)
      })
  }

  async getAllProcedures(filter: FilterProcedure): Promise<any> {
    return apiService
      .post(`/service/procedure/pagination/get-all`, filter)
      .then((response) => {
        return Promise.resolve(response.data)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }

  async getServiceById(id: string): Promise<any> {
    try {
      const response = await apiService.get(`/service/${id}/get`)
      console.log('API Response in service:', response) // Debug log

      if (!response || !response.data) {
        throw new Error('Invalid response from API')
      }

      return {
        data: response.data, // Tr về trực tiếp response.data
      }
    } catch (error) {
      console.error('Error in getServiceById:', error) // Debug log
      throw error
    }
  }

  async getProcedureById(id: string): Promise<any> {
    return apiService
      .get(`/service/procedure/${id}/get`)
      .then((response) => {
        return Promise.resolve(response.data)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }

  async getDeletedServices(filter: FilterService): Promise<any> {
    console.log('GetDeletedServices - Request filter:', filter)
    const requestBody = {
      pageNumber: filter.pageNumber,
      pageSize: filter.pageSize,
      isActive: filter.isActive,
      orderBy: filter.orderBy || [],
      advancedFilter: filter.advancedFilter || null,
    }
    console.log('GetDeletedServices - Request body:', requestBody)

    return apiService
      .post(`/service/bin`, requestBody)
      .then((response) => {
        console.log('GetDeletedServices - Response:', response.data)
        return Promise.resolve(response.data)
      })
      .catch((error) => {
        console.error('GetDeletedServices - Error:', error)
        return Promise.reject(error)
      })
  }

  async restoreService(id: string): Promise<any> {
    return apiService
      .get(`/service/${id}/restore`)
      .then((response) => {
        return Promise.resolve(response.data)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }

  async getProceduresByServiceId(id: string): Promise<any> {
    return apiService
      .get(`/service/${id}/get`)
      .then((response) => {
        return Promise.resolve(response.data)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }

  async deleteService(id: string): Promise<any> {
    return apiService
      .delete(`/service/${id}/delete`)
      .then((response) => {
        return Promise.resolve(response.data)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }

  async addOrDeleteProcedure(serviceId: string, procedureId: string[], isRemove: boolean = false): Promise<any> {
    console.log('Service: Making API call with:', {
      serviceID: serviceId,
      procedureID: procedureId,
      isRemove: isRemove,
    })

    return apiService
      .post('/service/add-delete-procedure', {
        serviceID: serviceId,
        procedureID: procedureId,
        isRemove: isRemove,
      })
      .then((response) => {
        console.log('Service: API Response:', response)
        return response.data
      })
      .catch((error) => {
        console.error('Service: API Error:', error)
        return Promise.reject(error)
      })
  }

  async createProcedure(data: { name: string; description: string; price: number }): Promise<any> {
    return apiService
      .post('/service/procedure/create-procedure', data)
      .then((response) => Promise.resolve(response.data))
      .catch((error) => Promise.reject(error))
  }

  async updateProcedure(id: string, data: { name: string; description: string; price: number }): Promise<any> {
    return apiService
      .put(`/service/procedure/${id}/update`, data)
      .then((response) => Promise.resolve(response.data))
      .catch((error) => Promise.reject(error))
  }

  async deleteProcedure(id: string): Promise<any> {
    return apiService
      .delete(`/service/procedure/${id}/delete`)
      .then((response) => Promise.resolve(response.data))
      .catch((error) => Promise.reject(error))
  }

  async getDeletedProcedures(filter: FilterProcedure): Promise<any> {
    return apiService
      .post('/service/procedure/bin', filter)
      .then((response) => Promise.resolve(response.data))
      .catch((error) => Promise.reject(error))
  }

  async restoreProcedure(id: string): Promise<any> {
    return apiService
      .get(`/service/procedure/${id}/restore`)
      .then((response) => Promise.resolve(response.data))
      .catch((error) => Promise.reject(error))
  }

  createService(data: { name: string; description: string; isModify: boolean }) {
    console.log('CreateService - Request data:', data)
    return apiService
      .post('/service/create', data)
      .then((response) => {
        console.log('CreateService - Response:', response.data)
        return response
      })
      .catch((error) => {
        console.error('CreateService - Error:', error.response?.data || error)
        return Promise.reject(error)
      })
  }

  updateService(id: string, data: UpdateServiceRequest) {
    return apiService.post('/service/modify', { id, ...data })
  }

  async toggleServiceStatus(data: ToggleServiceStatusRequest): Promise<any> {
    return apiService
      .post('/service/toggle', {
        id: data.id,
        activate: data.activate,
      })
      .then((response) => response.data)
  }

  async getAllCustomerServices(): Promise<any> {
    return apiService
      .get('/service/customer-get-all')
      .then((response) => {
        return Promise.resolve(response)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }

  async searchService(data: Search): Promise<SearchResponse> {
    return apiService
      .post('/service/pagination/get-all', data)
      .then((response) => {
        return Promise.resolve(response.data)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }

  async getServiceTypes(): Promise<any> {
    return apiService
      .post('/service/type', {})
      .then((response) => {
        console.log('Service Type Response:', response.data)
        return Promise.resolve(response.data)
      })
      .catch((error) => {
        console.error('Error fetching service types:', error)
        return Promise.reject(error)
      })
  }

  async getServiceType(data: any): Promise<any> {
    return apiService
      .post('/service/type', data)
      .then((response) => {
        return Promise.resolve(response.data)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }

  async getServiceByIdForCustomer(id: string): Promise<any> {
    try {
      const response = await apiService.get(`/service/customer/get/${id}`)
      console.log('API Response in service:', response) // Debug log

      if (!response || !response.data) {
        throw new Error('Invalid response from API')
      }

      return {
        data: response.data, // Tr về trực tiếp response.data
      }
    } catch (error) {
      console.error('Error in getServiceById:', error) // Debug log
      throw error
    }
  }
}
export default new ServiceService()
