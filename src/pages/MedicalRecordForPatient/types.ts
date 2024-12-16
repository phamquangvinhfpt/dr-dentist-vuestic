export interface MedicalRecordDTO {
  recordId: string
  patientId: string
  patientCode: string
  patientName: string
  dentistId: string
  dentistName: string
  appointmentId: string
  appointmentNotes: string
  date: string
  basicExamination: {
    examinationContent: string
    treatmentPlanNote: string
  }
  diagnosis: Array<{
    toothNumber: number
    teethConditions: string[]
  }>
  indication: {
    indicationType: string[]
    description: string
  }
  indicationImages: Array<{
    imageUrl: string
    imageType: string
  }>
}

export type MedicalRecordListResponse = MedicalRecordDTO[]

export interface TeethCondition {
  id: number
  name: string
}

export interface IndicationType {
  id: number
  name: string
}
