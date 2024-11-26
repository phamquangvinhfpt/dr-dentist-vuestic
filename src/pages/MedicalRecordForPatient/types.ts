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
  diagnosis: {
    toothNumber: number
    teethConditions: string[]
  }
  indication: {
    indicationType: string[]
    description: string
  }
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
