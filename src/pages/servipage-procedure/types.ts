export interface FilterService {
  pageNumber: number
  pageSize: number
  isActive: boolean
  orderBy?: string[]
  advancedFilter?: {
    logic: string
    filters: Array<{
      field: string
      operator: string
      value: string
    }>
  } | null
}

export interface FilterProcedure {
  pageNumber: number
  pageSize: number
  isActive: boolean
  orderBy?: string[]
}

export interface ServiceDTO {
  serviceID: string
  name: string
  description: string
  totalPrice: number
  isActive: boolean
  createBy: string
  createdOn: string
  typeServiceID: string
  typeName: string
  deletedOn: string
  deletedBy: string
}

export interface ProcedureDTO {
  id: string
  name: string
  description: string
  price: number
  createBy?: string
  createdOn: string
  isRemove: boolean
  deletedOn: string
  deletedBy: string
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
  createdOn: string
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
  createdOn: string
  isActive: boolean
  totalPrice: number
  typeServiceID: string
  typeName: string
  procedures: ProcedureResponse[]
}

export interface ProcedureResponse {
  procedureID: string
  name: string
  description: string
  price: number
  createBy: string
  createdOn: string
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
  typeID: string
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
  serviceID: string
  name: string
  description: string
  totalPrice: number
  isActive: boolean
  createBy: string
  createdOn: string
  deletedOn: string
  deletedBy: string
  typeServiceID: string
  typeName: string
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

export type TypeService = {
  id: string
  typeName: string
}
