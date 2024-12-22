export interface PaginationFilter {
  pageNumber: number
  pageSize: number
  orderBy?: string[]
  advancedSearch?: {
    fields: string[]
    keyword?: string
  }
  keyword?: string
  advancedFilter?: {
    logic: string
    filters: Array<{
      field: string
      operator: string
      value: string
    }>
  }
}

export interface PaymentDTO {
  paymentId: string
  patientProfileId: string
  patientName: string
  patientCode: string
  appointmentId: string
  serviceId: string
  serviceName: string
  depositAmount: number
  depositDate: string | null
  remainingAmount: number
  totalAmount: number
  method: PaymentMethod
  status: PaymentStatus
}

export enum PaymentMethod {
  None = 0,
  Cash = 1,
  BankTransfer = 2,
}

export enum PaymentStatus {
  Waiting = 0,
  Incomplete = 1,
  Completed = 2,
  Canceled = 3,
  Failed = 4,
}

export interface PaginationResponse<T> {
  data: T[]
  currentPage: number
  totalPages: number
  totalCount: number
  pageSize: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface PaymentResponse {
  messages: string[]
  data: {
    data: PaymentDTO[]
    currentPage: number
    totalPages: number
    totalCount: number
    pageSize: number
    hasPreviousPage: boolean
    hasNextPage: boolean
  }
  source: string
  exception: string | null
  errorId: string | null
  supportMessage: string | null
  statusCode: number
}

export interface PaymentDetailDTO {
  procedureId: string
  procedureName: string
  paymentAmount: number
  paymentStatus: number
}

export interface PaymentDetailResponse {
  messages: string[]
  data: {
    paymentResponse: {
      appointmentId: string
      depositAmount: number
      depositDate: string | null
      method: number
      patientCode: string
      patientName: string
      patientProfileId: string
      paymentId: string
      remainingAmount: number
      serviceId: string
      serviceName: string
      status: number
      totalAmount: number
      details: PaymentDetailDTO[]
    }
  }
  source: string
  exception: string | null
  errorId: string | null
  supportMessage: string | null
  statusCode: number
}
