export type Service = {
  id: string
  serviceName: string
  serviceDescription: string
  isActive: boolean
  totalPrice: number
}

export type ServiceResponse = {
  data: Service[]
  currentPage: number
  totalPages: number
  totalCount: number
  pageSize: number
  hasPreviousPage: boolean
  hasNextPage: boolean
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
  patientCode: string | null
  patientName: string | null
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
}

export type AppointmentResponse = {
  data: Appointment[]
  currentPage: number
  totalPages: number
  totalCount: number
  pageSize: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export enum AppointmentStatus {
  Failed,
  Pending,
  Confirmed,
  Success,
  Cancelled,
}

export enum PaymentStatus {
  Waiting,
  Incomplete,
  Completed,
  Canceled,
  Failed,
}
