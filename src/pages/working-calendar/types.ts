export type Pagination = {
  page: number
  perPage: number
  total: number
}

export type Search = {
  keyword?: string | null | undefined
  pageNumber?: number | null | undefined
  pageSize?: number | null | undefined
  orderBy?: string[] | null | undefined
  isActive?: boolean | null | undefined
  date?: string | null | undefined
  time?: string | null | undefined
}

export type SearchResponse = {
  data: any[]
  currentPage: number
  totalPages: number
  totalCount: number
  pageSize: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export type CalendarDay = {
  date: number
  isCurrentMonth: boolean
  events: any[]
}

export type PartTimeSchedule = {
  date: Date
  time: string
}

export interface WorkingTime {
  timeID: string
  startTime: string
  endTime: string
  isActive: boolean
}

export interface WorkingCalendar {
  calendarID: string
  workingDate: string
  workingTimes: WorkingTime[]
  isActive: boolean
  roomName: string
  workingStatus: number
}
