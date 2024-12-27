import { Search, SearchResponse } from '@/pages/appointment/types'
import { defineStore } from 'pinia'
import type {
  ListServicePagination,
  ListProcedurePagination,
  FilterService,
  FilterProcedure,
  ServiceDTO,
  ProcedureDTO,
  ServiceProcedureDetail,
  ServiceDetailResponse,
  UpdateServiceRequest,
  ToggleServiceStatusRequest,
  // ToggleServiceStatusResponse,
  ListDeletedServicePagination,
  TypeService,
} from '@/pages/servipage-procedure/types'
import serviceService from '@/services/service.service'
// import axios from 'axios'

export const useServiceStore = defineStore('service', {
  state: () => ({
    serviceList: {} as ListServicePagination,
    procedureList: {} as ListProcedurePagination,
    serviceProcedures: [] as ServiceProcedureDetail[],
    serviceDetail: null as ServiceDTO | null,
    services: [],
    isLoading: false,
    typeServices: [] as TypeService[],
  }),

  actions: {
    async getAllServices(filter: FilterService): Promise<ListServicePagination> {
      try {
        this.isLoading = true
        console.log('Store - GetAllServices called with filter:', filter)
        const response = await serviceService.getAllServices({
          pageNumber: filter.pageNumber,
          pageSize: filter.pageSize,
          isActive: filter.isActive,
          orderBy: filter.orderBy || [],
          advancedFilter: filter.advancedFilter,
        })
        console.log('Store - GetAllServices response:', response)
        this.serviceList = response
        this.isLoading = false
        return await Promise.resolve(response)
      } catch (error) {
        console.error('Store - GetAllServices error:', error)
        this.isLoading = false
        return await Promise.reject(error)
      }
    },

    async getAllProcedures(filter: FilterProcedure): Promise<ListProcedurePagination> {
      try {
        this.isLoading = true
        const response = await serviceService.getAllProcedures({
          pageNumber: filter.pageNumber,
          pageSize: filter.pageSize,
          isActive: filter.isActive,
          orderBy: filter.orderBy || [],
        })
        this.procedureList = response
        this.isLoading = false
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },

    async getDeletedServices(filter: FilterService): Promise<ListDeletedServicePagination> {
      try {
        this.isLoading = true
        console.log('Store - GetDeletedServices called with filter:', filter)
        const response = await serviceService.getDeletedServices({
          pageNumber: filter.pageNumber,
          pageSize: filter.pageSize,
          isActive: filter.isActive,
          orderBy: filter.orderBy || [],
          advancedFilter: filter.advancedFilter,
        })
        console.log('Store - GetDeletedServices response:', response)
        this.serviceList = response
        this.isLoading = false
        return await Promise.resolve(response)
      } catch (error) {
        console.error('Store - GetDeletedServices error:', error)
        this.isLoading = false
        return await Promise.reject(error)
      }
    },

    async restoreService(id: string): Promise<any> {
      try {
        this.isLoading = true
        const response = await serviceService.restoreService(id)
        this.isLoading = false
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },

    async getProceduresByServiceId(serviceId: string): Promise<ProcedureDTO[]> {
      try {
        this.isLoading = true
        const response = await serviceService.getProceduresByServiceId(serviceId)
        this.serviceProcedures = response.data
        this.isLoading = false
        return await Promise.resolve(response.data)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },

    async getServiceDetail(id: string) {
      try {
        this.isLoading = true
        const response = await serviceService.getServiceById(id)

        if (!response?.data) {
          throw new Error('No data received from API')
        }

        const serviceData = response.data as ServiceDetailResponse
        console.log('Service Data:', serviceData)
        this.serviceDetail = {
          serviceID: serviceData.serviceID,
          name: serviceData.name,
          description: serviceData.description,
          totalPrice: serviceData.totalPrice,
          isActive: serviceData.isActive,
          createBy: serviceData.createBy,
          createdOn: serviceData.createdOn,
          typeServiceID: serviceData.typeServiceID,
          typeName: serviceData.typeName,
          deletedOn: '',
          deletedBy: '',
        }

        const mappedProcedures = serviceData.procedures.map((proc) => ({
          serviceProcedureId: proc.procedureID,
          procedureDetail: {
            id: proc.procedureID,
            name: proc.name,
            description: proc.description,
            price: proc.price,
            createBy: proc.createBy,
            createdOn: proc.createdOn,
            isRemove: proc.isRemove,
            deletedOn: '',
            deletedBy: '',
          },
        }))

        this.serviceProcedures = mappedProcedures

        this.isLoading = false
        return serviceData
      } catch (error) {
        this.isLoading = false
        console.error('Error in getServiceDetail:', error)
        throw error
      }
    },

    async deleteService(id: string): Promise<any> {
      try {
        this.isLoading = true
        const response = await serviceService.deleteService(id)
        this.isLoading = false
        return response
      } catch (error) {
        this.isLoading = false
        throw error
      }
    },

    async addOrDeleteProcedures(serviceId: string, procedureId: string[], isRemove: boolean) {
      try {
        console.log('Store: Starting addOrDeleteProcedures...')
        console.log('Params:', { serviceId, procedureId, isRemove })

        this.isLoading = true
        const response = await serviceService.addOrDeleteProcedure(serviceId, procedureId, isRemove)
        console.log('Store: API Response:', response)

        await this.getServiceDetail(serviceId)
        this.isLoading = false
        return response
      } catch (error) {
        console.error('Store: Error in addOrDeleteProcedures:', error)
        this.isLoading = false
        throw error
      }
    },

    async createProcedure(data: { name: string; description: string; price: number }): Promise<any> {
      try {
        this.isLoading = true
        const response = await serviceService.createProcedure(data)
        this.isLoading = false
        return response
      } catch (error) {
        this.isLoading = false
        throw error
      }
    },

    async updateProcedure(id: string, data: { name: string; description: string; price: number }): Promise<any> {
      try {
        this.isLoading = true
        const response = await serviceService.updateProcedure(id, data)
        this.isLoading = false
        return response
      } catch (error) {
        this.isLoading = false
        throw error
      }
    },

    async deleteProcedure(id: string): Promise<any> {
      try {
        this.isLoading = true
        const response = await serviceService.deleteProcedure(id)
        this.isLoading = false
        return response
      } catch (error) {
        this.isLoading = false
        throw error
      }
    },

    async getDeletedProcedures(filter: FilterProcedure): Promise<ListProcedurePagination> {
      try {
        this.isLoading = true
        const response = await serviceService.getDeletedProcedures(filter)
        this.procedureList = response
        this.isLoading = false
        return response
      } catch (error) {
        this.isLoading = false
        throw error
      }
    },

    async restoreProcedure(id: string): Promise<any> {
      try {
        this.isLoading = true
        const response = await serviceService.restoreProcedure(id)
        this.isLoading = false
        return response
      } catch (error) {
        this.isLoading = false
        throw error
      }
    },

    async createService(data: { name: string; description: string; isModify: boolean; typeID: string }): Promise<any> {
      try {
        this.isLoading = true
        console.log('Store - CreateService called with data:', data)
        const response = await serviceService.createService(data)
        console.log('Store - CreateService response:', response)
        this.isLoading = false
        return Promise.resolve(response.data)
      } catch (error) {
        console.error('Store - CreateService error:', error)
        this.isLoading = false
        return Promise.reject(error)
      }
    },

    async updateService(id: string, data: UpdateServiceRequest) {
      try {
        this.isLoading = true
        const response = await serviceService.updateService(id, data)
        this.isLoading = false
        return Promise.resolve(response.data)
      } catch (error) {
        this.isLoading = false
        return Promise.reject(error)
      }
    },

    async toggleServiceStatus(data: ToggleServiceStatusRequest) {
      try {
        this.isLoading = true
        return await serviceService.toggleServiceStatus(data)
      } finally {
        this.isLoading = false
      }
    },
    async getAllCustomerServices() {
      try {
        this.isLoading = true
        const response = await serviceService.getAllCustomerServices()
        this.services = response.data
        this.isLoading = false
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
    async searchService(data: Search): Promise<SearchResponse> {
      return serviceService
        .searchService(data)
        .then((response) => {
          return Promise.resolve(response)
        })
        .catch((error) => {
          return Promise.reject(error)
        })
    },
    async getServiceTypes() {
      try {
        const response = await serviceService.getServiceTypes()
        this.typeServices = response.data
        console.log('Fetched Type Services:', this.typeServices)
        return response
      } catch (error) {
        console.error('Error fetching service types:', error)
        throw error
      }
    },

    async getServiceType(data: any): Promise<any> {
      return serviceService
        .getServiceType(data)
        .then((response) => {
          return Promise.resolve(response)
        })
        .catch((error) => {
          return Promise.reject(error)
        })
    },
  },
})
