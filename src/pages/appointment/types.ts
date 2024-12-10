import { computed } from 'vue'

export type Pagination = {
  page: number
  perPage: number
  total: number
}

export type Service = {
  serviceID: string
  name: string
  description: string
  isActive: boolean
  totalPrice: number
}

export type Search = {
  keyword?: string | null | undefined
  pageNumber?: number | null | undefined
  pageSize?: number | null | undefined
  orderBy?: string[] | null | undefined
  isActive?: boolean | null | undefined
  date?: string | null | undefined
  time?: string | null | undefined
  advancedSearch?: any
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

export type PaginationType = {
  currentPage: number
  totalPages: number
  totalCount: number
  pageSize: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export type Doctor = {
  id: string
  userName: string
  firstName: string
  lastName: string
  gender: boolean
  email: string
  phoneNumber: string
  imageUrl: string
  rating: number
  doctorProfile: DoctorDetail
  color?: string
  name?: string
}

export type DoctorDetail = {
  id: string
  doctorId: string
  education: string
  college: string
  certification: string
  yearOfExp: string
  seftDescription: string
}

export type AppointmentForm = {
  patientId: string | undefined
  dentistId?: string | null
  serviceId?: string
  appointmentDate?: string | null
  startTime?: string | null
  duration?: string
  type?: AppointmentType
  notes?: string
}

export enum AppointmentType {
  None,
  Appointment,
  FollowUp,
  ReExamination,
}

export type AppointmentDepositRequest = {
  key: string | null
  paymentID: string
  appointmentId: string
  patientCode: string | null
  amount: number
  time: string
  method: PaymentMethod
  isVerify: boolean
  isPay: boolean
  isCancel: boolean
}

export enum PaymentMethod {
  None,
  Cash,
  BankTransfer,
}

export type Appointment = {
  appointmentId: string
  patientId: string
  patientUserID?: string
  patientCode: string | null
  patientName: string | null
  patientPhone: string | null
  dentistId: string
  dentistName: string | null
  serviceId: string
  serviceName: string | null
  appointmentDate: string
  startTime: string
  duration: string
  status: AppointmentStatus
  type: AppointmentType
  notes: string | null
  paymentStatus: PaymentStatus
  servicePrice: number
  canFeedback: boolean
  isFeedback: boolean
  roomID: string
  roomName: string
}

export type FollowUpAppointment = {
  roomID: string
  roomName: string
  calendarID: string
  patientName: string
  patientCode: string
  patientProfileID: string
  doctorProfileID: string
  doctorName: string
  appointmentId: string
  serviceID: string
  serviceName: string
  procedureID: string
  procedureName: string
  date: string
  startTime: string
  endTime: string
  status: CalendarStatus
  note: string
  appointmentType: AppointmentType
  step: number
}

export enum CalendarStatus {
  Failed,
  Waiting,
  Booked,
  Completed,
  Canceled,
}

export enum AppointmentStatus {
  Failed,
  Pending,
  Confirmed,
  Come,
  Cancelled,
  Done,
}

export enum PaymentStatus {
  Waiting,
  Incomplete,
  Completed,
  Canceled,
  Failed,
}

export type StatusConfig = {
  text?: string
  bgColor?: string
  textColor?: string
  color?: string
}

export type FollowUpStatusConfig = {
  text?: string
  bgColor?: string
  textColor?: string
  color?: string
}

export const getAppointmentStatusConfig = (status: AppointmentStatus): StatusConfig => {
  switch (status) {
    case AppointmentStatus.Failed:
      return {
        text: 'Failed',
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
      }
    case AppointmentStatus.Pending:
      return {
        text: 'Pending',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
      }
    case AppointmentStatus.Confirmed:
      return {
        text: 'Confirmed',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
      }
    case AppointmentStatus.Come:
      return {
        text: 'Come',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
      }
    case AppointmentStatus.Cancelled:
      return {
        text: 'Cancelled',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800',
      }
    case AppointmentStatus.Done:
      return {
        text: 'Done',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
      }
    default:
      return {
        text: 'Unknown',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800',
      }
  }
}

export const getFollowUpStatusConfig = (status: CalendarStatus): FollowUpStatusConfig => {
  switch (status) {
    case CalendarStatus.Failed:
      return {
        text: 'Failed',
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
      }
    case CalendarStatus.Waiting:
      return {
        text: 'Waiting',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
      }
    case CalendarStatus.Booked:
      return {
        text: 'Booked',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
      }
    case CalendarStatus.Completed:
      return {
        text: 'Completed',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
      }
    case CalendarStatus.Canceled:
      return {
        text: 'Canceled',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800',
      }
    default:
      return {
        text: 'Unknown',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800',
      }
  }
}

export const getStatusConfig = (status: string | number): StatusConfig => {
  const numericStatus = typeof status === 'string' ? parseInt(status) : status

  switch (numericStatus) {
    case AppointmentStatus.Failed:
      return {
        text: 'Failed',
        color: 'danger', // red
      }
    case AppointmentStatus.Pending:
      return {
        text: 'Pending',
        color: 'warning', // yellow
      }
    case AppointmentStatus.Confirmed:
      return {
        text: 'Confirmed',
        color: 'primary', // blue
      }
    case AppointmentStatus.Come:
      return {
        text: 'Come',
        color: 'success', // green
      }
    case AppointmentStatus.Cancelled:
      return {
        text: 'Cancelled',
        color: '#f01e2c', // red
      }
    case AppointmentStatus.Done:
      return {
        text: 'Done',
        color: '#7f1f90', // purple
      }
    default:
      return {
        text: 'Unknown',
        color: 'primary',
      }
  }
}

export const getFollowUpStatus = (status: string | number): FollowUpStatusConfig => {
  const numericStatus = typeof status === 'string' ? parseInt(status) : status

  switch (numericStatus) {
    case CalendarStatus.Failed:
      return {
        text: 'Failed',
        color: 'danger', // red
      }
    case CalendarStatus.Waiting:
      return {
        text: 'Waiting',
        color: 'warning', // yellow
      }
    case CalendarStatus.Booked:
      return {
        text: 'Booked',
        color: 'primary', // blue
      }
    case CalendarStatus.Completed:
      return {
        text: 'Completed',
        color: 'success', // green
      }
    case CalendarStatus.Canceled:
      return {
        text: 'Canceled',
        color: '#7f1f90', // purple
      }
    default:
      return {
        text: 'Unknown',
        color: 'primary',
      }
  }
}

export const getPaymentStatusConfig = (status: PaymentStatus): StatusConfig => {
  switch (status) {
    case PaymentStatus.Waiting:
      return {
        text: 'Waiting',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
      }
    case PaymentStatus.Incomplete:
      return {
        text: 'Incomplete',
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-800',
      }
    case PaymentStatus.Completed:
      return {
        text: 'Completed',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
      }
    case PaymentStatus.Canceled:
      return {
        text: 'Canceled',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800',
      }
    case PaymentStatus.Failed:
      return {
        text: 'Failed',
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
      }
    default:
      return {
        text: 'Unknown',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800',
      }
  }
}

export const formatStatus = computed(() => (value: string | number) => {
  const numericStatus = typeof value === 'string' ? parseInt(value) : value
  switch (numericStatus) {
    case 0:
      return 'Failed'
    case 1:
      return 'Pending'
    case 2:
      return 'Confirmed'
    case 3:
      return 'Success'
    case 4:
      return 'Cancelled'
    default:
      return 'Unknown'
  }
})

export const getStatusText = computed(() => (value: string | number) => {
  return getStatusConfig(value).text
})

export const getStatusColor = computed(() => (value: string | number) => {
  return getStatusConfig(value).color
})

export const getFollowUpStatusText = computed(() => (value: string | number) => {
  return getFollowUpStatus(value).text
})

export const getFollowUpStatusColor = computed(() => (value: string | number) => {
  return getFollowUpStatus(value).color
})

export const getPaymentStatusText = computed(() => (value: string | number) => {
  const numericStatus = typeof value === 'string' ? parseInt(value) : value
  return getPaymentStatusConfig(numericStatus).text
})

export const getPaymentStatusColor = computed(() => (value: string | number) => {
  const numericStatus = typeof value === 'string' ? parseInt(value) : value
  return getPaymentStatusConfig(numericStatus).color
})
