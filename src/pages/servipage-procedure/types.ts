export interface FilterService {
  pageNumber: number
  pageSize: number
  isActive: boolean
  orderBy?: string[]
}

export interface FilterProcedure {
  pageNumber: number
  pageSize: number
  isActive: boolean
  orderBy?: string[]
}

export interface ServiceDTO {
  id: string
  serviceName: string
  serviceDescription: string
  // isActive: boolean
  totalPrice: number
  isActive: boolean
  createBy: string
  createDate: string
}

export interface ProcedureDTO {
  id: string
  name: string
  description: string
  price: number
  createBy?: string
  createDate: Date
  isRemove: boolean
}

export interface ListServicePagination {
  data: ServiceDTO[]
  currentPage: number
  totalPages: number
  totalCount: number
  pageSize: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export interface ListProcedurePagination {
  data: ProcedureDTO[]
  currentPage: number
  totalPages: number
  totalCount: number
  pageSize: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export interface ServiceProcedureDTO {
  id: string
  serviceId: string
  procedureId: string
  createDate: string
  createBy: string
}

export interface ServiceProcedureDetail {
  serviceProcedureId: string // id từ bảng ServiceProcedures
  procedureDetail: ProcedureDTO // thông tin từ bảng Procedure
}

export interface ServiceDetailResponse {
  serviceID: string
  name: string
  description: string
  createBy: string
  createDate: string
  isActive: boolean
  totalPrice: number
  procedures: ProcedureResponse[]
}

export interface ProcedureResponse {
  procedureID: string
  name: string
  description: string
  price: number
  createBy: string
  createDate: string
  isRemove: boolean
}

export interface ProcedureFormData {
  name: string
  description: string
  price: number
}

export interface CreateServiceRequest {
  name: string
  description: string
  isModify: boolean
}

export interface UpdateServiceRequest {
  name: string
  description: string
}

export interface ToggleServiceStatusRequest {
  id: string
  activate: boolean
}

export interface DeletedServiceDTO {
  id: string
  serviceName: string
  serviceDescription: string
  totalPrice: number
  isActive: boolean
  createBy: string
  createDate: string
  deletedOn: string
  deletedBy: string
}

export interface ListDeletedServicePagination {
  data: DeletedServiceDTO[]
  currentPage: number
  totalPages: number
  totalCount: number
  pageSize: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}
