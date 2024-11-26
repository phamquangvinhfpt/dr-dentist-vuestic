export type MedicalRecordResponse = {
  recordId: string
  patientId: string
  patientCode: string
  patientName: string
  dentistId: string
  dentistName: string
  appointmentId: string
  appointmentNotes: string
  date: string
  basicExamination: BasicExaminationRequest
  diagnosis: DiagnosisRequest
  indication: IndicationRequest
}

export type BasicExaminationRequest = {
  examinationContent: string
  treatmentPlanNote: string
}

export type DiagnosisRequest = {
  toothNumber: number
  teethConditions: string[]
}

export type IndicationRequest = {
  indicationType: string[]
  description: string
}

export type TreatmentPlanResponse = {
  treatmentPlanID: string
  procedureID: string
  procedureName: string
  startDate: string
  doctorID: string
  doctorName: string
  price: number
  discountAmount: number
  planCost: number
  planDescription: string
  step: number
  status: TreatmentPlanStatus
  hasPrescription: boolean
}

export enum TreatmentPlanStatus {
  Pending,
  Active,
  Completed,
  Cancelled,
  Rescheduled,
}

export const getStatusClass = (status: TreatmentPlanStatus) => {
  switch (status) {
    case TreatmentPlanStatus.Completed:
      return 'bg-green-100 text-green-800'
    case TreatmentPlanStatus.Active:
      return 'bg-yellow-100 text-yellow-800'
    case TreatmentPlanStatus.Pending:
      return 'bg-gray-100 text-gray-800'
    case TreatmentPlanStatus.Cancelled:
      return 'bg-red-100 text-red-800'
    case TreatmentPlanStatus.Rescheduled:
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export const getStatusText = (status: TreatmentPlanStatus) => {
  const statusMap = {
    [TreatmentPlanStatus.Pending]: 'Pending',
    [TreatmentPlanStatus.Active]: 'Active',
    [TreatmentPlanStatus.Completed]: 'Completed',
    [TreatmentPlanStatus.Cancelled]: 'Cancelled',
    [TreatmentPlanStatus.Rescheduled]: 'Rescheduled',
  }
  return statusMap[status]
}

// Phamaceutical & Prescription
export type Pharmaceutical = {
  sku: string
  webName: string
  image: string
  price: number
  measureUnitName: string
}

export type Prescription = {
  treatmentID: string
  notes: string
  itemRequests: PrescriptionItem[]
}

export type PrescriptionResponse = {
  createDate: string
  patientID: string
  patientName: string
  doctorID: string
  doctorName: string
  notes: string
  items: PrescriptionItem[]
}

export type PrescriptionItem = {
  medicineName: string
  dosage: string
  frequency: string
}

export type PaymentDetailResponse = {
  paymentResponse: PaymentResponse
  details: PaymentDetail[]
}

export type PaymentResponse = {
  paymentId: string
  patientProfileId: string
  patientName: string
  patientCode: string
  appointmentId: string
  serviceId: string
  serviceName: string
  depositAmount: number
  depositDate: string
  remainingAmount: number
  totalAmount: number
  method: PaymentMethod
  status: PaymentStatus
}

export type PaymentDetail = {
  procedureID: string
  procedureName: string
  paymentAmount: number
  paymentStatus: PaymentStatus
}

export enum PaymentStatus {
  Waiting,
  Incomplete,
  Completed,
  Canceled,
  Failed,
}

export type PayAppointmentRequest = {
  key?: string
  paymentID?: string
  appointmentId?: string
  patientCode?: string
  amount?: number
  time?: string
  method?: PaymentMethod
  isVerify?: boolean
  isPay?: boolean
  isCancel?: boolean
}

export enum PaymentMethod {
  None,
  Cash,
  BankTransfer,
}

export const getPaymentStatusText = (status: PaymentStatus) => {
  switch (status) {
    case PaymentStatus.Completed:
      return 'Completed'
    case PaymentStatus.Incomplete:
      return 'Incomplete'
    case PaymentStatus.Canceled:
      return 'Canceled'
    case PaymentStatus.Failed:
      return 'Failed'
    case PaymentStatus.Waiting:
      return 'Waiting'
    default:
      return 'Unknown'
  }
}

export const getPaymentMethodLabel = (method: PaymentMethod): string => {
  switch (method) {
    case PaymentMethod.Cash:
      return 'Cash'
    case PaymentMethod.BankTransfer:
      return 'Bank Transfer'
    default:
      return 'None'
  }
}
