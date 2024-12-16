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
  doctorProfile?: {
    doctorID: string
    education: string
    college: string
    certification: string
    yearOfExp: string
    seftDescription: string
  }
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
  specialty?: string
  phone?: string
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

export interface Doctor {
  id: string | number
  name: string
  specialty: string
  experience: string
  image?: string
  rating: number
  doctorProfile?: {
    specialty?: string
    yearOfExp?: number
  }
}

export interface DoctorApiResponse {
  id: string
  userName: string
  firstName: string
  lastName: string
  gender: boolean
  email: string
  phoneNumber: string
  imageUrl: string
  rating: number
  totalFeedback: number
  doctorProfile?: {
    id: string
    domainEvents?: Array<{
      triggeredOn: string
    }>
    createdBy: string
    createdOn: string
    lastModifiedBy: string
    lastModifiedOn: string
    deletedOn?: string
    deletedBy?: string
    doctorId: string
    typeServiceID: string
    education: string
    college: string
    certification: string
    certificationImage: string[]
    yearOfExp: string
    seftDescription: string
    workingType: number
    isActive: boolean
  }
  doctorFeedback?: Array<{
    ratingType: number
    totalRating: number
    feedbacks: Array<{
      serviceID: string
      serviceName: string
      patientID: string
      patientName: string
      createDate: string
      ratings: number
      message: string
    }>
  }>
}

export interface DoctorProfile {
  specialty?: string
  yearOfExp?: number
  rating?: number
}

export interface DoctorResponse {
  id: string | number
  firstName: string
  lastName: string
  imageUrl?: string
  doctorProfile?: DoctorProfile
}
