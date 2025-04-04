export type Register = {
  firstName: string
  lastName: string
  email: string
  userName: string
  password: string
  isMale: boolean
  job: string
  birthDay: string
  confirmPassword: string
  phoneNumber: string
  address: string
  role?: string
}

export type ResetPassword = {
  email: string
  password: string
  token: string
  captchaToken: string
}

export type UserDetailsUpdate = {
  userId: string
  firstName: string
  lastName: string
  gender: boolean
  birthDate: string
  job: string
  address: string
}
