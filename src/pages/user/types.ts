type DomainEvent = {
  triggeredOn: string
}
type BaseProfile = {
  id: string
  domainEvents?: DomainEvent[]
  createdBy?: string
  createdOn?: string
  lastModifiedBy?: string
  lastModifiedOn?: string
  deletedOn?: string
  deletedBy?: string
}

export type UserDetail = {
  id: string
  userName: string
  firstName: string
  lastName: string
  email: string
  isActive: boolean
  emailConfirmed: boolean
  phoneNumberConfirmed: boolean
  phoneNumber: string
  imageUrl: string | null
  birthDate: string | null
  gender: boolean
  job: string
  address: string
  // role: RoleEnum
  doctorProfile?: DoctorProfileInfo
  patientFamily?: PatientFamilyInfor
  medicalHistory?: MedicalHistoryInfor
  patientProfile?: PatientProfileInfor
}
export enum RoleEnum {
  Admin = 'Admin',
  Dentist = 'Dentist',
  Staff = 'Staff',
  Patient = 'Patient',
  Guest = 'Guest',
}

type PatientProfileInfor = {
  id: string
  userId: string
  idCardNumber: string
  occupation: string
}

type DoctorProfileInfo = {
  education: string
  college: string
  certification: string
  yearOfExp: string
  seftDescription: string
  certificationImage: string[]
  workingType: WorkingType
  typeServiceID: string
  isActive: boolean
}
type PatientFamilyInfor = {
  name: string
  phone: string
  email: string
  relationship: Rela | null
}

type MedicalHistoryInfor = {
  medicalName: string[]
  note: string
}

export enum Rela {
  Father = 0,
  Mother = 1,
  Sister = 2,
  Brother = 3,
}

export type SettingProfile = {
  id: string
  name: string
  icon: string
}

export type UserDetailFormData = {
  firstName: string
  lastName: string
  email: string
  dob: string | null
  gender: boolean | null
  phoneNumber: string
  imageUrl: string | null
  job: string
  address: string
  // role: RoleEnum
  doctorProfile?: DoctorProfileInfo
  patientFamily?: PatientFamilyInfor
  medicalHistory?: MedicalHistoryInfor
  PatientProfile?: PatientProfileInfor
}

export type PasswordDetailFormData = {
  password: string
  confirmNewPassword: string
  newPassword: string
}

export type UserDetailsUpdate = {
  firstName: string
  lastName: string
  gender: boolean | null
  birthDate: string | null
  job: string | null
  address: string | null
  doctorProfile?: DoctorProfileInfo
}

export type ChangeEmailFormData = {
  password: string
  email: string
}

export type ChangePhoneNumberFormData = {
  password: string
  phoneNumber: string
}

export type ImageAvatar = {
  name: string
  extension: string
  data: any
}

export type Avatar = {
  image: ImageAvatar
}

export type RemoveAvatar = {
  deleteCurrentImage: boolean
}

export type Role = {
  roleId: string
  roleName: string
  description: string
  enabled: boolean
}

export type User = {
  id: string
  imageUrl: string | null
  userName: string
  gender: boolean | null
  email: string
  isActive: boolean
  phoneNumber: string | null
  address: string | null
  role: Role
}

export type ListUserPagination = {
  data: User[]
  currentPage: number
  totalPages: number
  totalCount: number
  pageSize: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}
export type FilterUser = {
  pageNumber: number
  pageSize: number
  isActive: boolean
  orderBy?: string[]
}

// Types for Doctor Tuan test
export type DoctorDetail = {
  id: string
  userName: string
  firstName: string
  lastName: string
  email: string
  isActive: boolean
  emailConfirmed: boolean
  phoneNumberConfirmed: boolean
  phoneNumber: string
  imageUrl: string | null
  birthDate: string | null
  gender: boolean
  job: string | null
  address: string | null
  doctorProfile: DoctorProfile
}

export type DoctorProfile = BaseProfile & {
  doctorId: string
  education: string | null
  college: string | null
  certification: string | null
  yearOfExp: string | null
  seftDescription: string | null
  certificationImage: string[]
  workingType: WorkingType | null
  typeServiceID: string | null
  isActive: boolean
}

export type DoctorDetailFormData = {
  education: string | null
  college: string | null
  certification: string | null
  yearOfExp: string | null
  seftDescription: string | null
  certificationImage: string[]
  workingType: WorkingType | null
  typeServiceID: string | null
  isActive: boolean
}

export type DoctorDetailsUpdate = {
  education: string | null
  college: string | null
  certification: string | null
  yearOfExp: string | null
  seftDescription: string | null
  workingType: WorkingType | null
  typeServiceID: string | null
  certificationImage: string[]
  isActive: boolean
}

// Update patientfamily
export type PatientFamilyUpdate = {
  patientProfileId: string
  isUpdatePatientFamily: boolean
  patientFamily: PatientFamilyInfor
}

// update medical history
export type MedicalHistoryUpdate = {
  patientProfileId: string
  isUpdateMedicalHistory: boolean
  medicalHistory: MedicalHistoryInfor
}

// update patient profile
export type PatientProfileUpdate = {
  patientProfileId: string
  isUpdateProfile: boolean
  profile: {
    userId: string
    idCardNumber: string
    occupation: string
  }
}

export type Doctor = {
  id: string
  imageUrl: string | null
  userName: string
  gender: boolean | null
  email: string
  isActive: boolean
  phoneNumber: string | null
  address: string | null
  role: Role
  doctorProfile: DoctorProfile
}

export type ListDoctorPagination = {
  data: Doctor[]
  currentPage: number
  totalPages: number
  totalCount: number
  pageSize: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export type FilterDoctor = {
  pageNumber: number
  pageSize: number
  isActive: boolean
  orderBy?: string[]
}

export enum WorkingType {
  None = 0,
  PartTime = 1,
  FullTime = 2,
}
