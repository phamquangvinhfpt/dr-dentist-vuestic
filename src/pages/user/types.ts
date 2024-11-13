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
  job: string | null
  address: string | null
  // role: RoleEnum
  doctorProfile?: DoctorProfileInfo
  patientFamily?: PatientFamilyInfor
  medicalHistory?: MedicalHistoryInfor
  PatientProfile?: PatientProfileInfor
}
export enum RoleEnum {
  Admin = 'Admin',
  Dentist = 'Dentist',
  Staff = 'Staff',
  Patient = 'Patient',
  Guest = 'Guest',
}

type PatientProfileInfor = {
  idCardNumber: string
  occupation: string
}

type DoctorProfileInfo = {
  education: string | null // Trình độ học vấn
  college: string | null // Trường học
  certification: string | null // Chứng chỉ
  yearOfExp: string | null // Số năm kinh nghiệm
  seftDescription: string | null // Mô tả bản thâns
}
type PatientFamilyInfor = {
  name: string
  phone: string
  email: string
  relationship: Rela
}

type MedicalHistoryInfor = {
  medicalname: string[]
  note: string
}

export enum Rela {
  Parent = 0,
  Spouse = 1,
  Child = 2,
  Sibling = 3,
  Other = 4,
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
  job: string | null
  address: string | null
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
}

export type DoctorDetailFormData = {
  education: string | null
  college: string | null
  certification: string | null
  yearOfExp: string | null
  seftDescription: string | null
}

export type DoctorDetailsUpdate = {
  education: string | null
  college: string | null
  certification: string | null
  yearOfExp: string | null
  seftDescription: string | null
}

// Update patientfamily
export type PatientFamilyUpdate = {
  name: string
  phone: string
  email: string
  relationship: Rela
}
//update medical history
export type MedicalHistoryUpdate = {
  medicalname: string[]
  note: string
}

// update patient profile
export type PatientProfileUpdate = {
  idCardNumber: string
  occupation: string
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
