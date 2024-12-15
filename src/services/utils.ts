import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/vi'
import 'dayjs/locale/en'
import duration from 'dayjs/plugin/duration'

dayjs.extend(duration)
dayjs.extend(relativeTime)
dayjs.extend(utc)
dayjs.extend(timezone)
import i18n from './../i18n'
const { t } = i18n.global
const local = i18n.global.locale.value === 'vi' ? 'vi' : 'en'

dayjs.locale(local)

const currentTimezone = dayjs.tz.guess()

export const sleep = (ms = 0) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Validation */
export const validators = {
  required: (v: any) => !!v || t('validateUtils.required'),
  required2: (fieldName: string) => (v: string) => !!v || t('validateUtils.required2', { fieldName }),

  minLength: (length: number) => (v: string) => (v && v.length >= length) || t('validateUtils.minLength', { length }),
  maxLength: (length: number) => (v: string | null) =>
    v === null || v.length <= length || t('validateUtils.maxLength', { length }),

  minValue: (min: number) => (v: string) => (v && parseFloat(v) >= min) || t('validateUtils.minValue', { min }),
  maxValue: (max: number) => (v: string) => (v && parseFloat(v) <= max) || t('validateUtils.maxValue', { max }),

  isCharacter: (fieldName: string) => (v: string) =>
    /^[\p{L} ]+$/u.test(v) || t('validateUtils.isCharacter', { fieldName }),
  isDecimalNumber: (fieldName: string) => (v: string) =>
    /^(?:-?\d+|-?\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(v) || t('validateUtils.isDecimalNumber', { fieldName }),
  isNumber: (fieldName: string) => (v: string) => /^\d+$/.test(v) || t('validateUtils.isNumber', { fieldName }),
  isAlphanumeric: (fieldName: string) => (v: string) =>
    /^[a-zA-Z0-9]+$/.test(v) || t('validateUtils.isAlphanumeric', { fieldName }),
  email: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || t('validateUtils.email'),
  phone: (v: string) => /([+84|84|0]+(3|5|7|8|9|1[2|6|8|9]))+([0-9]{8})\b/.test(v) || t('validateUtils.phone'),
  greaterThanDate: (v: Date) => v >= new Date() || t('validateUtils.greaterThanDate'),
}

export const format = {
  formatDateNoTime: (date: Date) => {
    return dayjs(date).tz(currentTimezone).format('DD/MM/YYYY')
  },
  formatDate: (date: Date) => {
    return dayjs(date).tz(currentTimezone).format('DD/MM/YYYY - HH:mm')
  },
  formatDateStr: (date: string) => {
    return dayjs(date).tz(currentTimezone).format('DD/MM/YYYY - HH:mm')
  },
  formatDateStrSec: (date: string) => {
    return dayjs(date).tz(currentTimezone).format('DD/MM/YYYY - HH:mm:ss')
  },
  formatDateFromNow: (date: Date) => {
    return dayjs(date).tz(currentTimezone).fromNow()
  },
  formatTimeToX: (date1: Date, date2: Date) => {
    const start = dayjs(date1).tz(currentTimezone)
    const end = dayjs(date2).tz(currentTimezone)
    return end.from(start, true)
  },
  getTimeString: (date: string) => {
    const dateTime = dayjs(date).tz(currentTimezone)
    const now = dayjs().tz(currentTimezone)
    if (now.diff(dateTime, 'day') >= 365) {
      return dateTime.format('DD/MM/YYYY - HH:mm')
    } else {
      return dateTime.fromNow()
    }
  },
  formatDuration: (minutes: number) => {
    const totalMilliseconds = minutes * 60 * 1000
    const durationObj = dayjs.duration(totalMilliseconds)
    const minutesPart = durationObj.minutes()
      ? `${durationObj.minutes()} minute${durationObj.minutes() > 1 ? 's' : ''}`
      : ''
    const secondsPart = durationObj.seconds()
      ? `${durationObj.seconds()} second${durationObj.seconds() > 1 ? 's' : ''}`
      : ''
    return [minutesPart, secondsPart].filter(Boolean).join(' ')
  },
  // 1.5 = 1 minute 30s
  formatDurationMinute: (minutes?: number | null) => {
    if (!minutes || minutes < 0 || minutes === null) {
      return '0 minute'
    }

    const wholeMinutes = Math.floor(minutes)
    const remainingSeconds = Math.round((minutes - wholeMinutes) * 60)

    const minutesPart = wholeMinutes > 0 ? `${wholeMinutes} minute${wholeMinutes !== 1 ? 's' : ''}` : ''

    const secondsPart = remainingSeconds > 0 ? `${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}` : ''

    return [minutesPart, secondsPart].filter(Boolean).join(' ') || '0 seconds'
  },
  // sub 2 time and return duration in minute and seconds like 2m 30s
  formatDurationToSeconds: (date1: Date, date2: Date) => {
    const start = dayjs(date1).tz(currentTimezone)
    const end = dayjs(date2).tz(currentTimezone)
    const duration = dayjs.duration(end.diff(start))
    const minutes = duration.minutes()
    const seconds = duration.seconds()
    return `${minutes}m ${seconds}s`
  },
  formatTimeDifference: (fromTime: Date, toTime: Date) => {
    // Tính toán sự khác biệt về thời gian tính bằng milliseconds
    const timeDifference = toTime.getTime() - fromTime.getTime()

    // Chuyển đổi từ milliseconds sang phút và giây
    const minutesDifference = timeDifference / 60000
    const secondsDifference = timeDifference / 1000

    if (minutesDifference >= 1) {
      return `${Math.floor(minutesDifference)} minute(s)`
    } else {
      // Ngược lại hiển thị số giây
      return `${Math.floor(secondsDifference)} seconds`
    }
  },
}

export const notifications = {
  updatedSuccessfully: (message: string) => {
    return t('validateUtils.updatedSuccessfully', { message }) + '\n'
  },
  createSuccessfully: (message: string) => {
    return t('validateUtils.createSuccessfully', { message }) + '\n'
  },
  deleteSuccessfully: (message: string) => {
    return t('validateUtils.deleteSuccessfully', { message }) + '\n'
  },
  getFailed: (message: string) => {
    return t('validateUtils.getFailed', { message }) + '\n'
  },
  updateFailed: (message: string) => {
    return t('validateUtils.updateFailed', { message }) + '\n'
  },
  createFailed: (message: string) => {
    return t('validateUtils.createFailed', { message }) + '\n'
  },
  deleteFailed: (message: string) => {
    return t('validateUtils.deleteFailed', { message }) + '\n'
  },
  unsavedChanges: t('validateUtils.unsavedChanges'),
  confirmDelete: (message: string) => {
    return t('validateUtils.confirmDelete', { message }) + '\n'
  },
  inviteSuccess: (message: string) => {
    return t('validateUtils.inviteSuccess', { message }) + '\n'
  },
  submitSuccessfully: (message: string) => {
    return t('validateUtils.submitSuccessfully', { message }) + '\n'
  },
  submitFailed: (message: string) => {
    return t('validateUtils.submitFailed', { message }) + '\n'
  },
  markSuccessfully: (message: string) => {
    return t('validateUtils.markSuccessfully', { message }) + '\n'
  },
  markFailed: (message: string) => {
    return t('validateUtils.markFailed', { message }) + '\n'
  },
  uploadSuccess: () => t('validateUtils.uploadFileSuccess') + '\n',
  uploadFailed: () => t('validateUtils.uploadFileFailed') + '\n',
  downloadSuccess: () => t('validateUtils.downloadSuccess') + '\n',
  downloadFailed: () => t('validateUtils.downloadFailed') + '\n',
}

export const getErrorMessage = (error: any) => {
  console.log(error)
  try {
    if (error.response) {
      if (error.response.data.messages.length > 0) {
        return error.response.data.messages.join(', ')
      } else {
        return error.response.data.exception
      }
    } else {
      return error.message
    }
  } catch {
    return "Can't get error message"
  }
}

export const avatarColor = (userName: string | undefined) => {
  if (!userName) return 'primary'
  const colors = ['primary', '#FFD43A', '#ADFF00', '#262824', 'danger']
  const index = userName.charCodeAt(0) % colors.length
  return colors[index]
}

export const getSrcAvatar = (img: any) => {
  const url = import.meta.env.VITE_APP_BASE_URL as string
  const url_without_api = url.slice(0, -3)
  if (img) return `${url_without_api}${img}`
  return ''
}
