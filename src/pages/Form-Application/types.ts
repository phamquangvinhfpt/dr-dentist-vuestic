export enum LeaveType {
  ALL_DAY = 'ALL_DAY',
  TIME_SLOT = 'TIME_SLOT',
}

export interface ApplicationFormRequest {
  userID: string
  calendarID: string
  timeID?: string
  description: string
  leaveType: LeaveType
}

export interface ApplicationFormResponse {
  success: boolean
  message: string
  data?: any
}

export interface FilterForm {
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
  }
}

export interface FormDTO {
  formID: string
  userID: string
  name: string
  calendarID: string
  workingDate: string
  workingTimes: WorkingTime[]
  description: string
  note: string
  status: number
}

export interface WorkingTime {
  timeID: string
  startTime: string
  endTime: string
  isActive: boolean
}

export interface ListFormPagination {
  data: FormDTO[]
  currentPage: number
  totalPages: number
  totalCount: number
  pageSize: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export interface CalendarOption {
  calendarID: string
  workingDate: string
  roomName: string
}

export interface ToggleFormStatusRequest {
  formID: string
  status: number
  note: string
}

export interface ToggleFormStatusResponse {
  success: boolean
  message: string
  data?: any
  statusCode?: number
  errorId?: string
}

export interface SelectedForm {
  formID: string
  status: number
  note: string
}
