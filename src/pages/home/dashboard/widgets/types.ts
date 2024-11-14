export type DoctorProfile = {
  doctorId: string
  education: string
  college: string
  certification: string
  yearOfExp: number
  seftDescription: string
}

export type Doctors = {
  id: string
  firstName: string
  lastName: string
  gender: boolean
  email: string
  phoneNumber: string
  imageUrl: string
  rating: number
  doctorProfile: DoctorProfile
}
