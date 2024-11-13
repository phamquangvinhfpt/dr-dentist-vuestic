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
  depositAmount: number
  depositTime: string
  isDeposit: boolean
}
